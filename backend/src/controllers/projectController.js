const { validationResult } = require('express-validator');
const Project = require('../models/Project');

// @route  POST /api/projects   (manager only)
exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
    });
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/projects   (any authenticated user)
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ isActive: true })
      .populate('assignedMembers', 'name email')
      .sort({ name: 1 });
    res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/projects/:id/assign   (manager only) - set which members are assigned to this project
exports.assignMembers = async (req, res, next) => {
  try {
    const { memberIds } = req.body; // array of User _id
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { assignedMembers: memberIds || [] },
      { new: true }
    ).populate('assignedMembers', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/projects/:id   (manager only)
exports.updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description, isActive } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive },
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/projects/:id   (manager only)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.status(200).json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};
