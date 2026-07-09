const { validationResult } = require('express-validator');
const Report = require('../models/Report');
const User = require('../models/User');
const { isPastDeadline } = require('../utils/weekDeadline');

// @route  POST /api/reports   (member - creates own report)
exports.createReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      projectId,
      weekStartDate,
      weekEndDate,
      tasksCompleted,
      tasksPlanned,
      blockers,
      hoursWorked,
      notes,
    } = req.body;

    const report = await Report.create({
      userId: req.user.id,
      projectId,
      weekStartDate,
      weekEndDate,
      tasksCompleted,
      tasksPlanned,
      blockers,
      hoursWorked,
      notes,
      status: 'draft',
    });

    res.status(201).json({ report });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/reports/:id   (member - only own report, only before it's submitted... editable per your design, kept open here)
exports.updateReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.userId.toString() !== req.user.id && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'You can only edit your own report' });
    }

    const fields = [
      'projectId', 'weekStartDate', 'weekEndDate', 'tasksCompleted',
      'tasksPlanned', 'blockers', 'hoursWorked', 'notes',
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) report[f] = req.body[f];
    });

    await report.save();
    res.status(200).json({ report });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/reports/:id/submit   (member - marks own report submitted, computes late)
exports.submitReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only submit your own report' });
    }

    const now = new Date();
    const isLate = isPastDeadline(report.weekStartDate, now);

    report.status = isLate ? 'late' : 'submitted';
    report.submittedAt = now;
    await report.save();

    res.status(200).json({ report });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/reports/me   (member - own report history)
exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ userId: req.user.id })
      .populate('projectId', 'name')
      .sort({ weekStartDate: -1 });
    res.status(200).json({ reports });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/reports   (manager - all reports, filterable)
// query params: member, project, from, to, week
// "week" filters to a single week (its Monday, YYYY-MM-DD). "from"/"to" are
// an explicit custom range and take priority over "week" when either is set.
exports.getAllReports = async (req, res, next) => {
  try {
    const { member, project, from, to, week } = req.query;
    const filter = {};

    if (member) filter.userId = member;
    if (project) filter.projectId = project;

    if (from || to) {
      filter.weekStartDate = {};
      if (from) filter.weekStartDate.$gte = new Date(from);
      if (to) filter.weekStartDate.$lte = new Date(to);
    } else if (week) {
      const dayStart = new Date(week);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      filter.weekStartDate = { $gte: dayStart, $lt: dayEnd };
    }

    const reports = await Report.find(filter)
      .populate('userId', 'name email')
      .populate('projectId', 'name')
      .sort({ weekStartDate: -1 });

    res.status(200).json({ reports });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/reports/status?weekStart=YYYY-MM-DD   (manager - submission status per member for a week)
exports.getSubmissionStatus = async (req, res, next) => {
  try {
    const { weekStart } = req.query;
    if (!weekStart) {
      return res.status(400).json({ message: 'weekStart query param is required' });
    }

    const dayStart = new Date(weekStart);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const members = await User.find({ role: 'member' }).select('name email');
    const reports = await Report.find({ weekStartDate: { $gte: dayStart, $lt: dayEnd } });

    // A draft doesn't count as fulfilling the week - only submitted/late do.
    const reportByUser = {};
    reports.forEach((r) => {
      if (r.status === 'submitted' || r.status === 'late') {
        reportByUser[r.userId.toString()] = r.status;
      }
    });

    const pastDeadline = isPastDeadline(dayStart);

    const statusList = members.map((m) => ({
      userId: m._id,
      name: m.name,
      email: m.email,
      status: reportByUser[m._id.toString()] || (pastDeadline ? 'late' : 'pending'),
    }));

    res.status(200).json({ week: weekStart, statusList });
  } catch (error) {
    next(error);
  }
};