// backend/services/modules/dseService.js

class DSEService {
    
    // Ejecutar simulación financiera completa
    async runFinancialSimulation(simulation, variables, userProfile) {
        try {
            console.log('🎯 Ejecutando simulación:', simulation.name);
            
            // Obtener datos base del usuario
            const baseData = {
                monthlyIncome: parseFloat(userProfile.monthly_income) || 0,
                monthlyExpenses: parseFloat(userProfile.monthly_expenses) || 0,
                totalSavings: parseFloat(userProfile.total_savings) || 0,
                totalDebt: parseFloat(userProfile.total_debt) || 0,
                riskProfile: userProfile.risk_profile || 'moderate'
            };
            
            console.log('📊 Datos base:', baseData);
            
            // Aplicar cambios simulados
            const simulatedData = this.applySimulationChanges(baseData, variables);
            console.log('🔄 Datos simulados:', simulatedData);
            
            // Calcular proyecciones
            const projections = this.calculateProjections(simulatedData);
            console.log('📈 Proyecciones:', projections);
            
            // Calcular métricas financieras
            const metrics = this.calculateFinancialMetrics(baseData, simulatedData);
            
            // Calcular probabilidad de éxito
            const successProbability = this.calculateSuccessProbability(simulatedData, projections);
            
            // Determinar nivel de riesgo
            const riskLevel = this.assessRiskLevel(simulatedData, projections);
            
            // Generar recomendaciones
            const recommendations = this.generateRecommendations(simulatedData, projections, metrics);
            
            // Calcular impactos mensuales y anuales
            const monthlyImpact = simulatedData.monthlyIncome - simulatedData.monthlyExpenses - 
                                 (baseData.monthlyIncome - baseData.monthlyExpenses);
            const yearlyImpact = monthlyImpact * 12;
            
            return {
                success: true,
                simulationId: simulation.id,
                timestamp: new Date().toISOString(),
                
                // Datos base
                baseData: {
                    monthlyIncome: baseData.monthlyIncome,
                    monthlyExpenses: baseData.monthlyExpenses,
                    monthlyCashflow: baseData.monthlyIncome - baseData.monthlyExpenses,
                    totalSavings: baseData.totalSavings,
                    totalDebt: baseData.totalDebt,
                    savingsRate: baseData.monthlyIncome > 0 
                        ? ((baseData.monthlyIncome - baseData.monthlyExpenses) / baseData.monthlyIncome * 100).toFixed(1)
                        : 0
                },
                
                // Datos simulados
                simulatedData: {
                    monthlyIncome: simulatedData.monthlyIncome,
                    monthlyExpenses: simulatedData.monthlyExpenses,
                    monthlyCashflow: simulatedData.monthlyIncome - simulatedData.monthlyExpenses,
                    totalSavings: simulatedData.totalSavings,
                    totalDebt: simulatedData.totalDebt,
                    savingsRate: simulatedData.monthlyIncome > 0 
                        ? ((simulatedData.monthlyIncome - simulatedData.monthlyExpenses) / simulatedData.monthlyIncome * 100).toFixed(1)
                        : 0
                },
                
                // Proyecciones
                projections: {
                    oneMonth: {
                        balance: simulatedData.totalSavings + (simulatedData.monthlyIncome - simulatedData.monthlyExpenses),
                        savings: simulatedData.totalSavings + ((simulatedData.monthlyIncome - simulatedData.monthlyExpenses) * 0.7),
                        debt: Math.max(0, simulatedData.totalDebt - ((simulatedData.monthlyIncome - simulatedData.monthlyExpenses) * 0.3))
                    },
                    threeMonths: {
                        balance: simulatedData.totalSavings + ((simulatedData.monthlyIncome - simulatedData.monthlyExpenses) * 3),
                        savings: simulatedData.totalSavings + ((simulatedData.monthlyIncome - simulatedData.monthlyExpenses) * 3 * 0.7),
                        debt: Math.max(0, simulatedData.totalDebt - ((simulatedData.monthlyIncome - simulatedData.monthlyExpenses) * 3 * 0.3))
                    },
                    sixMonths: {
                        balance: simulatedData.totalSavings + ((simulatedData.monthlyIncome - simulatedData.monthlyExpenses) * 6),
                        savings: simulatedData.totalSavings + ((simulatedData.monthlyIncome - simulatedData.monthlyExpenses) * 6 * 0.7),
                        debt: Math.max(0, simulatedData.totalDebt - ((simulatedData.monthlyIncome - simulatedData.monthlyExpenses) * 6 * 0.3))
                    },
                    oneYear: {
                        balance: simulatedData.totalSavings + ((simulatedData.monthlyIncome - simulatedData.monthlyExpenses) * 12),
                        savings: simulatedData.totalSavings + ((simulatedData.monthlyIncome - simulatedData.monthlyExpenses) * 12 * 0.7),
                        debt: Math.max(0, simulatedData.totalDebt - ((simulatedData.monthlyIncome - simulatedData.monthlyExpenses) * 12 * 0.3))
                    }
                },
                
                // Métricas financieras
                metrics: {
                    savingsRate: projections.savingsRate,
                    debtToIncome: projections.debtToIncome,
                    emergencyFundMonths: projections.emergencyFundMonths,
                    liquidityRatio: (simulatedData.totalSavings / (simulatedData.monthlyExpenses || 1)).toFixed(1),
                    debtToAssets: simulatedData.totalDebt / (simulatedData.totalSavings || 1) || 0
                },
                
                // Resultados
                projectedBalance: projections.balance,
                projectedSavings: projections.savings,
                projectedDebt: projections.debt,
                monthlyImpact: monthlyImpact,
                yearlyImpact: yearlyImpact,
                riskLevel: riskLevel,
                successProbability: Math.min(100, Math.max(0, successProbability)),
                
                // Recomendaciones
                recommendations: recommendations,
                
                // Resumen ejecutivo
                executiveSummary: this.generateExecutiveSummary(simulatedData, projections, riskLevel)
            };
            
        } catch (error) {
            console.error('❌ Error en simulación financiera:', error);
            throw error;
        }
    }
    
    // Aplicar cambios simulados a datos base
    applySimulationChanges(baseData, variables) {
        let simulated = { ...baseData };
        
        variables.forEach(variable => {
            const change = parseFloat(variable.simulated_value) - parseFloat(variable.current_value);
            
            switch (variable.variable_type) {
                case 'income':
                    simulated.monthlyIncome += change;
                    break;
                case 'expense':
                    simulated.monthlyExpenses += change;
                    break;
                case 'debt':
                    simulated.totalDebt += change;
                    break;
                case 'saving':
                    simulated.totalSavings += change;
                    break;
                case 'investment':
                    simulated.totalSavings += change;
                    // Si es inversión, asumimos un retorno del 8% anual
                    if (change > 0) {
                        simulated.monthlyIncome += (change * 0.08 / 12);
                    }
                    break;
                case 'income_change':
                    // Cambio porcentual en ingresos
                    const percentChange = variable.simulated_value / 100;
                    simulated.monthlyIncome = baseData.monthlyIncome * (1 + percentChange);
                    break;
                case 'expense_change':
                    // Cambio porcentual en gastos
                    const expensePercentChange = variable.simulated_value / 100;
                    simulated.monthlyExpenses = baseData.monthlyExpenses * (1 + expensePercentChange);
                    break;
            }
        });
        
        // Asegurar valores no negativos
        simulated.monthlyIncome = Math.max(0, simulated.monthlyIncome);
        simulated.monthlyExpenses = Math.max(0, simulated.monthlyExpenses);
        simulated.totalSavings = Math.max(0, simulated.totalSavings);
        simulated.totalDebt = Math.max(0, simulated.totalDebt);
        
        return simulated;
    }
    
    // Calcular proyecciones
    calculateProjections(data) {
        const monthlyCashflow = data.monthlyIncome - data.monthlyExpenses;
        const savingsRate = data.monthlyIncome > 0 
            ? (monthlyCashflow / data.monthlyIncome) * 100 
            : 0;
        
        // Proyección a 1 año
        const yearlyProjection = {
            balance: data.totalSavings + (monthlyCashflow * 12),
            savings: data.totalSavings + (monthlyCashflow * 12 * 0.7), // 70% a ahorro
            debt: Math.max(0, data.totalDebt - (monthlyCashflow * 12 * 0.3)) // 30% a deuda
        };
        
        return {
            balance: yearlyProjection.balance,
            savings: yearlyProjection.savings,
            debt: yearlyProjection.debt,
            monthlyCashflow: monthlyCashflow,
            savingsRate: savingsRate,
            debtToIncome: data.monthlyIncome > 0 
                ? (data.totalDebt / (data.monthlyIncome * 12)) * 100 
                : 0,
            emergencyFundMonths: data.monthlyExpenses > 0 
                ? data.totalSavings / data.monthlyExpenses 
                : 0
        };
    }
    
    // Calcular métricas financieras adicionales
    calculateFinancialMetrics(baseData, simulatedData) {
        return {
            savingsRateChange: ((simulatedData.monthlyIncome - simulatedData.monthlyExpenses) - 
                               (baseData.monthlyIncome - baseData.monthlyExpenses)).toFixed(2),
            debtReductionRate: baseData.totalDebt > 0 
                ? ((baseData.totalDebt - simulatedData.totalDebt) / baseData.totalDebt * 100).toFixed(1)
                : 0,
            wealthGrowth: ((simulatedData.totalSavings - baseData.totalSavings) / 
                          (baseData.totalSavings || 1) * 100).toFixed(1)
        };
    }
    
    // Calcular probabilidad de éxito
    calculateSuccessProbability(data, projections) {
        let probability = 70; // Base
        
        // Factores positivos
        if (data.monthlyIncome > 2000) probability += 5;
        if (data.totalSavings > 5000) probability += 5;
        if (data.monthlyExpenses < data.monthlyIncome * 0.7) probability += 10;
        if (projections.emergencyFundMonths > 3) probability += 10;
        if (projections.savingsRate > 20) probability += 10;
        
        // Factores negativos
        if (data.totalDebt > data.monthlyIncome * 12) probability -= 15;
        if (data.monthlyExpenses > data.monthlyIncome) probability -= 20;
        if (projections.debtToIncome > 40) probability -= 10;
        if (projections.emergencyFundMonths < 1) probability -= 15;
        
        // Mantener entre 0 y 100
        return Math.min(100, Math.max(0, probability));
    }
    
    // Evaluar nivel de riesgo
    assessRiskLevel(data, projections) {
        let riskScore = 0;
        
        // Evaluar múltiples factores
        if (data.monthlyIncome < 1500) riskScore += 3;
        if (data.totalSavings < 1000) riskScore += 2;
        if (data.totalDebt > 10000) riskScore += 3;
        if (projections.debtToIncome > 40) riskScore += 2;
        if (projections.emergencyFundMonths < 3) riskScore += 2;
        if (projections.emergencyFundMonths < 1) riskScore += 3;
        if (data.monthlyExpenses > data.monthlyIncome * 0.9) riskScore += 2;
        
        // Determinar nivel
        if (riskScore <= 4) return 'low';
        if (riskScore <= 7) return 'medium';
        if (riskScore <= 10) return 'high';
        return 'critical';
    }
    
    // Generar recomendaciones
    generateRecommendations(data, projections, metrics) {
        const recommendations = [];
        
        // Recomendación 1: Fondo de emergencia
        if (projections.emergencyFundMonths < 3) {
            const monthsNeeded = Math.ceil(3 - projections.emergencyFundMonths);
            const amountNeeded = monthsNeeded * data.monthlyExpenses;
            
            recommendations.push({
                type: 'critical',
                icon: '⚠️',
                title: 'Fondo de emergencia insuficiente',
                description: `Tu fondo de emergencia cubre solo ${projections.emergencyFundMonths.toFixed(1)} meses de gastos.`,
                action: `Necesitas ahorrar S/${amountNeeded.toFixed(2)} más para tener 3 meses de respaldo.`,
                priority: 'Alta',
                impact: 'Protección financiera básica'
            });
        } else if (projections.emergencyFundMonths >= 6) {
            recommendations.push({
                type: 'success',
                icon: '✅',
                title: 'Excelente fondo de emergencia',
                description: `Tienes ${projections.emergencyFundMonths.toFixed(1)} meses de gastos cubiertos.`,
                action: 'Considera invertir el excedente para hacer crecer tu dinero.',
                priority: 'Baja',
                impact: 'Puedes empezar a invertir'
            });
        }
        
        // Recomendación 2: Nivel de deuda
        if (projections.debtToIncome > 40) {
            recommendations.push({
                type: 'warning',
                icon: '📊',
                title: 'Nivel de deuda elevado',
                description: `Tus deudas representan ${projections.debtToIncome.toFixed(1)}% de tus ingresos anuales.`,
                action: 'Considera el método "bola de nieve" para pagar deudas pequeñas primero.',
                priority: 'Alta',
                impact: 'Mejorará tu historial crediticio'
            });
        } else if (projections.debtToIncome < 20 && data.totalDebt > 0) {
            recommendations.push({
                type: 'info',
                icon: '👍',
                title: 'Deuda manejable',
                description: 'Tu nivel de deuda es saludable.',
                action: 'Mantén pagos puntuales para mejorar tu score crediticio.',
                priority: 'Media',
                impact: 'Buen historial crediticio'
            });
        }
        
        // Recomendación 3: Tasa de ahorro
        if (projections.savingsRate < 10) {
            recommendations.push({
                type: 'warning',
                icon: '💰',
                title: 'Tasa de ahorro baja',
                description: `Estás ahorrando solo ${projections.savingsRate.toFixed(1)}% de tus ingresos.`,
                action: 'Aplica la regla 50/30/20 para optimizar tu presupuesto.',
                priority: 'Media',
                impact: `Podrías ahorrar S/${(data.monthlyIncome * 0.2).toFixed(2)} mensuales`
            });
        } else if (projections.savingsRate > 30) {
            recommendations.push({
                type: 'success',
                icon: '🏆',
                title: 'Excelente tasa de ahorro',
                description: `Ahorras ${projections.savingsRate.toFixed(1)}% de tus ingresos.`,
                action: 'Diversifica tus ahorros en inversiones de bajo riesgo.',
                priority: 'Baja',
                impact: 'Crecimiento acelerado de patrimonio'
            });
        }
        
        // Recomendación 4: Oportunidad de inversión
        if (data.monthlyIncome > data.monthlyExpenses * 1.5 && data.totalSavings > 5000) {
            recommendations.push({
                type: 'opportunity',
                icon: '📈',
                title: 'Potencial de inversión',
                description: 'Tienes buen margen para comenzar a invertir.',
                action: 'Considera fondos indexados o ETFs para empezar.',
                priority: 'Media',
                impact: 'Rendimiento estimado: 8-12% anual'
            });
        }
        
        // Recomendación 5: Basada en el cambio simulado
        if (metrics.savingsRateChange > 0) {
            recommendations.push({
                type: 'insight',
                icon: '📈',
                title: 'Impacto positivo de la simulación',
                description: `Esta decisión aumentaría tu flujo de caja en S/${metrics.savingsRateChange} mensuales.`,
                action: 'Considera implementar este cambio en la vida real.',
                priority: 'Según tu criterio',
                impact: `S/${(parseFloat(metrics.savingsRateChange) * 12).toFixed(2)} anuales`
            });
        } else if (metrics.savingsRateChange < 0) {
            recommendations.push({
                type: 'caution',
                icon: '📉',
                title: 'Impacto negativo detectado',
                description: `Esta decisión reduciría tu flujo de caja en S/${Math.abs(parseFloat(metrics.savingsRateChange))} mensuales.`,
                action: 'Evalúa si el beneficio vale la pena.',
                priority: 'Evaluar cuidadosamente',
                impact: 'Pérdida de capacidad de ahorro'
            });
        }
        
        return recommendations;
    }
    
    // Generar resumen ejecutivo
    generateExecutiveSummary(data, projections, riskLevel) {
        const summaries = {
            low: '🎯 ESCENARIO OPTIMISTA: Tus finanzas son sólidas. Esta simulación muestra que puedes absorber cambios sin problemas.',
            medium: '⚖️ ESCENARIO MODERADO: Tus finanzas son estables pero requieren monitoreo. La simulación muestra un impacto manejable.',
            high: '⚠️ ESCENARIO DE RIESGO: Esta simulación presenta desafíos. Considera medidas de contingencia.',
            critical: '🔴 ESCENARIO CRÍTICO: Esta simulación podría comprometer tu estabilidad financiera. Revisa alternativas.'
        };
        
        const summary = summaries[riskLevel] || summaries.medium;
        
        const cashflowChange = (data.monthlyIncome - data.monthlyExpenses) - 
                              (projections.monthlyCashflow || 0);
        
        return {
            message: summary,
            cashflowImpact: cashflowChange > 0 ? 'positivo' : 'negativo',
            riskLevel: riskLevel,
            recommendation: cashflowChange > 0 
                ? 'La simulación muestra un escenario favorable. Podrías implementarlo gradualmente.'
                : 'La simulación muestra desafíos. Considera ajustar variables.'
        };
    }
    
    // Comparar escenarios
    async compareScenarios(scenarios) {
        const comparison = {
            bestScenario: null,
            worstScenario: null,
            metrics: {},
            summary: {}
        };
        
        let bestScore = -Infinity;
        let worstScore = Infinity;
        
        for (const scenario of scenarios) {
            const params = scenario.parameters || {};
            const score = this.calculateScenarioScore(params);
            
            if (score > bestScore) {
                bestScore = score;
                comparison.bestScenario = {
                    id: scenario.id,
                    name: scenario.name,
                    score: score
                };
            }
            
            if (score < worstScore) {
                worstScore = score;
                comparison.worstScenario = {
                    id: scenario.id,
                    name: scenario.name,
                    score: score
                };
            }
            
            comparison.metrics[scenario.id] = {
                score: score,
                impact: this.calculateScenarioImpact(params)
            };
        }
        
        comparison.summary = {
            bestScenarioName: comparison.bestScenario?.name,
            worstScenarioName: comparison.worstScenario?.name,
            scoreDifference: (bestScore - worstScore).toFixed(1),
            recommendation: bestScore > worstScore * 1.2 
                ? `El escenario "${comparison.bestScenario?.name}" es claramente superior.`
                : 'Los escenarios tienen resultados similares. Elige según tu comodidad.'
        };
        
        return comparison;
    }
    
    // Calcular puntuación de escenario
    calculateScenarioScore(params) {
        let score = 50; // Base
        
        if (params.income_increase) score += params.income_increase * 2;
        if (params.expense_reduction) score += params.expense_reduction * 1.5;
        if (params.investment_return) score += params.investment_return * 3;
        if (params.debt_reduction) score += params.debt_reduction * 2.5;
        if (params.new_savings) score += params.new_savings * 2;
        
        // Factores de riesgo
        if (params.risk_level === 'high') score -= 15;
        if (params.risk_level === 'low') score += 10;
        
        return Math.min(100, Math.max(0, score));
    }
    
    // Calcular impacto del escenario
    calculateScenarioImpact(params) {
        return {
            monthly: (params.income_increase || 0) + (params.expense_reduction || 0),
            yearly: ((params.income_increase || 0) + (params.expense_reduction || 0)) * 12,
            risk: params.risk_level || 'medium'
        };
    }
    
    // Validar datos de simulación
    validateSimulationData(simulation, variables) {
        const errors = [];
        
        if (!simulation.name) errors.push('Nombre de simulación requerido');
        if (!simulation.type) errors.push('Tipo de simulación requerido');
        
        if (!variables || variables.length === 0) {
            errors.push('Se requiere al menos una variable de simulación');
        } else {
            variables.forEach((v, i) => {
                if (!v.variable_name) errors.push(`Variable ${i+1}: nombre requerido`);
                if (v.current_value === undefined) errors.push(`Variable ${i+1}: valor actual requerido`);
                if (v.simulated_value === undefined) errors.push(`Variable ${i+1}: valor simulado requerido`);
            });
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = new DSEService();