const router = require('express').Router();
const { getDeliveryZones, getDeliveryCharge, getZoneById, createZone, updateZone, deleteZone } = require('../controllers/deliveryController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public routes
router.get('/zones', getDeliveryZones);
router.get('/charge', getDeliveryCharge);

// Admin routes
router.get('/zones/:id', authenticate, requireRole(['admin']), getZoneById);
router.post('/zones', authenticate, requireRole(['admin']), createZone);
router.put('/zones/:id', authenticate, requireRole(['admin']), updateZone);
router.delete('/zones/:id', authenticate, requireRole(['admin']), deleteZone);

module.exports = router;
