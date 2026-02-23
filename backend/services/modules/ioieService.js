// backend/services/modules/ioieService.js
class IOIEService {
    
    async recommendOpportunities(userSkills, userProfile, opportunities) {
        const recommendations = [];
        
        for (const opp of opportunities) {
            let score = 0;
            let reasons = [];
            
            // Match por habilidades
            const requiredSkills = opp.required_skills ? 
                (typeof opp.required_skills === 'string' ? 
                    JSON.parse(opp.required_skills) : opp.required_skills) : [];
            
            const skillMatch = this.calculateSkillMatch(userSkills, requiredSkills);
            score += skillMatch.score * 40; // 40% peso
            
            if (skillMatch.matchedSkills.length > 0) {
                reasons.push(`Tienes habilidades relevantes: ${skillMatch.matchedSkills.join(', ')}`);
            }
            
            // Match por tiempo disponible
            if (userProfile.available_hours && opp.time_commitment_hours) {
                if (userProfile.available_hours >= opp.time_commitment_hours) {
                    score += 20;
                    reasons.push('El tiempo requerido se ajusta a tu disponibilidad');
                }
            }
            
            // Match por ingresos esperados
            if (userProfile.target_income && opp.estimated_income_max) {
                if (opp.estimated_income_max >= userProfile.target_income * 0.5) {
                    score += 20;
                    reasons.push('Potencial de ingresos significativo');
                }
            }
            
            // Basado en éxito de otros usuarios
            if (opp.success_rate && opp.success_rate > 70) {
                score += 20;
                reasons.push('Alta tasa de éxito en usuarios similares');
            }
            
            if (score > 50) {
                recommendations.push({
                    ...opp,
                    matchScore: Math.min(100, Math.round(score)),
                    matchReasons: reasons,
                    recommendationStrength: score > 80 ? 'strong' : 'medium'
                });
            }
        }
        
        return recommendations.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    calculateSkillMatch(userSkills, requiredSkills) {
        const matchedSkills = [];
        let score = 0;
        
        if (!requiredSkills || !requiredSkills.length) return { score: 50, matchedSkills: [] };
        
        for (const req of requiredSkills) {
            const match = userSkills.find(us => 
                us.skill_name && us.skill_name.toLowerCase() === (req.name || req).toLowerCase()
            );
            
            if (match) {
                matchedSkills.push(req.name || req);
                // Puntuar según nivel de proficiencia
                const proficiencyScore = {
                    'beginner': 0.5,
                    'intermediate': 0.7,
                    'advanced': 0.9,
                    'expert': 1.0
                }[match.proficiency_level] || 0.5;
                
                score += proficiencyScore * (req.weight || 1);
            }
        }
        
        const maxScore = requiredSkills.reduce((sum, r) => sum + (r.weight || 1), 0);
        const finalScore = maxScore > 0 ? (score / maxScore) * 100 : 0;
        
        return {
            score: finalScore,
            matchedSkills
        };
    }
}

module.exports = new IOIEService();