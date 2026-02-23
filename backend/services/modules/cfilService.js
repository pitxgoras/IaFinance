// backend/services/modules/cfilService.js
class CFILService {
    
    async getWelcomeMessage() {
        return '¡Hola! Soy Roman, tu asistente financiero personal. ' +
               'Puedo ayudarte con consejos de ahorro, inversiones, ' +
               'planificación financiera y más. ¿En qué te puedo ayudar hoy?';
    }
    
    async generateResponse(message, history, userProfile, transactions, context) {
        // Detectar intención del mensaje
        const intent = this.detectIntent(message);
        
        // Generar respuesta según intención
        let response = '';
        let suggestions = [];
        let explanation = null;
        
        switch (intent) {
            case 'investment':
                response = this.getInvestmentResponse(userProfile);
                suggestions = this.getInvestmentSuggestions();
                explanation = this.generateExplanation('investment', userProfile);
                break;
                
            case 'saving':
                response = this.getSavingResponse(transactions);
                suggestions = this.getSavingSuggestions();
                explanation = this.generateExplanation('saving', transactions);
                break;
                
            case 'debt':
                response = this.getDebtResponse(userProfile);
                suggestions = this.getDebtSuggestions();
                explanation = this.generateExplanation('debt', userProfile);
                break;
                
            case 'budget':
                response = this.getBudgetResponse(transactions);
                suggestions = this.getBudgetSuggestions();
                explanation = this.generateExplanation('budget', transactions);
                break;
                
            case 'retirement':
                response = this.getRetirementResponse(userProfile);
                suggestions = this.getRetirementSuggestions();
                explanation = this.generateExplanation('retirement', userProfile);
                break;
                
            default:
                response = this.getDefaultResponse();
                suggestions = this.getDefaultSuggestions();
        }
        
        return {
            content: response,
            type: 'text',
            intent: intent,
            confidence: 0.85,
            suggestions: suggestions,
            explanation: explanation
        };
    }
    
    detectIntent(message) {
        const lowerMsg = message.toLowerCase();
        
        const intents = {
            investment: ['invertir', 'inversión', 'acciones', 'bolsa', 'fondos'],
            saving: ['ahorrar', 'ahorro', 'guardar dinero', 'fondo'],
            debt: ['deuda', 'préstamo', 'credito', 'tarjeta'],
            budget: ['presupuesto', 'gastos', 'ingresos', 'mensual'],
            retirement: ['jubilación', 'retiro', 'pensión', 'afp']
        };
        
        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => lowerMsg.includes(keyword))) {
                return intent;
            }
        }
        
        return 'general';
    }
    
    getInvestmentResponse(profile) {
        const riskProfile = profile.risk_profile || 'moderate';
        
        const responses = {
            conservative: 'Para tu perfil conservador, te recomiendo fondos de inversión ' +
                         'de bajo riesgo y bonos gubernamentales.',
            moderate: 'Con un perfil moderado, considera diversificar entre ETFs, ' +
                      'bonos corporativos y algunas acciones de crecimiento.',
            aggressive: 'Tu perfil agresivo permite inversiones de mayor riesgo como ' +
                        'acciones tecnológicas y criptomonedas, siempre con control.'
        };
        
        return responses[riskProfile] || responses.moderate;
    }
    
    getSavingResponse(transactions) {
        const monthlySpending = this.calculateMonthlySpending(transactions);
        
        if (monthlySpending > 2000) {
            return 'Veo que tus gastos mensuales son altos. Te recomiendo ' +
                   'revisar suscripciones y gastos hormiga para ahorrar.';
        }
        
        return '¡Buen trabajo! Tienes control de gastos. Para optimizar, ' +
               'prueba la regla 50/30/20 para distribución de ingresos.';
    }
    
    getDebtResponse(profile) {
        if ((profile.total_debt || 0) > 5000) {
            return 'Tus deudas son significativas. Te recomiendo el método ' +
                   'snowball: paga las deudas pequeñas primero para motivarte.';
        }
        
        return 'Mantén tus deudas bajo control. Considera consolidar si ' +
               'tienes múltiples deudas con altos intereses.';
    }
    
    getBudgetResponse(transactions) {
        return 'Un buen presupuesto es clave. Divide tus ingresos en: ' +
               '50% necesidades, 30% deseos y 20% ahorro/inversión.';
    }
    
    getRetirementResponse(profile) {
        return 'Nunca es tarde para planificar tu jubilación. Si puedes, ' +
               'aumenta tus aportes voluntarios para aprovechar el interés compuesto.';
    }
    
    getDefaultResponse() {
        return 'Entiendo tu consulta. Como asistente financiero, puedo ' +
               'ayudarte con inversiones, ahorro, deudas, presupuestos y ' +
               'planificación para el retiro. ¿Sobre qué tema específico ' +
               'te gustaría conversar?';
    }
    
    getInvestmentSuggestions() {
        return [
            '¿Cómo empezar a invertir?',
            'Mejores fondos de inversión',
            'Riesgo vs retorno',
            'Inversiones para principiantes'
        ];
    }
    
    getSavingSuggestions() {
        return [
            'Consejos de ahorro diario',
            'Cómo crear un fondo de emergencia',
            'Apps para ahorrar automáticamente',
            'Reducir gastos hormiga'
        ];
    }
    
    getDebtSuggestions() {
        return [
            'Método snowball vs avalanche',
            'Consolidar deudas',
            'Negociar tasas de interés',
            'Evitar nuevas deudas'
        ];
    }
    
    getBudgetSuggestions() {
        return [
            'Regla 50/30/20 explicada',
            'Apps de presupuesto',
            'Cómo categorizar gastos',
            'Ajustar presupuesto mensual'
        ];
    }
    
    getRetirementSuggestions() {
        return [
            'Calcular necesidad de retiro',
            'Planes voluntarios de pensión',
            'Inversiones para la jubilación',
            'Edad óptima para empezar'
        ];
    }
    
    getDefaultSuggestions() {
        return [
            'Consejos de inversión',
            'Cómo ahorrar más',
            'Plan de pago de deudas',
            'Preparación para jubilación'
        ];
    }
    
    generateExplanation(type, data) {
        const explanations = {
            investment: {
                type: 'recommendation',
                simplified: 'Esta recomendación se basa en tu perfil de riesgo ' +
                           'y en principios de diversificación de cartera.',
                keyFactors: ['Perfil de riesgo', 'Horizonte temporal', 'Capital disponible'],
                confidenceFactors: ['Datos históricos del mercado', 'Teoría moderna de portafolio']
            },
            saving: {
                type: 'insight',
                simplified: 'El análisis de tus gastos muestra patrones de consumo ' +
                           'que puedes optimizar.',
                keyFactors: ['Patrón de gastos', 'Ingresos mensuales', 'Metas de ahorro'],
                confidenceFactors: ['Historial de transacciones', 'Comparación con perfiles similares']
            },
            debt: {
                type: 'recommendation',
                simplified: 'La estrategia recomendada maximiza tu motivación ' +
                           'para mantener el hábito de pago.',
                keyFactors: ['Monto de deudas', 'Tasas de interés', 'Psicología del comportamiento'],
                confidenceFactors: ['Estudios de finanzas conductuales', 'Casos de éxito']
            },
            budget: {
                type: 'insight',
                simplified: 'Esta distribución optimiza tus recursos según ' +
                           'estándares financieros probados.',
                keyFactors: ['Regla 50/30/20', 'Tus ingresos actuales', 'Gastos fijos'],
                confidenceFactors: ['Principios de educación financiera', 'Datos agregados']
            },
            retirement: {
                type: 'prediction',
                simplified: 'La proyección considera el interés compuesto y ' +
                           'tu capacidad actual de ahorro.',
                keyFactors: ['Edad actual', 'Edad de retiro deseada', 'Tasa de ahorro'],
                confidenceFactors: ['Modelos actuariales', 'Rendimientos históricos']
            }
        };
        
        return explanations[type] || null;
    }
    
    calculateMonthlySpending(transactions) {
        const expenses = transactions.filter(t => 
            t.type === 'expense' && 
            new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        
        return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    }
}

module.exports = new CFILService();