const Report = require('../models/Report');
const User = require('../models/User');

// @route  GET /api/dashboard/summary?weekStart=YYYY-MM-DD   (manager)
exports.getSummary = async (req, res, next) => {
  try {
    const { weekStart } = req.query;
    const filter = weekStart ? { weekStartDate: new Date(weekStart) } : {};

    const totalMembers = await User.countDocuments({ role: 'member' });
    const reports = await Report.find(filter);

    const submittedCount = reports.filter((r) => r.status !== 'draft').length;
    const complianceRate = totalMembers > 0
      ? Math.round((submittedCount / totalMembers) * 100)
      : 0;
    const openBlockers = reports.filter((r) => r.blockers && r.blockers.trim() !== '').length;

    res.status(200).json({
      totalReportsSubmitted: submittedCount,
      totalMembers,
      complianceRate,
      openBlockers,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/dashboard/trend   (manager) - tasksCompleted count per week, team-wide
exports.getTrend = async (req, res, next) => {
  try {
    const trend = await Report.aggregate([
      { $match: { status: { $ne: 'draft' } } },
      {
        $group: {
          _id: '$weekStartDate',
          reportsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({ trend });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/dashboard/status-by-member?weekStart=YYYY-MM-DD   (manager)
exports.getStatusByMember = async (req, res, next) => {
  try {
    const { weekStart } = req.query;
    if (!weekStart) return res.status(400).json({ message: 'weekStart query param is required' });

    const members = await User.find({ role: 'member' }).select('name');
    const reports = await Report.find({ weekStartDate: new Date(weekStart) });

    const reportByUser = {};
    reports.forEach((r) => { reportByUser[r.userId.toString()] = r.status; });

    const data = members.map((m) => ({
      name: m.name,
      status: reportByUser[m._id.toString()] || 'pending',
    }));

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/dashboard/workload-by-project   (manager)
exports.getWorkloadByProject = async (req, res, next) => {
  try {
    const data = await Report.aggregate([
      { $match: { status: { $ne: 'draft' } } },
      {
        $group: {
          _id: '$projectId',
          reportCount: { $sum: 1 },
          totalHours: { $sum: { $ifNull: ['$hoursWorked', 0] } },
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },
      {
        $project: {
          _id: 0,
          projectName: '$project.name',
          reportCount: 1,
          totalHours: 1,
        },
      },
    ]);

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/dashboard/activity   (manager) - recent reports feed
exports.getRecentActivity = async (req, res, next) => {
  try {
    const reports = await Report.find({ status: { $ne: 'draft' } })
      .populate('userId', 'name')
      .populate('projectId', 'name')
      .sort({ submittedAt: -1 })
      .limit(10);

    res.status(200).json({ reports });
  } catch (error) {
    next(error);
  }
};