// backend/routes/modules/cfilRoutes.js
const express = require('express');
const router = express.Router();
const cfilController = require('../../controllers/modules/cfilController');
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

router.post('/conversations/start', cfilController.startConversation);
router.get('/conversations', cfilController.getUserConversations);
router.get('/conversations/:conversationId', cfilController.getConversationHistory);
router.post('/conversations/:conversationId/messages', cfilController.sendMessage);
router.post('/messages/:messageId/feedback', cfilController.sendFeedback);

module.exports = router;