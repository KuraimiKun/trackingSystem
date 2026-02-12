// Shipment status constants
export const SHIPMENT_STATUSES = {
  RECEIVED: 'received',
  IN_TRANSIT: 'in_transit',
  ARRIVED_PORT: 'arrived_port',
  CUSTOMS: 'customs',
  CLEARED: 'cleared',
  DELIVERED: 'delivered'
};

// Status labels in Arabic
export const STATUS_LABELS = {
  [SHIPMENT_STATUSES.RECEIVED]: 'تم الاستلام',
  [SHIPMENT_STATUSES.IN_TRANSIT]: 'في البحر',
  [SHIPMENT_STATUSES.ARRIVED_PORT]: 'وصلت الميناء',
  [SHIPMENT_STATUSES.CUSTOMS]: 'التخليص الجمركي',
  [SHIPMENT_STATUSES.CLEARED]: 'تم التخليص',
  [SHIPMENT_STATUSES.DELIVERED]: 'تم التسليم'
};

// Status colors
export const STATUS_COLORS = {
  [SHIPMENT_STATUSES.RECEIVED]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [SHIPMENT_STATUSES.IN_TRANSIT]: 'bg-blue-100 text-blue-800 border-blue-300',
  [SHIPMENT_STATUSES.ARRIVED_PORT]: 'bg-purple-100 text-purple-800 border-purple-300',
  [SHIPMENT_STATUSES.CUSTOMS]: 'bg-orange-100 text-orange-800 border-orange-300',
  [SHIPMENT_STATUSES.CLEARED]: 'bg-teal-100 text-teal-800 border-teal-300',
  [SHIPMENT_STATUSES.DELIVERED]: 'bg-green-100 text-green-800 border-green-300'
};

// Status order for timeline
export const STATUS_ORDER = [
  SHIPMENT_STATUSES.RECEIVED,
  SHIPMENT_STATUSES.IN_TRANSIT,
  SHIPMENT_STATUSES.ARRIVED_PORT,
  SHIPMENT_STATUSES.CUSTOMS,
  SHIPMENT_STATUSES.CLEARED,
  SHIPMENT_STATUSES.DELIVERED
];

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff'
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'مدير النظام',
  [USER_ROLES.STAFF]: 'موظف'
};
