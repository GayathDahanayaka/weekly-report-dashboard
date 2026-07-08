const express = require('express');
const { body } = require('express-validator');
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const projectRouter = express.Router();

projectRouter.use(authMiddleware); // every route below requires login

projectRouter.get('/', getProjects);

projectRouter.post(
  '/',
  roleMiddleware('manager'),
  [body('name').trim().notEmpty().withMessage('Project name is required')],
  createProject
);

projectRouter.put(
  '/:id',
  roleMiddleware('manager'),
  [body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty')],
  updateProject
);

projectRouter.delete('/:id', roleMiddleware('manager'), deleteProject);

module.exports = projectRouter;
