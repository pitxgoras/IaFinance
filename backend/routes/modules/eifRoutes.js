const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const crypto = require('crypto');

// ============================================
// CONFIGURACIÓN PARA PRUEBAS - AUTENTICACIÓN DESACTIVADA
// ============================================
router.use((req, res, next) => {
    req.user = { id: 1 }; // Usuario administrador con ID 1
    console.log('👤 Usuario de prueba EIF - ID:', req.user.id);
    next();
});

// ============================================
// SERVICIOS CONECTADOS
// ============================================

// Obtener todos los servicios conectados del usuario
router.get('/services', async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('📥 GET /services - Usuario:', userId);
        
        const [services] = await db.query(
            'SELECT id, service_name, service_type, connection_status, last_sync_at, created_at FROM connected_services WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        
        res.json({ services });
    } catch (error) {
        console.error('❌ Error getting services:', error);
        res.status(500).json({ error: error.message });
    }
});

// Conectar nuevo servicio
router.post('/services/connect', async (req, res) => {
    try {
        const userId = req.user.id;
        const { serviceName, serviceType, credentials } = req.body;
        
        console.log('📥 POST /services/connect - Usuario:', userId, 'Servicio:', serviceName, 'Tipo:', serviceType);
        
        if (!serviceName || !serviceType) {
            return res.status(400).json({ error: 'Nombre y tipo de servicio son requeridos' });
        }

        // Simular conexión exitosa con token de acceso
        const accessToken = crypto.randomBytes(32).toString('hex');
        const refreshToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 días

        const [result] = await db.query(
            `INSERT INTO connected_services 
             (user_id, service_name, service_type, connection_status, access_token, refresh_token, token_expires_at) 
             VALUES (?, ?, ?, 'active', ?, ?, ?)`,
            [userId, serviceName, serviceType, accessToken, refreshToken, expiresAt]
        );
        
        console.log('✅ Servicio conectado con ID:', result.insertId);
        
        res.status(201).json({
            message: '✅ Servicio conectado exitosamente',
            serviceId: result.insertId
        });
    } catch (error) {
        console.error('❌ Error connecting service:', error);
        res.status(500).json({ error: error.message });
    }
});

// Sincronizar servicio
router.post('/services/:id/sync', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        console.log('📥 POST /services/sync - Usuario:', userId, 'Servicio:', id);
        
        // Verificar que el servicio pertenece al usuario
        const [services] = await db.query(
            'SELECT * FROM connected_services WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (services.length === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }
        
        const service = services[0];
        
        // Simular sincronización de datos
        const syncData = {
            syncedAt: new Date(),
            accounts: generateMockAccounts(service.service_type),
            transactions: generateMockTransactions(service.service_type)
        };
        
        // Guardar log de integración
        await db.query(
            `INSERT INTO integration_logs 
             (service_id, event_type, request_payload, response_payload, status_code, duration_ms) 
             VALUES (?, 'sync', ?, ?, 200, ?)`,
            [id, JSON.stringify({}), JSON.stringify(syncData), Math.floor(Math.random() * 500) + 100]
        );
        
        // Actualizar último sync
        await db.query(
            'UPDATE connected_services SET last_sync_at = NOW() WHERE id = ?',
            [id]
        );
        
        res.json({
            message: '✅ Sincronización completada',
            data: syncData
        });
    } catch (error) {
        console.error('❌ Error syncing service:', error);
        res.status(500).json({ error: error.message });
    }
});

// Desconectar servicio
router.delete('/services/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        console.log('📥 DELETE /services - Usuario:', userId, 'Servicio:', id);
        
        const [result] = await db.query(
            'DELETE FROM connected_services WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }
        
        res.json({ message: '✅ Servicio desconectado' });
    } catch (error) {
        console.error('❌ Error disconnecting service:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// APIS EXTERNAS DISPONIBLES
// ============================================

router.get('/external-apis', async (req, res) => {
    try {
        const [apis] = await db.query(
            'SELECT id, api_name, api_type, base_url, auth_type, documentation_url, status FROM external_apis WHERE status = "active" ORDER BY api_name'
        );
        
        // Si no hay APIs, crear algunas de ejemplo
        if (apis.length === 0) {
            const exampleApis = [
                {
                    api_name: 'Plaid',
                    api_type: 'banking',
                    base_url: 'https://sandbox.plaid.com',
                    auth_type: 'oauth2',
                    documentation_url: 'https://plaid.com/docs',
                    status: 'active'
                },
                {
                    api_name: 'Upwork API',
                    api_type: 'freelance',
                    base_url: 'https://www.upwork.com/api',
                    auth_type: 'oauth2',
                    documentation_url: 'https://developers.upwork.com',
                    status: 'active'
                },
                {
                    api_name: 'Coinbase',
                    api_type: 'crypto',
                    base_url: 'https://api.coinbase.com',
                    auth_type: 'api_key',
                    documentation_url: 'https://docs.cloud.coinbase.com',
                    status: 'active'
                },
                {
                    api_name: 'Stripe',
                    api_type: 'payment',
                    base_url: 'https://api.stripe.com',
                    auth_type: 'api_key',
                    documentation_url: 'https://stripe.com/docs',
                    status: 'active'
                }
            ];
            
            for (const api of exampleApis) {
                await db.query(
                    'INSERT INTO external_apis (api_name, api_type, base_url, auth_type, documentation_url, status) VALUES (?, ?, ?, ?, ?, ?)',
                    [api.api_name, api.api_type, api.base_url, api.auth_type, api.documentation_url, api.status]
                );
            }
            
            const [newApis] = await db.query(
                'SELECT id, api_name, api_type, base_url, auth_type, documentation_url, status FROM external_apis WHERE status = "active" ORDER BY api_name'
            );
            
            return res.json({ apis: newApis });
        }
        
        res.json({ apis });
    } catch (error) {
        console.error('❌ Error getting external APIs:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// WEBHOOKS
// ============================================

// Registrar webhook
router.post('/webhooks/register', async (req, res) => {
    try {
        const userId = req.user.id;
        const { serviceId, webhookUrl, eventType } = req.body;
        
        console.log('📥 POST /webhooks/register - Usuario:', userId, 'Servicio:', serviceId);
        
        if (!serviceId || !webhookUrl || !eventType) {
            return res.status(400).json({ error: 'ServiceId, webhookUrl y eventType son requeridos' });
        }
        
        // Verificar que el servicio pertenece al usuario
        const [services] = await db.query(
            'SELECT id FROM connected_services WHERE id = ? AND user_id = ?',
            [serviceId, userId]
        );
        
        if (services.length === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }
        
        const secretKey = crypto.randomBytes(32).toString('hex');
        
        const [result] = await db.query(
            `INSERT INTO webhooks 
             (user_id, service_id, webhook_url, event_type, secret_key, is_active) 
             VALUES (?, ?, ?, ?, ?, 1)`,
            [userId, serviceId, webhookUrl, eventType, secretKey]
        );
        
        res.status(201).json({
            message: '✅ Webhook registrado',
            webhookId: result.insertId,
            secretKey
        });
    } catch (error) {
        console.error('❌ Error registering webhook:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener webhooks del usuario
router.get('/webhooks', async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [webhooks] = await db.query(
            `SELECT w.*, s.service_name 
             FROM webhooks w
             JOIN connected_services s ON w.service_id = s.id
             WHERE w.user_id = ? AND w.is_active = 1
             ORDER BY w.created_at DESC`,
            [userId]
        );
        
        res.json({ webhooks });
    } catch (error) {
        console.error('❌ Error getting webhooks:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// LOGS DE INTEGRACIÓN
// ============================================

router.get('/logs/:serviceId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { serviceId } = req.params;
        const { limit = 50 } = req.query;
        
        // Verificar que el servicio pertenece al usuario
        const [services] = await db.query(
            'SELECT id FROM connected_services WHERE id = ? AND user_id = ?',
            [serviceId, userId]
        );
        
        if (services.length === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }
        
        const [logs] = await db.query(
            'SELECT * FROM integration_logs WHERE service_id = ? ORDER BY created_at DESC LIMIT ?',
            [serviceId, parseInt(limit)]
        );
        
        res.json({ logs });
    } catch (error) {
        console.error('❌ Error getting logs:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function generateMockAccounts(serviceType) {
    const accounts = [];
    
    if (serviceType === 'bank') {
        accounts.push(
            { id: '1', name: 'Cuenta Corriente', balance: 5430.50, currency: 'PEN', lastDigits: '1234' },
            { id: '2', name: 'Cuenta de Ahorros', balance: 12500.00, currency: 'PEN', lastDigits: '5678' }
        );
    } else if (serviceType === 'freelance') {
        accounts.push(
            { id: '1', name: 'Upwork', balance: 850.00, currency: 'USD', pending: 320.00 },
            { id: '2', name: 'Fiverr', balance: 420.00, currency: 'USD', pending: 150.00 }
        );
    } else if (serviceType === 'investment') {
        accounts.push(
            { id: '1', name: 'Portafolio de Acciones', balance: 8500.00, currency: 'USD', returns: '+12.5%' },
            { id: '2', name: 'Fondos Mutuos', balance: 3200.00, currency: 'PEN', returns: '+8.3%' }
        );
    }
    
    return accounts;
}

function generateMockTransactions(serviceType) {
    const transactions = [];
    const descriptions = {
        bank: ['Pago de nómina', 'Transferencia recibida', 'Pago de servicios', 'Compra en tienda'],
        freelance: ['Pago de proyecto', 'Bono por desempeño', 'Pago recurrente', 'Comisión'],
        investment: ['Dividendo', 'Venta de acciones', 'Compra de acciones', 'Interés ganado']
    };
    
    const descList = descriptions[serviceType] || ['Transacción'];
    
    for (let i = 0; i < 5; i++) {
        const amount = (Math.random() * 1000).toFixed(2);
        const type = Math.random() > 0.5 ? 'income' : 'expense';
        
        transactions.push({
            id: i + 1,
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            description: descList[Math.floor(Math.random() * descList.length)],
            amount: type === 'income' ? parseFloat(amount) : -parseFloat(amount),
            type: type,
            status: 'completed'
        });
    }
    
    return transactions;
}

module.exports = router;