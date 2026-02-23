// backend/controllers/modules/pfseController.js
const db = require('../../config/database');
const pfseService = require('../../services/modules/pfseService');

// Obtener estrategias del usuario
exports.getUserStrategies = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, type } = req.query;
        
        let query = 'SELECT * FROM financial_strategies WHERE user_id = ?';
        const params = [userId];
        
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }
        
        query += ' ORDER BY priority DESC, created_at DESC';
        
        const [strategies] = await db.query(query, params);
        res.json({ strategies });
        
    } catch (error) {
        console.error('Error obteniendo estrategias:', error);
        res.status(500).json({ error: 'Error al obtener estrategias' });
    }
};

// Crear nueva estrategia
exports.createStrategy = async (req, res) => {
    try {
        const userId = req.user.id;
        const strategyData = req.body;
        
        const [result] = await db.query(
            `INSERT INTO financial_strategies 
             (user_id, name, type, priority, description, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, strategyData.name, strategyData.type, 
             strategyData.priority || 1, strategyData.description, 'active']
        );
        
        res.status(201).json({
            message: 'Estrategia creada exitosamente',
            strategyId: result.insertId
        });
        
    } catch (error) {
        console.error('Error creando estrategia:', error);
        res.status(500).json({ error: 'Error al crear estrategia' });
    }
};

// Generar recomendaciones prescriptivas
exports.generatePrescriptions = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Obtener perfil financiero del usuario
        const [profiles] = await db.query(
            'SELECT * FROM user_profiles WHERE user_id = ?',
            [userId]
        );
        
        // Obtener transacciones recientes
        const [transactions] = await db.query(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 50',
            [userId]
        );
        
        // Obtener estrategias activas
        const [strategies] = await db.query(
            'SELECT * FROM financial_strategies WHERE user_id = ? AND status = "active"',
            [userId]
        );
        
        const userProfile = profiles[0] || {};
        
        // Generar prescripciones usando el servicio
        const prescriptions = await pfseService.generatePrescriptions(
            userProfile,
            transactions,
            strategies
        );
        
        // Guardar prescripciones en BD
        for (const presc of prescriptions) {
            await db.query(
                `INSERT INTO prescriptions 
                 (user_id, strategy_id, title, description, action_type, 
                  target_amount, deadline, priority, behavioral_insight, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [userId, presc.strategyId, presc.title, presc.description,
                 presc.actionType, presc.targetAmount, presc.deadline,
                 presc.priority, presc.behavioralInsight]
            );
        }
        
        res.json({
            message: 'Prescripciones generadas',
            prescriptions
        });
        
    } catch (error) {
        console.error('Error generando prescripciones:', error);
        res.status(500).json({ error: 'Error al generar prescripciones' });
    }
};

// Aceptar/Rechazar prescripción
exports.updatePrescriptionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { status } = req.body;
        
        await db.query(
            `UPDATE prescriptions 
             SET status = ?, completed_at = IF(? = 'completed', NOW(), NULL)
             WHERE id = ? AND user_id = ?`,
            [status, status, id, userId]
        );
        
        res.json({ message: `Prescripción ${status}` });
        
    } catch (error) {
        console.error('Error actualizando prescripción:', error);
        res.status(500).json({ error: 'Error al actualizar prescripción' });
    }
};

// Obtener métricas de comportamiento
exports.getBehavioralMetrics = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [metrics] = await db.query(
            'SELECT * FROM behavioral_metrics WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 10',
            [userId]
        );
        
        res.json({ metrics });
        
    } catch (error) {
        console.error('Error obteniendo métricas:', error);
        res.status(500).json({ error: 'Error al obtener métricas' });
    }
};