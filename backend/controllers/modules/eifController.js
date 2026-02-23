// backend/controllers/modules/eifController.js
const db = require('../../config/database');
const eifService = require('../../services/modules/eifService');
const axios = require('axios');

// Conectar nuevo servicio
exports.connectService = async (req, res) => {
    try {
        const userId = req.user.id;
        const { serviceName, serviceType, credentials } = req.body;
        
        // Intentar conectar con el servicio externo
        const connectionResult = await eifService.connectExternalService(
            serviceType,
            credentials
        );
        
        if (!connectionResult.success) {
            return res.status(400).json({ 
                error: 'No se pudo conectar al servicio',
                details: connectionResult.error
            });
        }
        
        // Guardar conexión en BD
        const [result] = await db.query(
            `INSERT INTO connected_services 
             (user_id, service_name, service_type, connection_status, 
              access_token, refresh_token, token_expires_at) 
             VALUES (?, ?, ?, 'active', ?, ?, ?)`,
            [userId, serviceName, serviceType, 
             connectionResult.accessToken, 
             connectionResult.refreshToken,
             connectionResult.expiresAt]
        );
        
        res.status(201).json({
            message: 'Servicio conectado exitosamente',
            serviceId: result.insertId
        });
        
    } catch (error) {
        console.error('Error conectando servicio:', error);
        res.status(500).json({ error: 'Error al conectar servicio' });
    }
};

// Obtener servicios conectados
exports.getConnectedServices = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [services] = await db.query(
            `SELECT id, service_name, service_type, connection_status, 
                    last_sync_at, created_at 
             FROM connected_services 
             WHERE user_id = ?`,
            [userId]
        );
        
        res.json({ services });
        
    } catch (error) {
        console.error('Error obteniendo servicios:', error);
        res.status(500).json({ error: 'Error al obtener servicios' });
    }
};

// Sincronizar servicio
exports.syncService = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        // Obtener servicio
        const [services] = await db.query(
            'SELECT * FROM connected_services WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (services.length === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }
        
        const service = services[0];
        
        // Sincronizar datos
        const syncResult = await eifService.syncServiceData(service);
        
        // Actualizar último sync
        await db.query(
            'UPDATE connected_services SET last_sync_at = NOW() WHERE id = ?',
            [id]
        );
        
        // Guardar log
        await db.query(
            `INSERT INTO integration_logs 
             (service_id, event_type, request_payload, response_payload, status_code) 
             VALUES (?, 'sync', ?, ?, ?)`,
            [id, JSON.stringify({}), JSON.stringify(syncResult.data), 200]
        );
        
        res.json({
            message: 'Sincronización completada',
            data: syncResult.data
        });
        
    } catch (error) {
        console.error('Error sincronizando servicio:', error);
        res.status(500).json({ error: 'Error al sincronizar' });
    }
};

// Desconectar servicio
exports.disconnectService = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        await db.query(
            'DELETE FROM connected_services WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        res.json({ message: 'Servicio desconectado' });
        
    } catch (error) {
        console.error('Error desconectando servicio:', error);
        res.status(500).json({ error: 'Error al desconectar' });
    }
};

// Registrar webhook
exports.registerWebhook = async (req, res) => {
    try {
        const userId = req.user.id;
        const { serviceId, webhookUrl, eventType } = req.body;
        
        const [result] = await db.query(
            `INSERT INTO webhooks 
             (user_id, service_id, webhook_url, event_type, secret_key) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, serviceId, webhookUrl, eventType, 
             require('crypto').randomBytes(32).toString('hex')]
        );
        
        res.status(201).json({
            message: 'Webhook registrado',
            webhookId: result.insertId
        });
        
    } catch (error) {
        console.error('Error registrando webhook:', error);
        res.status(500).json({ error: 'Error al registrar webhook' });
    }
};