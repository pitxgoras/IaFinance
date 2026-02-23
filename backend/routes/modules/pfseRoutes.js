const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const authMiddleware = require('../../middleware/auth');

// ============================================
// CONFIGURACIÓN PARA PRUEBAS - AUTENTICACIÓN DESACTIVADA
// ============================================

// COMENTADO TEMPORALMENTE PARA PRUEBAS
// router.use(authMiddleware);

// USUARIO FIJO PARA PRUEBAS (ID 1 = Administrador)
router.use((req, res, next) => {
    req.user = { id: 1 }; // Usuario administrador con ID 1
    console.log('👤 Usuario de prueba fijo - ID:', req.user.id);
    next();
});

// ============================================
// ESTRATEGIAS FINANCIERAS
// ============================================

// Obtener todas las estrategias del usuario
router.get('/strategies', async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('📥 GET /strategies - Usuario:', userId);
        
        const [strategies] = await db.query(
            'SELECT * FROM financial_strategies WHERE user_id = ? ORDER BY priority DESC, created_at DESC',
            [userId]
        );
        
        res.json({ strategies });
    } catch (error) {
        console.error('❌ Error getting strategies:', error);
        res.status(500).json({ error: error.message });
    }
});

// Crear nueva estrategia
router.post('/strategies', async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, type, priority, description } = req.body;
        
        console.log('📥 POST /strategies - Usuario:', userId);
        console.log('📥 Datos recibidos:', { name, type, priority, description });
        
        if (!name || !type) {
            console.log('❌ Faltan campos requeridos');
            return res.status(400).json({ error: 'Nombre y tipo son requeridos' });
        }

        console.log('🔄 Intentando insertar en BD...');
        
        const [result] = await db.query(
            'INSERT INTO financial_strategies (user_id, name, type, priority, description, status) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, name, type, priority || 1, description || '', 'active']
        );
        
        console.log('✅ Estrategia creada con ID:', result.insertId);
        
        res.status(201).json({
            message: 'Estrategia creada',
            strategyId: result.insertId
        });
    } catch (error) {
        console.error('❌ Error completo:', error);
        console.error('❌ Mensaje:', error.message);
        console.error('❌ Código:', error.code);
        res.status(500).json({ 
            error: error.message,
            code: error.code 
        });
    }
});

// Actualizar estrategia
router.put('/strategies/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { name, type, priority, description, status } = req.body;
        
        const [result] = await db.query(
            'UPDATE financial_strategies SET name = ?, type = ?, priority = ?, description = ?, status = ? WHERE id = ? AND user_id = ?',
            [name, type, priority, description, status, id, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Estrategia no encontrada' });
        }
        
        res.json({ message: 'Estrategia actualizada' });
    } catch (error) {
        console.error('❌ Error updating strategy:', error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar estrategia
router.delete('/strategies/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        const [result] = await db.query(
            'DELETE FROM financial_strategies WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Estrategia no encontrada' });
        }
        
        res.json({ message: 'Estrategia eliminada' });
    } catch (error) {
        console.error('❌ Error deleting strategy:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PRESCRIPCIONES (RECOMENDACIONES)
// ============================================

// Obtener prescripciones del usuario
router.get('/prescriptions', async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('📥 GET /prescriptions - Usuario:', userId);
        
        const [prescriptions] = await db.query(
            'SELECT * FROM prescriptions WHERE user_id = ? ORDER BY priority DESC, created_at DESC',
            [userId]
        );
        
        res.json({ prescriptions });
    } catch (error) {
        console.error('❌ Error getting prescriptions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generar nuevas prescripciones (recomendaciones con IA)
router.post('/prescriptions/generate', async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('📥 POST /prescriptions/generate - Usuario:', userId);
        
        // Obtener perfil financiero del usuario
        const [profiles] = await db.query(
            'SELECT * FROM user_profiles WHERE user_id = ?',
            [userId]
        );
        
        // Obtener transacciones recientes
        const [transactions] = await db.query(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 20',
            [userId]
        );
        
        const userProfile = profiles[0] || {
            monthly_income: 2500,
            monthly_expenses: 1800,
            total_savings: 3000,
            total_debt: 5000
        };
        
        console.log('📊 Perfil del usuario:', userProfile);
        
        // Generar recomendaciones basadas en datos
        const recommendations = [];
        
        // Recomendación de ahorro
        const savingRate = userProfile.monthly_income > 0 
            ? ((userProfile.monthly_income - userProfile.monthly_expenses) / userProfile.monthly_income) * 100 
            : 0;
        
        if (savingRate < 20) {
            recommendations.push({
                title: 'Aumenta tu tasa de ahorro',
                description: `Actualmente ahorras ${savingRate.toFixed(1)}% de tus ingresos. El objetivo recomendado es 20%.`,
                action: 'Aplica la regla 50/30/20',
                type: 'saving',
                priority: 'high',
                behavioralInsight: 'El ahorro automático reduce la tentación de gastar'
            });
        }
        
        // Recomendación de deuda
        if (userProfile.total_debt > 0) {
            const debtToIncome = (userProfile.total_debt / (userProfile.monthly_income * 12)) * 100;
            
            if (debtToIncome > 40) {
                recommendations.push({
                    title: 'Reduce tu nivel de deuda',
                    description: `Tus deudas representan ${debtToIncome.toFixed(1)}% de tus ingresos anuales.`,
                    action: 'Prioriza el pago de deudas con mayor interés',
                    type: 'debt',
                    priority: 'high',
                    behavioralInsight: 'Pagar deudas pequeñas primero genera motivación (método snowball)'
                });
            }
        }
        
        // Recomendación de inversión
        if (userProfile.total_savings > 5000) {
            recommendations.push({
                title: 'Comienza a invertir',
                description: 'Tienes suficiente fondo de emergencia. Considera invertir para hacer crecer tu dinero.',
                action: 'Explora fondos indexados o ETFs',
                type: 'investment',
                priority: 'medium',
                behavioralInsight: 'Invertir temprano aprovecha el interés compuesto'
            });
        }
        
        // Recomendación de presupuesto
        if (userProfile.monthly_expenses > userProfile.monthly_income * 0.7) {
            recommendations.push({
                title: 'Optimiza tu presupuesto',
                description: 'Tus gastos representan más del 70% de tus ingresos.',
                action: 'Revisa y reduce gastos innecesarios',
                type: 'budget',
                priority: 'medium',
                behavioralInsight: 'Identificar gastos hormiga puede liberar hasta 30% de tu presupuesto'
            });
        }
        
        console.log('📋 Recomendaciones generadas:', recommendations.length);
        
        // Guardar recomendaciones en BD
        for (const rec of recommendations) {
            await db.query(
                `INSERT INTO prescriptions 
                 (user_id, title, description, action_type, priority, behavioral_insight, status) 
                 VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
                [userId, rec.title, rec.description, rec.type, rec.priority, rec.behavioralInsight]
            );
        }
        
        res.json({ 
            message: 'Recomendaciones generadas',
            recommendations 
        });
    } catch (error) {
        console.error('❌ Error generating prescriptions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar estado de prescripción
router.put('/prescriptions/:id/status', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { status } = req.body;
        
        console.log('📥 PUT /prescriptions/status - Usuario:', userId, 'ID:', id, 'Status:', status);
        
        await db.query(
            'UPDATE prescriptions SET status = ?, completed_at = IF(? = "completed", NOW(), NULL) WHERE id = ? AND user_id = ?',
            [status, status, id, userId]
        );
        
        res.json({ message: `Prescripción ${status}` });
    } catch (error) {
        console.error('❌ Error updating prescription:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// MÉTRICAS DE COMPORTAMIENTO
// ============================================

router.get('/metrics/behavioral', async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('📥 GET /metrics/behavioral - Usuario:', userId);
        
        const [metrics] = await db.query(
            'SELECT * FROM behavioral_metrics WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 10',
            [userId]
        );
        
        // Si no hay métricas, crear algunas de ejemplo
        if (metrics.length === 0) {
            console.log('📊 No hay métricas, creando ejemplos...');
            
            const exampleMetrics = [
                {
                    metric_type: 'spending_habit',
                    score: 75,
                    insight: 'Tienes buen control de gastos variables',
                    recommended_action: 'Mantén tu disciplina actual'
                },
                {
                    metric_type: 'saving_habit',
                    score: 45,
                    insight: 'Tu tasa de ahorro puede mejorar',
                    recommended_action: 'Automatiza transferencias a ahorros'
                },
                {
                    metric_type: 'debt_behavior',
                    score: 60,
                    insight: 'Manejas tus deudas adecuadamente',
                    recommended_action: 'Considera consolidar deudas'
                }
            ];
            
            for (const m of exampleMetrics) {
                await db.query(
                    'INSERT INTO behavioral_metrics (user_id, metric_type, score, insight, recommended_action) VALUES (?, ?, ?, ?, ?)',
                    [userId, m.metric_type, m.score, m.insight, m.recommended_action]
                );
            }
            
            const [newMetrics] = await db.query(
                'SELECT * FROM behavioral_metrics WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 10',
                [userId]
            );
            
            return res.json({ metrics: newMetrics });
        }
        
        res.json({ metrics });
    } catch (error) {
        console.error('❌ Error getting metrics:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;