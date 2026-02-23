// backend/controllers/modules/cfilController.js
const db = require('../../config/database');
const cfilService = require('../../services/modules/cfilService');
const { v4: uuidv4 } = require('uuid');

// Iniciar nueva conversación
exports.startConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = uuidv4();
        
        const [result] = await db.query(
            `INSERT INTO conversations 
             (user_id, session_id, title, status, context) 
             VALUES (?, ?, ?, 'active', ?)`,
            [userId, sessionId, 'Nueva conversación', JSON.stringify({})]
        );
        
        // Mensaje de bienvenida
        const welcomeMessage = await cfilService.getWelcomeMessage();
        
        await db.query(
            `INSERT INTO messages 
             (conversation_id, sender, content, message_type) 
             VALUES (?, 'bot', ?, 'text')`,
            [result.insertId, welcomeMessage]
        );
        
        res.status(201).json({
            conversationId: result.insertId,
            sessionId,
            welcomeMessage
        });
        
    } catch (error) {
        console.error('Error iniciando conversación:', error);
        res.status(500).json({ error: 'Error al iniciar conversación' });
    }
};

// Enviar mensaje
exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;
        const { message } = req.body;
        
        // Verificar conversación
        const [conversations] = await db.query(
            'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
            [conversationId, userId]
        );
        
        if (conversations.length === 0) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }
        
        const conversation = conversations[0];
        
        // Guardar mensaje del usuario
        await db.query(
            `INSERT INTO messages 
             (conversation_id, sender, content, message_type) 
             VALUES (?, 'user', ?, 'text')`,
            [conversationId, message]
        );
        
        // Obtener historial reciente
        const [history] = await db.query(
            `SELECT sender, content FROM messages 
             WHERE conversation_id = ? 
             ORDER BY created_at DESC LIMIT 10`,
            [conversationId]
        );
        
        // Obtener datos financieros del usuario para contexto
        const [profiles] = await db.query(
            'SELECT * FROM user_profiles WHERE user_id = ?',
            [userId]
        );
        
        const [transactions] = await db.query(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 5',
            [userId]
        );
        
        // Generar respuesta con IA
        const response = await cfilService.generateResponse(
            message,
            history.reverse(),
            profiles[0] || {},
            transactions,
            conversation.context
        );
        
        // Guardar respuesta del bot
        const [result] = await db.query(
            `INSERT INTO messages 
             (conversation_id, sender, content, message_type, intent, confidence_score) 
             VALUES (?, 'bot', ?, ?, ?, ?)`,
            [conversationId, response.content, response.type, 
             response.intent, response.confidence]
        );
        
        // Guardar explicación si existe
        if (response.explanation) {
            await db.query(
                `INSERT INTO ai_explanations 
                 (message_id, explanation_type, simplified_explanation, 
                  key_factors, confidence_factors) 
                 VALUES (?, ?, ?, ?, ?)`,
                [result.insertId, response.explanation.type,
                 response.explanation.simplified,
                 JSON.stringify(response.explanation.keyFactors),
                 JSON.stringify(response.explanation.confidenceFactors)]
            );
        }
        
        // Actualizar contexto de conversación
        const updatedContext = {
            ...JSON.parse(conversation.context || '{}'),
            lastTopic: response.intent,
            messageCount: (JSON.parse(conversation.context || '{}').messageCount || 0) + 1
        };
        
        await db.query(
            'UPDATE conversations SET context = ? WHERE id = ?',
            [JSON.stringify(updatedContext), conversationId]
        );
        
        res.json({
            response: response.content,
            type: response.type,
            intent: response.intent,
            explanation: response.explanation,
            suggestions: response.suggestions
        });
        
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        res.status(500).json({ error: 'Error al procesar mensaje' });
    }
};

// Obtener historial de conversación
exports.getConversationHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;
        
        const [messages] = await db.query(
            `SELECT m.*, e.simplified_explanation as explanation
             FROM messages m
             LEFT JOIN ai_explanations e ON m.id = e.message_id
             WHERE m.conversation_id = ?
             ORDER BY m.created_at ASC`,
            [conversationId]
        );
        
        res.json({ messages });
        
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
};

// Enviar feedback
exports.sendFeedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const { messageId } = req.params;
        const { rating, helpful, feedback } = req.body;
        
        await db.query(
            `INSERT INTO message_feedback 
             (message_id, user_id, rating, helpful, feedback_text) 
             VALUES (?, ?, ?, ?, ?)`,
            [messageId, userId, rating, helpful, feedback]
        );
        
        res.json({ message: 'Feedback recibido' });
        
    } catch (error) {
        console.error('Error enviando feedback:', error);
        res.status(500).json({ error: 'Error al enviar feedback' });
    }
};

// Obtener conversaciones del usuario
exports.getUserConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [conversations] = await db.query(
            `SELECT c.*, 
                    (SELECT content FROM messages WHERE conversation_id = c.id 
                     ORDER BY created_at DESC LIMIT 1) as last_message,
                    COUNT(m.id) as message_count
             FROM conversations c
             LEFT JOIN messages m ON c.id = m.conversation_id
             WHERE c.user_id = ?
             GROUP BY c.id
             ORDER BY c.updated_at DESC`,
            [userId]
        );
        
        res.json({ conversations });
        
    } catch (error) {
        console.error('Error obteniendo conversaciones:', error);
        res.status(500).json({ error: 'Error al obtener conversaciones' });
    }
};