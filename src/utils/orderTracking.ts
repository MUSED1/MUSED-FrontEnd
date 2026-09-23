// utils/orderTracking.ts
import { Package, Clock, Truck, PackageCheck } from 'lucide-react';

export interface Purchase {
    orderId: string;
    itemName: string;
    brand: string;
    size: string;
    itemImage: string | null;
    price: number | null;
    currency: string | null;
    trackingNumber: string;
    carrier: string;
    trackingStatus: string;
    trackingLastEvent: string;
    trackingLastEventTime: string | null;
    shippedAt: string | null;
    purchasedAt: string | null;
    deliveryAddress: string;
}

// Maps the backend's raw 17TRACK-style trackingStatus onto a simple 4-stage
// timeline for the buyer: Order Placed -> Preparing -> Shipped -> Delivered.
// "In transit"-ish statuses are folded into 'shipped' since from the
// buyer's perspective the meaningful line is just "it's on the way".
export const DELIVERY_STAGES = ['Order Placed', 'Preparing', 'Shipped', 'Delivered'] as const;
export const STAGE_ICONS = [Package, Clock, Truck, PackageCheck];

export function getDeliveryStageIndex(purchase: Purchase): number {
    if (purchase.trackingStatus === 'delivered') return 3;
    if (purchase.trackingNumber || purchase.shippedAt) return 2; // shipped / in transit
    return 1; // paid, brand is preparing the package
}

export function hasDeliveryIssue(purchase: Purchase): boolean {
    return purchase.trackingStatus === 'exception' || purchase.trackingStatus === 'delivery_failure';
}

export function formatOrderDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}
