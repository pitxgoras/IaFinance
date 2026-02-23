// backend/controllers/modules/dseController.js

const db = require('../../config/database');
const dseService = require('../../services/modules/dseService');

// Crear nueva simulación
exports.createSimulation = async (req, res) => {
    try {
        const userId = req.user.id;
        const simulationData = req.body;
        
        // Validar datos básicos
        if (!simulationData.name || !simulationData.type) {
            return res.status(400).json({ 
                error: 'Nombre y tipo de simulación son requeridos' 
            });
        }
        
        // Crear simulación en base de datos
        const [result] = await db.query(
            `INSERT INTO simulations (user_id, name, description, type, status) 
             VALUES (?, ?, ?, ?, 'draft')`,
            [userId, simulationData.name, simulationData.description, simulationData.type]
        );
        
        const simulationId = result.insertId;
        
        res.status(201).json({
            message: 'Simulación creada exitosamente',
            simulationId,
            simulation: {
                id: simulationId,
                ...simulationData,
                status: 'draft'
            }
        });
        
    } catch (error) {
        console.error('Error creando simulación:', error);
        res.status(500).json({ error: 'Error al crear la simulación' });
    }
};

// Ejecutar simulación
exports.runSimulation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // Verificar que la simulación existe y pertenece al usuario
        const [simulations] = await db.query(
            'SELECT * FROM simulations WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (simulations.length === 0) {
            return res.status(404).json({ error: 'Simulación no encontrada' });
        }
        
        const simulation = simulations[0];
        
        // Obtener variables de simulación
        const [variables] = await db.query(
            'SELECT * FROM simulation_variables WHERE simulation_id = ?',
            [id]
        );
        
        // Obtener perfil financiero del usuario
        const [profiles] = await db.query(
            'SELECT * FROM user_profiles WHERE user_id = ?',
            [userId]
        );
        
        const userProfile = profiles[0] || {
            monthly_income: 0,
            monthly_expenses: 0,
            total_savings: 0,
            total_debt: 0,
            risk_profile: 'moderate'
        };
        
        // Validar datos de simulación
        const validation = dseService.validateSimulationData(simulation, variables);
        if (!validation.isValid) {
            return res.status(400).json({ 
                error: 'Datos de simulación inválidos',
                details: validation.errors 
            });
        }
        
        // Ejecutar simulación usando el servicio
        const results = await dseService.runFinancialSimulation(
            simulation,
            variables,
            userProfile
        );
        
        // Actualizar estado de simulación
        await db.query(
            'UPDATE simulations SET status = ? WHERE id = ?',
            ['completed', id]
        );
        
        // Guardar resultados
        const [resultInsert] = await db.query(
            `INSERT INTO simulation_results 
             (simulation_id, projected_balance, projected_savings, projected_debt, 
              risk_level, success_probability, monthly_impact, yearly_impact, recommendations) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, results.projectedBalance, results.projectedSavings, results.projectedDebt,
             results.riskLevel, results.successProbability, results.monthlyImpact,
             results.yearlyImpact, JSON.stringify(results.recommendations)]
        );
        
        res.json({
            message: 'Simulación completada exitosamente',
            simulationId: id,
            results: {
                ...results,
                resultId: resultInsert.insertId
            }
        });
        
    } catch (error) {
        console.error('Error ejecutando simulación:', error);
        res.status(500).json({ error: 'Error al ejecutar la simulación' });
    }
};

// Obtener simulaciones del usuario
exports.getUserSimulations = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, limit = 10, offset = 0 } = req.query;
        
        let query = 'SELECT * FROM simulations WHERE user_id = ?';
        const params = [userId];
        
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const [simulations] = await db.query(query, params);
        
        // Obtener resultados para cada simulación
        for (let sim of simulations) {
            const [results] = await db.query(
                'SELECT * FROM simulation_results WHERE simulation_id = ? ORDER BY created_at DESC LIMIT 1',
                [sim.id]
            );
            sim.latestResult = results[0] || null;
        }
        
        res.json({
            total: simulations.length,
            simulations
        });
        
    } catch (error) {
        console.error('Error obteniendo simulaciones:', error);
        res.status(500).json({ error: 'Error al obtener simulaciones' });
    }
};

// Obtener simulación específica
exports.getSimulationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
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
        
        // Obtener escenarios
        const [scenarios] = await db.query(
            'SELECT * FROM simulation_scenarios WHERE simulation_id = ?',
            [id]
        );
        
        res.json({
            ...simulation,
            variables,
            results,
            scenarios
        });
        
    } catch (error) {
        console.error('Error obteniendo simulación:', error);
        res.status(500).json({ error: 'Error al obtener la simulación' });
    }
};

// Guardar variables de simulación
exports.saveVariables = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { variables } = req.body;
        
        // Verificar simulación
        const [simulations] = await db.query(
            'SELECT * FROM simulations WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (simulations.length === 0) {
            return res.status(404).json({ error: 'Simulación no encontrada' });
        }
        
        // Eliminar variables anteriores
        await db.query('DELETE FROM simulation_variables WHERE simulation_id = ?', [id]);
        
        // Guardar nuevas variables
        for (const variable of variables) {
            await db.query(
                `INSERT INTO simulation_variables 
                 (simulation_id, variable_name, variable_type, current_value, simulated_value) 
                 VALUES (?, ?, ?, ?, ?)`,
                [id, variable.name, variable.type, variable.currentValue, variable.simulatedValue]
            );
        }
        
        res.json({ message: 'Variables guardadas exitosamente' });
        
    } catch (error) {
        console.error('Error guardando variables:', error);
        res.status(500).json({ error: 'Error al guardar variables' });
    }
};

// Crear escenario de simulación
exports.createScenario = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const scenarioData = req.body;
        
        // Verificar simulación
        const [simulations] = await db.query(
            'SELECT * FROM simulations WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (simulations.length === 0) {
            return res.status(404).json({ error: 'Simulación no encontrada' });
        }
        
        // Crear escenario
        const [result] = await db.query(
            `INSERT INTO simulation_scenarios 
             (simulation_id, name, description, parameters, is_base) 
             VALUES (?, ?, ?, ?, ?)`,
            [id, scenarioData.name, scenarioData.description, 
             JSON.stringify(scenarioData.parameters), scenarioData.isBase || false]
        );
        
        res.status(201).json({
            message: 'Escenario creado exitosamente',
            scenarioId: result.insertId,
            scenario: {
                id: result.insertId,
                ...scenarioData
            }
        });
        
    } catch (error) {
        console.error('Error creando escenario:', error);
        res.status(500).json({ error: 'Error al crear escenario' });
    }
};

// Comparar escenarios
exports.compareScenarios = async (req, res) => {
    try {
        const { id } = req.params;
        const { scenarioIds } = req.body;
        
        if (!scenarioIds || scenarioIds.length < 2) {
            return res.status(400).json({ error: 'Se requieren al menos 2 escenarios para comparar' });
        }
        
        const [scenarios] = await db.query(
            'SELECT * FROM simulation_scenarios WHERE simulation_id = ? AND id IN (?)',
            [id, [scenarioIds]]
        );
        
        const comparison = await dseService.compareScenarios(scenarios);
        
        res.json({
            simulationId: id,
            scenarios: scenarios,
            comparison: comparison
        });
        
    } catch (error) {
        console.error('Error comparando escenarios:', error);
        res.status(500).json({ error: 'Error al comparar escenarios' });
    }
};

// Eliminar simulación
exports.deleteSimulation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const [result] = await db.query(
            'DELETE FROM simulations WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Simulación no encontrada' });
        }
        
        res.json({ message: 'Simulación eliminada exitosamente' });
        
    } catch (error) {
        console.error('Error eliminando simulación:', error);
        res.status(500).json({ error: 'Error al eliminar la simulación' });
    }
};