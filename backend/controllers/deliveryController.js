const supabase = require('../config/supabase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { successResponse, createdResponse, batchResponse } = require('../utils/response');

// GET /api/delivery/zones — public, list all active zones
const getDeliveryZones = asyncHandler(async (req, res) => {
    const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true)
        .order('zone_name');

    if (error) throw new AppError('Failed to fetch delivery zones', 500);
    return batchResponse(res, 200, data || [], (data || []).length, 'Delivery zones retrieved');
});

// GET /api/delivery/charge?pincode=XXXXXX&total=0 — public, get charge for pincode
const getDeliveryCharge = asyncHandler(async (req, res) => {
    const { pincode, total = 0 } = req.query;

    if (!pincode || !/^[0-9]{6}$/.test(pincode)) {
        throw new AppError('Valid 6-digit pincode is required', 400);
    }

    const orderTotal = parseFloat(total) || 0;

    // Find zone that contains this pincode
    const { data: zones, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true)
        .contains('pincodes', [pincode]);

    if (error) throw new AppError('Failed to lookup delivery zone', 500);

    if (!zones || zones.length === 0) {
        // Default charge if no zone found
        return successResponse(res, 200, {
            found: false,
            zone_name: 'Standard Delivery',
            charge: 100,
            original_charge: 100,
            is_free: false,
            min_order_for_free: null,
            estimated_days: '5-7 days',
            pincode
        }, 'Default delivery charge applied');
    }

    const zone = zones[0];
    const isFree = zone.min_order_for_free_delivery && orderTotal >= parseFloat(zone.min_order_for_free_delivery);

    return successResponse(res, 200, {
        found: true,
        zone_id: zone.id,
        zone_name: zone.zone_name,
        charge: isFree ? 0 : parseFloat(zone.delivery_charge),
        original_charge: parseFloat(zone.delivery_charge),
        is_free: isFree,
        min_order_for_free: zone.min_order_for_free_delivery ? parseFloat(zone.min_order_for_free_delivery) : null,
        estimated_days: zone.estimated_days,
        pincode
    }, 'Delivery charge calculated');
});

// GET /api/delivery/zones/:id — admin
const getZoneById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('delivery_zones').select('*').eq('id', id).single();
    if (error || !data) throw new AppError('Zone not found', 404);
    return successResponse(res, 200, data, 'Zone retrieved');
});

// POST /api/delivery/zones — admin
const createZone = asyncHandler(async (req, res) => {
    const { zone_name, pincodes, delivery_charge, min_order_for_free_delivery, estimated_days } = req.body;

    if (!zone_name || !pincodes || delivery_charge === undefined) {
        throw new AppError('zone_name, pincodes, and delivery_charge are required', 400);
    }

    const { data, error } = await supabase
        .from('delivery_zones')
        .insert({ zone_name, pincodes, delivery_charge, min_order_for_free_delivery, estimated_days })
        .select()
        .single();

    if (error) throw new AppError('Failed to create zone: ' + error.message, 500);
    return createdResponse(res, data, 'Delivery zone created');
});

// PUT /api/delivery/zones/:id — admin
const updateZone = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    delete updates.id;

    const { data, error } = await supabase
        .from('delivery_zones')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new AppError('Failed to update zone: ' + error.message, 500);
    return successResponse(res, 200, data, 'Zone updated');
});

// DELETE /api/delivery/zones/:id — admin
const deleteZone = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('delivery_zones').delete().eq('id', id);
    if (error) throw new AppError('Failed to delete zone', 500);
    return successResponse(res, 200, null, 'Zone deleted');
});

module.exports = { getDeliveryZones, getDeliveryCharge, getZoneById, createZone, updateZone, deleteZone };
