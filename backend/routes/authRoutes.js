// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        
        console.log('📝 Intento de registro:', { nombre, email });
        
        // Validar datos requeridos
        if (!nombre || !email || !password) {
            console.log('❌ Datos incompletos');
            return res.status(400).json({ 
                error: 'Nombre, email y password son requeridos' 
            });
        }
        
        // Verificar si el email ya existe
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log('❌ Email ya registrado:', email);
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        
        // Encriptar password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('✅ Password hasheado correctamente');
        
        // Insertar usuario
        const [result] = await db.query(
            'INSERT INTO users (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, hashedPassword]
        );
        
        const userId = result.insertId;
        console.log('✅ Usuario creado con ID:', userId);
        
        // Crear perfil financiero por defecto
        await db.query(
            'INSERT INTO user_profiles (user_id, monthly_income, monthly_expenses, total_savings, total_debt, risk_profile) VALUES (?, 0, 0, 0, 0, "moderate")',
            [userId]
        );
        console.log('✅ Perfil financiero creado');
        
        // Generar token JWT
        const token = jwt.sign(
            { id: userId, nombre, email },
            process.env.JWT_SECRET || 'iafinance_super_secret_key_2026',
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: userId,
                nombre,
                email
            }
        });
        
    } catch (error) {
        console.error('❌ Error DETALLADO en registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario: ' + error.message });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 Intento de login:', { email });
        
        // Validar datos
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y password son requeridos' });
        }
        
        // Buscar usuario
        const [users] = await db.query(
            'SELECT id, nombre, email, password, isAdmin FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            console.log('❌ Usuario no encontrado:', email);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const user = users[0];
        console.log('✅ Usuario encontrado:', user.email);
        
        // Verificar password con bcrypt
        try {
            const validPassword = await bcrypt.compare(password, user.password);
            console.log('🔐 Resultado de comparación:', validPassword ? 'VÁLIDA' : 'INVÁLIDA');
            
            if (!validPassword) {
                console.log('❌ Password incorrecto para:', email);
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
        } catch (bcryptError) {
            console.error('❌ Error en bcrypt.compare:', bcryptError);
            
            // FALLBACK: Si bcrypt falla, comparar directamente (solo para pruebas)
            if (password !== user.password) {
                console.log('❌ Password incorrecto (fallback):', email);
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
        }
        
        console.log('✅ Password correcto');
        
        // Generar token
        const token = jwt.sign(
            { 
                id: user.id, 
                nombre: user.nombre, 
                email: user.email,
                isAdmin: user.isAdmin || false 
            },
            process.env.JWT_SECRET || 'iafinance_super_secret_key_2026',
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                isAdmin: user.isAdmin || false
            }
        });
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión: ' + error.message });
    }
});

// Obtener perfil del usuario
router.get('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Token requerido' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'iafinance_super_secret_key_2026');
        
        const [users] = await db.query(
            'SELECT id, nombre, email, isAdmin, created_at FROM users WHERE id = ?',
            [decoded.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const [profiles] = await db.query(
            'SELECT * FROM user_profiles WHERE user_id = ?',
            [decoded.id]
        );
        
        res.json({
            user: users[0],
            profile: profiles[0] || null
        });
        
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
});

module.exports = router;