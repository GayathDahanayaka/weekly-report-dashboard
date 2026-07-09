const Report = require('../models/Report');
const Project = require('../models/Project');
const User = require('../models/User');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function currentWeekMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return d.toISOString().slice(0, 10);
}

function buildSystemPrompt() {
  const today = new Date().toISOString().slice(0, 10);
  const thisWeekMonday = currentWeekMonday();

  return `You are an assistant embedded in a team's Weekly Report Dashboard, helping a manager understand what their team has been doing.

Today's actual date is ${today}. The current reporting week starts on ${thisWeekMonday} (a Monday). Always use this real date - not any date you might otherwise assume - when interpreting "this week", "last week", "right now", "currently", etc. Weeks run Monday to Sunday.

Rules:
- Always use the provided tools to fetch real data before answering a question about reports, members, projects, blockers, or workload. Never invent or guess report content.
- If a tool returns no matching data, say so plainly - don't fabricate an answer.
- Be concise and specific: name the actual people, projects, and weeks the data refers to.
- If a question is ambiguous (e.g. "last week" without context), make a reasonable assumption based on today's real date above and state it, rather than asking the user to clarify.
- You cannot take any action (edit, delete, submit reports) - you are read-only and for analysis and summarization only.`;
}

const tools = [
  {
    function_declarations: [
      {
        name: 'get_reports',
        description:
          "Fetch weekly report entries, optionally filtered by team member name, project name, and/or week start date (YYYY-MM-DD, a Monday). Use this to answer questions about what someone worked on, their blockers, or plans for a specific week. Returns up to 25 matching reports.",
        parameters: {
          type: 'object',
          properties: {
            memberName: { type: 'string', description: 'Team member name to filter by, partial match allowed (e.g. "Kasun")' },
            projectName: { type: 'string', description: 'Project/category name to filter by, partial match allowed' },
            weekStart: { type: 'string', description: 'Week start date in YYYY-MM-DD format (a Monday)' },
          },
        },
      },
      {
        name: 'get_team_summary',
        description:
          'Get aggregate team statistics: submission compliance, open blockers count, and workload (report count + hours) per project. Optionally scoped to one week. Use this for "how is the team doing" or workload-imbalance style questions.',
        parameters: {
          type: 'object',
          properties: {
            weekStart: { type: 'string', description: 'Week start date in YYYY-MM-DD format (a Monday). Omit for all-time stats.' },
          },
        },
      },
    ],
  },
];

async function runGetReports({ memberName, projectName, weekStart } = {}) {
  const filter = {};

  if (memberName) {
    const users = await User.find({ name: { $regex: memberName, $options: 'i' } }).select('_id');
    filter.userId = { $in: users.map((u) => u._id) };
  }
  if (projectName) {
    const projects = await Project.find({ name: { $regex: projectName, $options: 'i' } }).select('_id');
    filter.projectId = { $in: projects.map((p) => p._id) };
  }
  if (weekStart) {
    const dayStart = new Date(weekStart);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    filter.weekStartDate = { $gte: dayStart, $lt: dayEnd };
  }

  const reports = await Report.find(filter)
    .populate('userId', 'name')
    .populate('projectId', 'name')
    .sort({ weekStartDate: -1 })
    .limit(25);

  return {
    reports: reports.map((r) => ({
      member: r.userId?.name,
      project: r.projectId?.name,
      weekStart: r.weekStartDate.toISOString().slice(0, 10),
      status: r.status,
      tasksCompleted: r.tasksCompleted,
      tasksPlanned: r.tasksPlanned,
      blockers: r.blockers || null,
      hoursWorked: r.hoursWorked,
    })),
  };
}

async function runGetTeamSummary({ weekStart } = {}) {
  const filter = {};
  if (weekStart) {
    const dayStart = new Date(weekStart);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    filter.weekStartDate = { $gte: dayStart, $lt: dayEnd };
  }

  const totalMembers = await User.countDocuments({ role: 'member' });
  const reports = await Report.find(filter).populate('userId', 'name').populate('projectId', 'name');
  const submitted = reports.filter((r) => r.status !== 'draft');

  const blockers = submitted
    .filter((r) => r.blockers && r.blockers.trim())
    .map((r) => ({ member: r.userId?.name, project: r.projectId?.name, blocker: r.blockers }));

  const workloadMap = {};
  submitted.forEach((r) => {
    const key = r.projectId?.name || 'Unassigned';
    workloadMap[key] = workloadMap[key] || { reportCount: 0, totalHours: 0 };
    workloadMap[key].reportCount += 1;
    workloadMap[key].totalHours += r.hoursWorked || 0;
  });

  return {
    scope: weekStart ? `week of ${weekStart}` : 'all time',
    totalMembers,
    reportsSubmitted: submitted.length,
    complianceRate: totalMembers ? Math.round((submitted.length / totalMembers) * 100) : 0,
    openBlockers: blockers,
    workloadByProject: workloadMap,
  };
}

async function executeTool(name, args) {
  if (name === 'get_reports') return runGetReports(args);
  if (name === 'get_team_summary') return runGetTeamSummary(args);
  return { error: `Unknown tool: ${name}` };
}

async function callGemini(contents) {
  if (!GEMINI_API_KEY) {
    const err = new Error('GEMINI_API_KEY is not set on the server');
    err.statusCode = 500;
    throw err;
  }

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      tools,
      systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
    }),
  });

  if (!res.ok) {
    let friendlyMessage = 'The assistant could not be reached. Please try again.';

    if (res.status === 429) {
      friendlyMessage = "The assistant has hit today's free usage limit. Please wait a bit and try again.";
    } else if (res.status === 403) {
      friendlyMessage = 'The assistant is not authorized to run right now. Check the server configuration.';
    } else if (res.status >= 500) {
      friendlyMessage = 'The assistant service is temporarily unavailable. Please try again shortly.';
    }

    // Keep the raw Gemini error out of the response body (it's noisy JSON
    // meant for developers), but still log it server-side for debugging.
    const rawText = await res.text();
    console.error(`Gemini API error (${res.status}):`, rawText.slice(0, 500));

    const err = new Error(friendlyMessage);
    err.statusCode = res.status === 429 ? 429 : 502;
    throw err;
  }

  return res.json();
}

function getParts(data) {
  return data?.candidates?.[0]?.content?.parts || [];
}

// @route  POST /api/ai/chat   (manager only)
exports.chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'A message string is required' });
    }

    let contents = [...(history || []), { role: 'user', parts: [{ text: message }] }];

    let data = await callGemini(contents);
    let parts = getParts(data);
    let functionCalls = parts.filter((p) => p.functionCall);
    let loops = 0;

    while (functionCalls.length && loops < 4) {
      contents.push({ role: 'model', parts });

      const responseParts = [];
      for (const fc of functionCalls) {
        const result = await executeTool(fc.functionCall.name, fc.functionCall.args || {});
        responseParts.push({
          functionResponse: { name: fc.functionCall.name, response: result },
        });
      }
      contents.push({ role: 'user', parts: responseParts });

      data = await callGemini(contents);
      parts = getParts(data);
      functionCalls = parts.filter((p) => p.functionCall);
      loops += 1;
    }

    contents.push({ role: 'model', parts });

    const replyText = parts.filter((p) => p.text).map((p) => p.text).join('\n') || 'I could not generate a response.';

    res.status(200).json({ reply: replyText, history: contents });
  } catch (error) {
    next(error);
  }
};