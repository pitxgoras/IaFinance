// backend/setup.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Interfaz para leer entrada del usuario
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para hacer preguntas en consola
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function setupDatabase() {
    console.log('🚀 CONFIGURACIÓN DE BASE DE DATOS IA FINANCE');
    console.log('='.repeat(50));

    try {
        // Credenciales
        const host = await askQuestion('🔧 Host de MySQL (localhost): ') || 'localhost';
        const port = await askQuestion('🔧 Puerto de MySQL (3306): ') || '3306';
        const user = await askQuestion('🔧 Usuario de MySQL (root): ') || 'root';
        const password = await askQuestion('🔧 Contraseña de MySQL: ');
        const databaseName = await askQuestion('🔧 Nombre de la base de datos (iafinance): ') || 'iafinance';

        console.log('\n🔄 Conectando a MySQL...');

        const connection = await mysql.createConnection({
            host,
            port,
            user,
            password
        });

        console.log('✅ Conectado a MySQL');

        // 1. CREAR BASE DE DATOS
        await connection.query(`
            CREATE DATABASE IF NOT EXISTS \`${databaseName}\`
            CHARACTER SET utf8mb4
            COLLATE utf8mb4_unicode_ci
        `);

        await connection.query(`USE \`${databaseName}\``);

        // 2. TABLA USERS
        console.log('📊 Creando tabla users...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uuid VARCHAR(36) UNIQUE NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('admin', 'premium', 'standard') DEFAULT 'standard',
                status ENUM('active', 'inactive', 'pending', 'banned') DEFAULT 'pending',
                email_verified BOOLEAN DEFAULT FALSE,
                newsletter BOOLEAN DEFAULT FALSE,
                last_login DATETIME,
                login_attempts INT DEFAULT 0,
                lock_until DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_status (status)
            ) ENGINE=InnoDB
        `);

        // 3. TABLA SESIONES
        console.log('📊 Creando tabla user_sessions...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                session_token VARCHAR(500) NOT NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                device_info TEXT,
                expires_at DATETIME NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

        // 4. TABLA LOGS
        console.log('📊 Creando tabla activity_logs...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                activity_type VARCHAR(50) NOT NULL,
                description TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                metadata JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        `);

        // 5. TABLA PASSWORD RESETS
        console.log('📊 Creando tabla password_resets...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS password_resets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                reset_token VARCHAR(255) NOT NULL,
                expires_at DATETIME NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

        // 🔥 6. TABLA USER_FINANCES (NUEVA)
        console.log('📊 Creando tabla user_finances...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_finances (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNIQUE NOT NULL,
                monthly_income DECIMAL(10,2) DEFAULT 0,
                monthly_expenses DECIMAL(10,2) DEFAULT 0,
                total_savings DECIMAL(10,2) DEFAULT 0,
                total_debt DECIMAL(10,2) DEFAULT 0,
                risk_profile ENUM('conservative', 'moderate', 'aggressive') DEFAULT 'moderate',
                financial_goals JSON,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

        // 🔥 7. TABLA SIMULATIONS (NUEVA)
        console.log('📊 Creando tabla simulations...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS simulations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                simulation_type ENUM(
                    'income_change',
                    'new_debt',
                    'investment',
                    'complex_scenario'
                ) NOT NULL,
                data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_simulations (user_id, created_at)
            ) ENGINE=InnoDB
        `);

        // 8. CREAR ADMIN
        console.log('👑 Creando usuario administrador...');
        const adminEmail = await askQuestion('📧 Email admin (admin@iafinance.com): ') || 'admin@iafinance.com';
        const adminPassword = await askQuestion('🔑 Password admin (Admin123!): ') || 'Admin123!';

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);
        const { v4: uuidv4 } = require('uuid');

        await connection.query(`
            INSERT INTO users (uuid, first_name, last_name, email, password_hash, role, status, email_verified)
            VALUES (?, 'Admin', 'Sistema', ?, ?, 'admin', 'active', TRUE)
            ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
        `, [uuidv4(), adminEmail, passwordHash]);

        console.log('\n🎉 CONFIGURACIÓN COMPLETADA CORRECTAMENTE');
        console.log('🚀 IA FINANCE LISTO PARA USARSE');

        await connection.end();
        rl.close();

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        rl.close();
        process.exit(1);
    }
}

if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;
