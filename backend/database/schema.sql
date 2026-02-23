-- ============================================
-- IA Finance - Database Schema
-- Adaptado a tu estructura existente
-- ============================================

CREATE DATABASE IF NOT EXISTS iafinance;
USE iafinance;

-- ============================================
-- TABLA DE PERFILES (nueva)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    monthly_income DECIMAL(10,2) DEFAULT 0,
    monthly_expenses DECIMAL(10,2) DEFAULT 0,
    total_savings DECIMAL(10,2) DEFAULT 0,
    total_debt DECIMAL(10,2) DEFAULT 0,
    risk_profile ENUM('conservative', 'moderate', 'aggressive') DEFAULT 'moderate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABLA DE TRANSACCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    date DATE NOT NULL,
    status ENUM('completed', 'pending', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABLAS DSE
-- ============================================
CREATE TABLE IF NOT EXISTS simulations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('income_change', 'expense_change', 'debt_payment', 'investment', 'custom') NOT NULL,
    status ENUM('draft', 'running', 'completed', 'cancelled') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS simulation_variables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    simulation_id INT NOT NULL,
    variable_name VARCHAR(50) NOT NULL,
    variable_type ENUM('income', 'expense', 'debt', 'saving', 'investment') NOT NULL,
    current_value DECIMAL(10,2) NOT NULL,
    simulated_value DECIMAL(10,2) NOT NULL,
    impact_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS simulation_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    simulation_id INT NOT NULL,
    projected_balance DECIMAL(10,2) NOT NULL,
    projected_savings DECIMAL(10,2) NOT NULL,
    projected_debt DECIMAL(10,2) NOT NULL,
    risk_level ENUM('low', 'medium', 'high') NOT NULL,
    success_probability DECIMAL(5,2),
    monthly_impact DECIMAL(10,2),
    yearly_impact DECIMAL(10,2),
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
);

-- ============================================
-- 2. PFSE - PRESCRIPTIVE FINANCIAL STRATEGY ENGINE
-- ============================================

-- Estrategias financieras
CREATE TABLE financial_strategies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('debt', 'saving', 'investment', 'budget', 'income') NOT NULL,
    priority INT DEFAULT 1,
    description TEXT,
    status ENUM('active', 'completed', 'paused', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recomendaciones prescriptivas
CREATE TABLE prescriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    strategy_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    action_type ENUM('pay_debt', 'save_money', 'invest', 'reduce_expense', 'increase_income') NOT NULL,
    target_amount DECIMAL(10,2),
    deadline DATE,
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    behavioral_insight TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (strategy_id) REFERENCES financial_strategies(id) ON DELETE SET NULL
);

-- Métricas de comportamiento
CREATE TABLE behavioral_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    metric_type ENUM('spending_habit', 'saving_habit', 'debt_behavior', 'investment_behavior') NOT NULL,
    score INT CHECK (score BETWEEN 1 AND 100),
    insight TEXT,
    recommended_action TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Estrategias por perfil de riesgo
CREATE TABLE risk_strategies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    risk_profile ENUM('conservative', 'moderate', 'aggressive') NOT NULL,
    strategy_name VARCHAR(100) NOT NULL,
    description TEXT,
    allocation_rules JSON NOT NULL,
    expected_return DECIMAL(5,2),
    volatility DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. IOIE - INCOME OPPORTUNITY INTELLIGENCE ENGINE
-- ============================================

-- Oportunidades de ingreso
CREATE TABLE income_opportunities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('freelance', 'part_time', 'investment', 'passive', 'gig') NOT NULL,
    estimated_income_min DECIMAL(10,2),
    estimated_income_max DECIMAL(10,2),
    required_skills TEXT,
    time_commitment_hours INT,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    success_rate DECIMAL(5,2),
    similarity_score DECIMAL(5,2),
    status ENUM('recommended', 'applied', 'accepted', 'rejected', 'completed') DEFAULT 'recommended',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Perfiles de habilidades de usuarios
CREATE TABLE user_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
    years_experience INT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, skill_name)
);

-- Experiencias de otros usuarios (anónimas)
CREATE TABLE user_experiences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    opportunity_id INT NOT NULL,
    user_profile_hash VARCHAR(255) NOT NULL,
    actual_income DECIMAL(10,2),
    time_spent_hours INT,
    satisfaction_score INT CHECK (satisfaction_score BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (opportunity_id) REFERENCES income_opportunities(id) ON DELETE CASCADE
);

-- Recomendaciones basadas en ML
CREATE TABLE ml_recommendations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    opportunity_id INT NOT NULL,
    recommendation_score DECIMAL(5,2),
    recommendation_reason TEXT,
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES income_opportunities(id) ON DELETE CASCADE
);

-- ============================================
-- 4. EIF - ECOSYSTEM INTEGRATION FABRIC
-- ============================================

-- Servicios conectados
CREATE TABLE connected_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    service_type ENUM('bank', 'freelance', 'investment', 'payment', 'other') NOT NULL,
    connection_status ENUM('active', 'inactive', 'error') DEFAULT 'active',
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP NULL,
    last_sync_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- APIs externas disponibles
CREATE TABLE external_apis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    api_name VARCHAR(100) NOT NULL,
    api_type ENUM('banking', 'freelance', 'crypto', 'job', 'payment') NOT NULL,
    base_url VARCHAR(255) NOT NULL,
    auth_type ENUM('oauth2', 'api_key', 'jwt', 'none') NOT NULL,
    documentation_url VARCHAR(255),
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks registrados
CREATE TABLE webhooks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    webhook_url VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    secret_key VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES connected_services(id) ON DELETE CASCADE
);

-- Logs de integración
CREATE TABLE integration_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    request_payload JSON,
    response_payload JSON,
    status_code INT,
    error_message TEXT,
    duration_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES connected_services(id) ON DELETE CASCADE
);

-- ============================================
-- 5. CFIL - CONVERSATIONAL FINANCIAL INTELLIGENCE LAYER
-- ============================================

-- Conversaciones con Roman (chatbot)
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    status ENUM('active', 'closed', 'archived') DEFAULT 'active',
    context JSON,
    sentiment_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mensajes de la conversación
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender ENUM('user', 'bot') NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'question', 'recommendation', 'alert', 'insight') DEFAULT 'text',
    intent VARCHAR(100),
    entities JSON,
    sentiment ENUM('positive', 'neutral', 'negative'),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Explicaciones de IA (Explainable AI)
CREATE TABLE ai_explanations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    explanation_type ENUM('recommendation', 'prediction', 'insight', 'alert') NOT NULL,
    original_reasoning TEXT,
    simplified_explanation TEXT NOT NULL,
    key_factors JSON,
    confidence_factors JSON,
    alternative_options JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Feedback del usuario sobre respuestas
CREATE TABLE message_feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    helpful BOOLEAN,
    feedback_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Intenciones del usuario (para entrenamiento)
CREATE TABLE user_intents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    intent_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    examples JSON,
    response_template TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para DSE
CREATE INDEX idx_simulations_user ON simulations(user_id);
CREATE INDEX idx_simulations_status ON simulations(status);
CREATE INDEX idx_simulation_results_simulation ON simulation_results(simulation_id);

-- Índices para PFSE
CREATE INDEX idx_strategies_user ON financial_strategies(user_id);
CREATE INDEX idx_strategies_status ON financial_strategies(status);
CREATE INDEX idx_prescriptions_user ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- Índices para IOIE
CREATE INDEX idx_opportunities_user ON income_opportunities(user_id);
CREATE INDEX idx_opportunities_status ON income_opportunities(status);
CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_ml_recommendations_user ON ml_recommendations(user_id);

-- Índices para EIF
CREATE INDEX idx_connected_services_user ON connected_services(user_id);
CREATE INDEX idx_connected_services_status ON connected_services(connection_status);
CREATE INDEX idx_integration_logs_service ON integration_logs(service_id);

-- Índices para CFIL
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_ai_explanations_message ON ai_explanations(message_id);

-- ============================================
-- DATOS INICIALES (OPCIONAL)
-- ============================================

-- Estrategias por riesgo
INSERT INTO risk_strategies (risk_profile, strategy_name, description, allocation_rules, expected_return, volatility) VALUES
('conservative', 'Preservación de Capital', 'Enfoque en seguridad y liquidez', '{"stocks": 10, "bonds": 40, "cash": 30, "real_estate": 20}', 4.5, 3.2),
('moderate', 'Crecimiento Balanceado', 'Balance entre riesgo y retorno', '{"stocks": 40, "bonds": 30, "cash": 15, "real_estate": 15}', 7.8, 8.5),
('aggressive', 'Máximo Crecimiento', 'Alto riesgo para alto retorno', '{"stocks": 70, "bonds": 10, "cash": 5, "real_estate": 15}', 12.5, 15.2);

-- Intenciones de usuario para chatbot
INSERT INTO user_intents (intent_name, description, examples, response_template, category) VALUES
('inversion_advice', 'Consejos sobre inversiones', '["cómo invertir", "mejores inversiones", "dónde invertir"]', 'Te recomiendo diversificar según tu perfil de riesgo...', 'investment'),
('saving_tips', 'Consejos de ahorro', '["cómo ahorrar", "tips de ahorro", "ahorrar dinero"]', 'Para ahorrar efectivamente, prueba la regla 50/30/20...', 'saving'),
('debt_management', 'Manejo de deudas', '["cómo pagar deudas", "consolidar deudas", "salir de deudas"]', 'Prioriza deudas con mayor interés primero...', 'debt'),
('budget_planning', 'Planificación presupuestaria', '["hacer presupuesto", "planificar gastos", "controlar gastos"]', 'Un buen presupuesto te ayuda a controlar tus finanzas...', 'budget'),
('retirement_planning', 'Planificación de jubilación', '["jubilación", "retiro", "pensión"]', 'Nunca es demasiado temprano para planificar tu jubilación...', 'retirement');

