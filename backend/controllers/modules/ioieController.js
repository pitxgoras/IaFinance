// backend/controllers/modules/ioieController.js
const db = require('../../config/database');
const ioieService = require('../../services/modules/ioieService');

// Obtener oportunidades recomendadas
exports.getRecommendedOpportunities = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Obtener habilidades del usuario
        const [skills] = await db.query(
            'SELECT * FROM user_skills WHERE user_id = ?',
            [userId]
        );
        
        // Obtener perfil del usuario
        const [profiles] = await db.query(
            'SELECT * FROM user_profiles WHERE user_id = ?',
            [userId]
        );
        
        // Obtener oportunidades existentes
        const [opportunities] = await db.query(
            `SELECT * FROM income_opportunities 
             WHERE status = 'recommended' 
             ORDER BY similarity_score DESC, estimated_income_max DESC 
             LIMIT 20`
        );
        
        // Filtrar y recomendar usando ML
        const recommendations = await ioieService.recommendOpportunities(
            skills,
            profiles[0] || {},
            opportunities
        );
        
        res.json({
            recommendations,
            total: recommendations.length
        });
        
    } catch (error) {
        console.error('Error obteniendo oportunidades:', error);
        res.status(500).json({ error: 'Error al obtener oportunidades' });
    }
};

// Aplicar a una oportunidad
exports.applyToOpportunity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        await db.query(
            `UPDATE income_opportunities 
             SET status = 'applied' 
             WHERE id = ? AND user_id = ?`,
            [id, userId]
        );
        
        res.json({ message: 'Aplicación registrada' });
        
    } catch (error) {
        console.error('Error aplicando a oportunidad:', error);
        res.status(500).json({ error: 'Error al aplicar' });
    }
};

// Agregar habilidad del usuario
exports.addUserSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillName, proficiencyLevel, yearsExperience } = req.body;
        
        await db.query(
            `INSERT INTO user_skills 
             (user_id, skill_name, proficiency_level, years_experience) 
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             proficiency_level = VALUES(proficiency_level),
             years_experience = VALUES(years_experience)`,
            [userId, skillName, proficiencyLevel, yearsExperience]
        );
        
        res.status(201).json({ message: 'Habilidad agregada' });
        
    } catch (error) {
        console.error('Error agregando habilidad:', error);
        res.status(500).json({ error: 'Error al agregar habilidad' });
    }
};

// Compartir experiencia (anónima)
exports.shareExperience = async (req, res) => {
    try {
        const { opportunityId, actualIncome, timeSpent, satisfaction, review } = req.body;
        
        // Hash del usuario para anonimato
        const userHash = require('crypto')
            .createHash('sha256')
            .update(req.user.id.toString() + process.env.SALT)
            .digest('hex');
        
        await db.query(
            `INSERT INTO user_experiences 
             (opportunity_id, user_profile_hash, actual_income, 
              time_spent_hours, satisfaction_score, review) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [opportunityId, userHash, actualIncome, timeSpent, satisfaction, review]
        );
        
        res.json({ message: 'Experiencia compartida' });
        
    } catch (error) {
        console.error('Error compartiendo experiencia:', error);
        res.status(500).json({ error: 'Error al compartir experiencia' });
    }
};