// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Obtener token del header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Acceso denegado. Token no proporcionado.' 
            });
        }
        
        // Verificar token
        const verified = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'iafinance_super_secret_key_2026'
        );
        
        // Añadir usuario a la request
        req.user = verified;
        next();
        
    } catch (error) {
        console.error('Error de autenticación:', error.message);
        res.status(401).json({ 
            error: 'Token inválido o expirado' 
        });
    }
};
