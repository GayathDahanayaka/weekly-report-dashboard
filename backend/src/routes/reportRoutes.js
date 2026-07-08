const express = require('express');
const { body } = require('express-validator');
const {
  createReport,
  updateReport,
  submitReport,
  getMyReports,
  getAllReports,
  getSubmissionStatus,
} = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const reportRouter = express.Router();

reportRouter.use(authMiddleware);

// member routes
reportRouter.post(
  '/',
  roleMiddleware('member'),
  [
    body('projectId').notEmpty().withMessage('Project is required'),
    body('weekStartDate').isISO8601().withMessage('Valid weekStartDate is required'),
    body('weekEndDate').isISO8601().withMessage('Valid weekEndDate is required'),
    body('tasksCompleted').trim().notEmpty().withMessage('Tasks completed is required'),
    body('tasksPlanned').trim().notEmpty().withMessage('Tasks planned is required'),
  ],
  createReport
);
reportRouter.put('/:id', updateReport);
reportRouter.post('/:id/submit', roleMiddleware('member'), submitReport);
reportRouter.get('/me', roleMiddleware('member'), getMyReports);

// manager routes
reportRouter.get('/', roleMiddleware('manager'), getAllReports);
reportRouter.get('/status', roleMiddleware('manager'), getSubmissionStatus);

module.exports = reportRouter;
