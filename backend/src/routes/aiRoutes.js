const express = require('express');
const { chat } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const aiRouter = express.Router();

aiRouter.post('/chat', authMiddleware, roleMiddleware('manager'), chat);

module.exports = aiRouter;
