// Delivery Charges Calculator - uses backend API only
class DeliveryChargeCalculator {
    constructor() {
        this.deliveryInfo = null;
        this.apiBase = window.API_BASE_URL || 'http://localhost:4000/api';
    }

    async getDeliveryCharge(pincode, orderTotal = 0) {
        if (!pincode || pincode.length !== 6) return this.getDefaultCharge();

        try {
            const res = await fetch(`${this.apiBase}/delivery/charge?pincode=${pincode}&total=${orderTotal}`);
            if (!res.ok) return this.getDefaultCharge();

            const json = await res.json();
            const d = json.data;

            this.deliveryInfo = {
                zoneName: d.zone_name,
                charge: d.charge,
                originalCharge: d.original_charge,
                minOrderForFree: d.min_order_for_free,
                estimatedDays: d.estimated_days,
                isFreeDelivery: d.is_free,
                pincode
            };
            return this.deliveryInfo;
        } catch (e) {
            console.error('Delivery charge lookup failed:', e);
            return this.getDefaultCharge();
        }
    }

    getDefaultCharge() {
        return {
            zoneName: 'Standard Delivery',
            charge: 100,
            originalCharge: 100,
            minOrderForFree: 1000,
            estimatedDays: '5-7 days',
            isFreeDelivery: false,
            pincode: null
        };
    }

    calculateTotal(subtotal, deliveryCharge) {
        return parseFloat(subtotal) + parseFloat(deliveryCharge);
    }

    formatDeliveryInfo(info) {
        if (!info) return '';
        const freeMsg = info.minOrderForFree && !info.isFreeDelivery
            ? `<div style="font-size:12px;color:#666;margin-top:6px;">Add ₹${(info.minOrderForFree - (window.cartSubtotal || 0)).toFixed(2)} more for free delivery</div>`
            : '';
        const chargeDisplay = info.isFreeDelivery
            ? '<span style="color:#4caf50;font-weight:700;">FREE</span>'
            : `₹${info.charge}`;

        return `
            <div style="background:#f0f8ff;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #2196F3;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <strong>🚚 ${info.zoneName}</strong>
                    <span style="font-weight:700;">${chargeDisplay}</span>
                </div>
                <div style="font-size:12px;color:#666;margin-top:4px;">Estimated: ${info.estimatedDays}</div>
                ${freeMsg}
            </div>`;
    }

    async updateCheckoutDelivery(pincode, subtotal) {
        const info = await this.getDeliveryCharge(pincode, subtotal);

        const chargeEl = document.getElementById('delivery-charge');
        const infoBox = document.getElementById('delivery-info-box');
        const totalEl = document.getElementById('order-total');

        if (chargeEl) {
            chargeEl.textContent = info.isFreeDelivery ? 'FREE' : `₹${info.charge}`;
            chargeEl.style.color = info.isFreeDelivery ? '#4caf50' : '#333';
        }
        if (infoBox) infoBox.innerHTML = this.formatDeliveryInfo(info);
        if (totalEl) {
            const total = (subtotal || 0) + info.charge;
            totalEl.textContent = `₹${total.toFixed(2)}`;
        }

        window.currentDeliveryCharge = info.charge;
        return info;
    }
}

window.deliveryCalculator = new DeliveryChargeCalculator();
