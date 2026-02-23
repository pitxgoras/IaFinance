// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE GLOBALES - VERSIÓN MEJORADA
// ============================================

// Configuración CORS más permisiva para desarrollo
const corsOptions = {
    origin: ['http://localhost:4200', 'http://localhost:4201', 'http://localhost:4202'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 204,
    preflightContinue: false
};

// Aplicar CORS antes que cualquier otro middleware
app.use(cors(corsOptions));

// Middleware adicional para asegurar headers CORS
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (['http://localhost:4200', 'http://localhost:4201', 'http://localhost:4202'].includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// Seguridad
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

// Compresión de respuestas
app.use(compression());

// Parseo de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (menos estricto para desarrollo)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // límite más alto para desarrollo
    skip: (req) => req.method === 'OPTIONS' // No limitar preflight requests
});
app.use('/api', limiter);

// ============================================
// CONEXIÓN A BASE DE DATOS
// ============================================

let db;

const connectDB = async () => {
    try {
        db = await mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '123456',
            database: process.env.DB_NAME || 'iafinance',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('✅ Conexión a MySQL establecida');
        return db;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        process.exit(1);
    }
};

// ============================================
// RUTAS BÁSICAS
// ============================================

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 IA Finance Backend funcionando!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        modules: ['DSE', 'PFSE', 'IOIE', 'EIF', 'CFIL']
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// ============================================
// RUTAS DE MÓDULOS
// ============================================

try {
    // Importar rutas de autenticación
    const authRoutes = require('./routes/authRoutes');
    
    // Importar rutas de módulos
    const dseRoutes = require('./routes/modules/dseRoutes');
    const pfseRoutes = require('./routes/modules/pfseRoutes');
    const ioieRoutes = require('./routes/modules/ioieRoutes');
    const eifRoutes = require('./routes/modules/eifRoutes');
    const cfilRoutes = require('./routes/modules/cfilRoutes');
    
    // Usar rutas
    app.use('/api/auth', authRoutes);
    app.use('/api/dse', dseRoutes);
    app.use('/api/pfse', pfseRoutes);
    app.use('/api/ioie', ioieRoutes);
    app.use('/api/eif', eifRoutes);
    app.use('/api/cfil', cfilRoutes);
    
    console.log('✅ Rutas de módulos cargadas: Auth, DSE, PFSE, IOIE, EIF, CFIL');
    
} catch (error) {
    console.log('⚠️ Error cargando algunos módulos:', error.message);
}

// ============================================
// MANEJO DE ERRORES
// ============================================

// Middleware para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path
    });
});

// Middleware de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    
    // Manejar errores CORS específicamente
    if (err.message.includes('CORS')) {
        return res.status(500).json({
            error: 'Error de CORS - Verifica la configuración',
            details: err.message
        });
    }
    
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async () => {
    try {
        await connectDB();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`
    ========================================
    🚀  IA FINANCE BACKEND
    ========================================
    📡  Servidor: http://localhost:${PORT}
    💾  Base de datos: ${process.env.DB_NAME || 'iafinance'}
    📦  Módulos: DSE, PFSE, IOIE, EIF, CFIL
    🔧  Entorno: ${process.env.NODE_ENV || 'development'}
    🌐  CORS permitido para: http://localhost:4200, 4201, 4202
    ========================================
            `);
        });
    } catch (error) {
        console.error('❌ Error al iniciar servidor:', error.message);
        process.exit(1);
    }
};

startServer();

// ============================================
// MANEJO DE CIERRE GRACEFUL
// ============================================

process.on('SIGTERM', () => {
    console.log('\n📴 SIGTERM recibido, cerrando servidor...');
    if (db) {
        db.end().then(() => {
            console.log('💾 Conexión a DB cerrada');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('SIGINT', () => {
    console.log('\n📴 SIGINT recibido, cerrando servidor...');
    if (db) {
        db.end().then(() => {
            console.log('💾 Conexión a DB cerrada');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

module.exports = { app, db };