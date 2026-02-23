const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// ============================================
// CONFIGURACIÓN PARA PRUEBAS - AUTENTICACIÓN DESACTIVADA
// ============================================
router.use((req, res, next) => {
    req.user = { id: 1 }; // Usuario administrador con ID 1
    console.log('👤 Usuario de prueba IOIE - ID:', req.user.id);
    next();
});

// ============================================
// OPORTUNIDADES DE INGRESO
// ============================================

// Obtener oportunidades recomendadas para el usuario
router.get('/opportunities/recommended', async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('📥 GET /opportunities/recommended - Usuario:', userId);
        
        // Obtener habilidades del usuario
        const [skills] = await db.query(
            'SELECT * FROM user_skills WHERE user_id = ?',
            [userId]
        );
        
        // Obtener oportunidades de la base de datos
        let [opportunities] = await db.query(
            'SELECT * FROM income_opportunities WHERE status = "recommended" ORDER BY similarity_score DESC, estimated_income_max DESC LIMIT 20'
        );
        
        // Si no hay oportunidades, crear algunas de ejemplo
        if (opportunities.length === 0) {
            console.log('📊 No hay oportunidades, creando ejemplos...');
            
            const exampleOpportunities = [
                {
                    title: 'Desarrollador Web Freelance',
                    description: 'Busca proyectos de desarrollo web en plataformas como Upwork o Workana. Ideal para programadores con experiencia en JavaScript, React o Node.js.',
                    category: 'freelance',
                    estimated_income_min: 800,
                    estimated_income_max: 2500,
                    required_skills: JSON.stringify(['JavaScript', 'React', 'Node.js']),
                    time_commitment_hours: 20,
                    difficulty: 'medium',
                    success_rate: 85,
                    similarity_score: 0,
                    status: 'recommended'
                },
                {
                    title: 'Clases Particulares Online',
                    description: 'Enseña matemáticas, inglés o programación a estudiantes de todas las edades. Puedes usar plataformas como Superprof o crear tu propio negocio.',
                    category: 'part_time',
                    estimated_income_min: 500,
                    estimated_income_max: 1500,
                    required_skills: JSON.stringify(['Enseñanza', 'Paciencia', 'Comunicación']),
                    time_commitment_hours: 15,
                    difficulty: 'easy',
                    success_rate: 90,
                    similarity_score: 0,
                    status: 'recommended'
                },
                {
                    title: 'Inversión en Fondos Indexados',
                    description: 'Invierte en fondos indexados de bajo costo que siguen el mercado. Ideal para ingresos pasivos a largo plazo.',
                    category: 'investment',
                    estimated_income_min: 200,
                    estimated_income_max: 1000,
                    required_skills: JSON.stringify(['Conocimientos básicos de inversión', 'Paciencia']),
                    time_commitment_hours: 2,
                    difficulty: 'easy',
                    success_rate: 95,
                    similarity_score: 0,
                    status: 'recommended'
                },
                {
                    title: 'Venta de Productos Digitales',
                    description: 'Crea y vende plantillas, ebooks, cursos online o software como servicio. Ingresos pasivos con alta escalabilidad.',
                    category: 'passive',
                    estimated_income_min: 300,
                    estimated_income_max: 5000,
                    required_skills: JSON.stringify(['Creatividad', 'Marketing', 'Diseño']),
                    time_commitment_hours: 10,
                    difficulty: 'medium',
                    success_rate: 70,
                    similarity_score: 0,
                    status: 'recommended'
                },
                {
                    title: 'Conductor de Uber/Didi',
                    description: 'Genera ingresos adicionales manejando en tus tiempos libres. Flexibilidad total de horarios.',
                    category: 'gig',
                    estimated_income_min: 400,
                    estimated_income_max: 1200,
                    required_skills: JSON.stringify(['Licencia de conducir', 'Vehículo propio', 'Orientación']),
                    time_commitment_hours: 25,
                    difficulty: 'easy',
                    success_rate: 80,
                    similarity_score: 0,
                    status: 'recommended'
                }
            ];
            
            for (const opp of exampleOpportunities) {
                await db.query(
                    `INSERT INTO income_opportunities 
                     (user_id, title, description, category, estimated_income_min, estimated_income_max, 
                      required_skills, time_commitment_hours, difficulty, success_rate, similarity_score, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [userId, opp.title, opp.description, opp.category, opp.estimated_income_min, 
                     opp.estimated_income_max, opp.required_skills, opp.time_commitment_hours, 
                     opp.difficulty, opp.success_rate, opp.similarity_score, opp.status]
                );
            }
            
            // Volver a consultar las oportunidades
            [opportunities] = await db.query(
                'SELECT * FROM income_opportunities WHERE user_id = ? ORDER BY similarity_score DESC, estimated_income_max DESC',
                [userId]
            );
        }
        
        // Calcular match score basado en habilidades del usuario
        const skillsList = skills.map(s => s.skill_name.toLowerCase());
        
        const opportunitiesWithScore = opportunities.map(opp => {
            let matchScore = 50; // Base score
            
            if (opp.required_skills) {
                const requiredSkills = JSON.parse(opp.required_skills);
                const matchedSkills = requiredSkills.filter(skill => 
                    skillsList.includes(skill.toLowerCase())
                );
                
                matchScore += matchedSkills.length * 10;
                if (matchedSkills.length > 0) matchScore += 10;
            }
            
            // Ajustar por tiempo disponible (simulado)
            if (opp.time_commitment_hours <= 20) matchScore += 10;
            if (opp.success_rate > 80) matchScore += 10;
            
            // Limitar a 100
            matchScore = Math.min(100, matchScore);
            
            return {
                ...opp,
                matchScore,
                matchReasons: generateMatchReasons(opp, skillsList)
            };
        });
        
        res.json({ 
            recommendations: opportunitiesWithScore.sort((a, b) => b.matchScore - a.matchScore)
        });
        
    } catch (error) {
        console.error('❌ Error getting opportunities:', error);
        res.status(500).json({ error: error.message });
    }
});

// Función auxiliar para generar razones de match
function generateMatchReasons(opportunity, userSkills) {
    const reasons = [];
    
    if (opportunity.required_skills) {
        const requiredSkills = JSON.parse(opportunity.required_skills);
        const matchedSkills = requiredSkills.filter(skill => 
            userSkills.includes(skill.toLowerCase())
        );
        
        if (matchedSkills.length > 0) {
            reasons.push(`Tienes habilidades relevantes: ${matchedSkills.join(', ')}`);
        }
    }
    
    if (opportunity.time_commitment_hours <= 20) {
        reasons.push('Requiere poco tiempo semanal');
    }
    
    if (opportunity.difficulty === 'easy') {
        reasons.push('Fácil de comenzar');
    }
    
    if (opportunity.success_rate > 80) {
        reasons.push('Alta tasa de éxito');
    }
    
    if (opportunity.estimated_income_max > 1000) {
        reasons.push('Alto potencial de ingresos');
    }
    
    return reasons;
}

// Aplicar a una oportunidad
router.post('/opportunities/:id/apply', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        console.log('📥 POST /opportunities/apply - Usuario:', userId, 'Oportunidad:', id);
        
        await db.query(
            'UPDATE income_opportunities SET status = "applied" WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        res.json({ message: '✅ Aplicación registrada exitosamente' });
    } catch (error) {
        console.error('❌ Error applying to opportunity:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// HABILIDADES DEL USUARIO
// ============================================

// Obtener habilidades del usuario
router.get('/skills', async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [skills] = await db.query(
            'SELECT * FROM user_skills WHERE user_id = ? ORDER BY proficiency_level DESC',
            [userId]
        );
        
        res.json({ skills });
    } catch (error) {
        console.error('❌ Error getting skills:', error);
        res.status(500).json({ error: error.message });
    }
});

// Agregar nueva habilidad
router.post('/skills', async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillName, proficiencyLevel, yearsExperience } = req.body;
        
        console.log('📥 POST /skills - Usuario:', userId, 'Habilidad:', skillName);
        
        if (!skillName) {
            return res.status(400).json({ error: 'Nombre de habilidad requerido' });
        }
        
        await db.query(
            `INSERT INTO user_skills (user_id, skill_name, proficiency_level, years_experience) 
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             proficiency_level = VALUES(proficiency_level),
             years_experience = VALUES(years_experience)`,
            [userId, skillName, proficiencyLevel || 'beginner', yearsExperience || 0]
        );
        
        res.status(201).json({ message: '✅ Habilidad agregada' });
    } catch (error) {
        console.error('❌ Error adding skill:', error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar habilidad
router.delete('/skills/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        await db.query(
            'DELETE FROM user_skills WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        res.json({ message: '✅ Habilidad eliminada' });
    } catch (error) {
        console.error('❌ Error deleting skill:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// EXPERIENCIAS COMPARTIDAS (ANÓNIMAS)
// ============================================

// Compartir experiencia
router.post('/experiences/share', async (req, res) => {
    try {
        const { opportunityId, actualIncome, timeSpent, satisfaction, review } = req.body;
        
        // Hash del usuario para anonimato
        const userHash = require('crypto')
            .createHash('sha256')
            .update(req.user.id.toString() + 'ioie-salt')
            .digest('hex')
            .substring(0, 20);
        
        await db.query(
            `INSERT INTO user_experiences 
             (opportunity_id, user_profile_hash, actual_income, time_spent_hours, satisfaction_score, review) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [opportunityId, userHash, actualIncome, timeSpent, satisfaction, review]
        );
        
        res.json({ message: '✅ Experiencia compartida anónimamente' });
    } catch (error) {
        console.error('❌ Error sharing experience:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;