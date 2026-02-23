// backend/services/modules/pfseService.js
class PFSEService {
    
    async generatePrescriptions(userProfile, transactions, strategies) {
        const prescriptions = [];
        
        // Análisis de deudas (método psicológico - debt snowball vs avalanche)
        const debtAnalysis = this.analyzeDebtStrategy(transactions);
        if (debtAnalysis.recommendation) {
            prescriptions.push({
                strategyId: null,
                title: '📊 Estrategia de pago de deudas',
                description: debtAnalysis.recommendation,
                actionType: 'pay_debt',
                targetAmount: debtAnalysis.targetAmount,
                deadline: this.calculateDeadline(30),
                priority: 'high',
                behavioralInsight: debtAnalysis.behavioralInsight
            });
        }
        
        // Análisis de ahorro
        const savingRate = this.calculateSavingRate(transactions);
        if (savingRate < 20) {
            prescriptions.push({
                strategyId: null,
                title: '💰 Aumenta tu tasa de ahorro',
                description: `Actualmente ahorras ${savingRate.toFixed(1)}% de tus ingresos. ` +
                             'Te recomendamos la regla 50/30/20 para optimizar.',
                actionType: 'save_money',
                targetAmount: (userProfile.monthly_income || 0) * 0.2,
                deadline: this.calculateDeadline(15),
                priority: 'medium',
                behavioralInsight: 'El ahorro automático reduce la fricción psicológica'
            });
        }
        
        // Recomendaciones de inversión según perfil
        if ((userProfile.total_savings || 0) > 5000) {
            prescriptions.push({
                strategyId: null,
                title: '📈 Comienza a invertir',
                description: 'Tienes suficiente fondo de emergencia. ' +
                             'Considera invertir para hacer crecer tu dinero.',
                actionType: 'invest',
                targetAmount: (userProfile.total_savings || 0) * 0.3,
                deadline: this.calculateDeadline(60),
                priority: 'medium',
                behavioralInsight: 'Invertir temprano aprovecha el interés compuesto'
            });
        }
        
        return prescriptions;
    }
    
    analyzeDebtStrategy(transactions) {
        const debts = transactions.filter(t => 
            t.type === 'expense' && 
            ['debt', 'loan', 'credit'].includes(t.category)
        );
        
        if (debts.length === 0) return {};
        
        // Debt Snowball (psicológico) - pagar deudas más pequeñas primero
        const smallestDebt = debts.reduce((min, d) => 
            Math.abs(d.amount) < Math.abs(min.amount) ? d : min
        , debts[0]);
        
        return {
            recommendation: `Paga primero la deuda de ${Math.abs(smallestDebt.amount)} ` +
                           'para ganar momentum psicológico (método snowball).',
            targetAmount: Math.abs(smallestDebt.amount),
            behavioralInsight: 'Pagar deudas pequeñas primero libera dopamina ' +
                              'y refuerza el hábito de ahorro'
        };
    }
    
    calculateSavingRate(transactions) {
        const incomes = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');
        
        const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
        const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        
        if (totalIncome === 0) return 0;
        return ((totalIncome - totalExpense) / totalIncome) * 100;
    }
    
    calculateDeadline(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }
}

module.exports = new PFSEService();