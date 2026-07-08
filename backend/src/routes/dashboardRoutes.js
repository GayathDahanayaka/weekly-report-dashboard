const express = require('express');
const {
  getSummary,
  getTrend,
  getStatusByMember,
  getWorkloadByProject,
  getRecentActivity,
  getTeamMembers,
} = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const dashboardRouter = express.Router();

dashboardRouter.use(authMiddleware, roleMiddleware('manager'));

dashboardRouter.get('/members', getTeamMembers);
dashboardRouter.get('/summary', getSummary);
dashboardRouter.get('/trend', getTrend);
dashboardRouter.get('/status-by-member', getStatusByMember);
dashboardRouter.get('/workload-by-project', getWorkloadByProject);
dashboardRouter.get('/activity', getRecentActivity);

module.exports = dashboardRouter;
