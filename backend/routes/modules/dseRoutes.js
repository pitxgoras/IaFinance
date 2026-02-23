const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const authMiddleware = require('../../middleware/auth');

// Comenta esta línea temporalmente
// router.use(authMiddleware);

// Y agrega un userId fijo para pruebas
router.use((req, res, next) => {
  req.user = { id: 1 }; // Usuario administrador fijo
  next();
});

// Obtener todas las simulaciones del usuario
router.get('/simulations', async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('��� GET /simulations - Usuario:', userId);
        
        const [simulations] = await db.query(
            'SELECT * FROM simulations WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        
        res.json({ simulations });
    } catch (error) {
        console.error('❌ Error getting simulations:', error);
        res.status(500).json({ error: error.message });
    }
});

// Crear nueva simulación
router.post('/simulations', async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, type } = req.body;
        
        console.log('��� POST /simulations - Usuario:', userId, 'Datos:', { name, description, type });
        
        if (!name) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        const [result] = await db.query(
            'INSERT INTO simulations (user_id, name, description, type, status) VALUES (?, ?, ?, ?, ?)',
            [userId, name, description, type || 'custom', 'draft']
        );
        
        console.log('✅ Simulación creada con ID:', result.insertId);
        
        res.status(201).json({
            message: 'Simulación creada',
            simulationId: result.insertId
        });
    } catch (error) {
        console.error('❌ Error creating simulation:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener una simulación específica
router.get('/simulations/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        const [simulations] = await db.query(
            'SELECT * FROM simulations WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (simulations.length === 0) {
            return res.status(404).json({ error: 'Simulación no encontrada' });
        }
        
        const simulation = simulations[0];
        
        // Obtener variables
        const [variables] = await db.query(
            'SELECT * FROM simulation_variables WHERE simulation_id = ?',
            [id]
        );
        
        // Obtener resultados
        const [results] = await db.query(
            'SELECT * FROM simulation_results WHERE simulation_id = ? ORDER BY created_at DESC',
            [id]
        );
        
        res.json({
            ...simulation,
            variables,
            results
        });
    } catch (error) {
        console.error('❌ Error getting simulation:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ejecutar simulación
router.post('/simulations/:id/run', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        // Verificar que la simulación existe
        const [simulations] = await db.query(
            'SELECT * FROM simulations WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (simulations.length === 0) {
            return res.status(404).json({ error: 'Simulación no encontrada' });
        }
        
        // Obtener variables
        const [variables] = await db.query(
            'SELECT * FROM simulation_variables WHERE simulation_id = ?',
            [id]
        );
        
        // Obtener perfil del usuario
        const [profiles] = await db.query(
            'SELECT * FROM user_profiles WHERE user_id = ?',
            [userId]
        );
        
        const userProfile = profiles[0] || {
            monthly_income: 2500,
            monthly_expenses: 1800,
            total_savings: 3000,
            total_debt: 5000
        };
        
        // Calcular resultados (simplificado)
        let monthlyCashflow = userProfile.monthly_income - userProfile.monthly_expenses;
        
        // Aplicar cambios de variables
        variables.forEach(v => {
            if (v.variable_type === 'income') {
                monthlyCashflow += (v.simulated_value - v.current_value);
            }
            if (v.variable_type === 'expense') {
                monthlyCashflow -= (v.simulated_value - v.current_value);
            }
        });
        
        const yearlyImpact = monthlyCashflow * 12;
        const successProbability = Math.min(100, Math.max(0, 70 + (monthlyCashflow / 100)));
        const riskLevel = monthlyCashflow > 500 ? 'low' : monthlyCashflow > 0 ? 'medium' : 'high';
        
        const results = {
            projectedBalance: userProfile.total_savings + (monthlyCashflow * 12),
            projectedSavings: userProfile.total_savings + (monthlyCashflow * 12 * 0.7),
            projectedDebt: Math.max(0, userProfile.total_debt - (monthlyCashflow * 12 * 0.3)),
            riskLevel,
            successProbability,
            monthlyImpact: monthlyCashflow,
            yearlyImpact,
            recommendations: [
                {
                    type: monthlyCashflow > 0 ? 'success' : 'warning',
                    title: monthlyCashflow > 0 ? 'Escenario positivo' : 'Escenario de riesgo',
                    description: monthlyCashflow > 0 
                        ? 'Esta simulación muestra un impacto positivo en tus finanzas'
                        : 'Esta simulación podría afectar negativamente tu flujo de caja',
                    action: monthlyCashflow > 0 
                        ? 'Considera implementar estos cambios'
                        : 'Revisa las variables y ajusta los valores'
                }
            ]
        };
        
        // Guardar resultados
        await db.query(
            `INSERT INTO simulation_results 
             (simulation_id, projected_balance, projected_savings, projected_debt, 
              risk_level, success_probability, monthly_impact, yearly_impact, recommendations) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, results.projectedBalance, results.projectedSavings, results.projectedDebt,
             results.riskLevel, results.successProbability, results.monthlyImpact,
             results.yearlyImpact, JSON.stringify(results.recommendations)]
        );
        
        // Actualizar estado de la simulación
        await db.query(
            'UPDATE simulations SET status = ? WHERE id = ?',
            ['completed', id]
        );
        
        res.json({ results });
    } catch (error) {
        console.error('❌ Error running simulation:', error);
        res.status(500).json({ error: error.message });
    }
});

// Guardar variables
router.post('/simulations/:id/variables', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { variables } = req.body;
        
        // Verificar que la simulación existe
        const [simulations] = await db.query(
            'SELECT * FROM simulations WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (simulations.length === 0) {
            return res.status(404).json({ error: 'Simulación no encontrada' });
        }
        
        // Eliminar variables anteriores
        await db.query('DELETE FROM simulation_variables WHERE simulation_id = ?', [id]);
        
        // Insertar nuevas variables
        for (const v of variables) {
            await db.query(
                `INSERT INTO simulation_variables 
                 (simulation_id, variable_name, variable_type, current_value, simulated_value) 
                 VALUES (?, ?, ?, ?, ?)`,
                [id, v.name, v.type, v.currentValue, v.simulatedValue]
            );
        }
        
        res.json({ message: 'Variables guardadas' });
    } catch (error) {
        console.error('❌ Error saving variables:', error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar simulación
router.delete('/simulations/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        const [result] = await db.query(
            'DELETE FROM simulations WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Simulación no encontrada' });
        }
        
        res.json({ message: 'Simulación eliminada' });
    } catch (error) {
        console.error('❌ Error deleting simulation:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
