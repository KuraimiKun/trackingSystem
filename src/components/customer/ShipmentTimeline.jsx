import { Package, Ship, Anchor, FileCheck, CheckCircle, Truck, MapPin } from 'lucide-react';
import { STATUS_LABELS, STATUS_ORDER, SHIPMENT_STATUSES } from '../../constants/shipmentStatus';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const statusIcons = {
  [SHIPMENT_STATUSES.RECEIVED]: Package,
  [SHIPMENT_STATUSES.IN_TRANSIT]: Ship,
  [SHIPMENT_STATUSES.ARRIVED_PORT]: Anchor,
  [SHIPMENT_STATUSES.CUSTOMS]: FileCheck,
  [SHIPMENT_STATUSES.CLEARED]: CheckCircle,
  [SHIPMENT_STATUSES.DELIVERED]: Truck
};

const ShipmentTimeline = ({ currentStatus, statusHistory = [], routeWaypoints = [], currentWaypointIndex = 0 }) => {
  // Check if shipment has route waypoints
  const hasRouteWaypoints = routeWaypoints && routeWaypoints.length > 0;
  
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const progressPercent = ((currentIndex + 1) / STATUS_ORDER.length) * 100;
  const waypointProgressPercent = hasRouteWaypoints 
    ? ((currentWaypointIndex + 1) / routeWaypoints.length) * 100 
    : 0;

  // Get timestamp for a status from history
  const getStatusTimestamp = (status) => {
    const historyItem = statusHistory.find(h => h.status === status);
    if (historyItem?.timestamp) {
      try {
        return format(new Date(historyItem.timestamp), 'dd MMM yyyy - HH:mm', { locale: ar });
      } catch {
        return '';
      }
    }
    return '';
  };

  // Render Route Waypoints Timeline
  if (hasRouteWaypoints) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
          مسار الشحنة
        </h3>
        <p className="text-sm text-gray-500 mb-8 text-center">
          تتبع تقدم الشحنة عبر نقاط المسار
        </p>

        {/* Desktop Waypoints Timeline */}
        <div className="hidden md:block relative">
          {/* Background Line */}
          <div className="absolute top-8 left-4 right-4 h-1 bg-gray-200 rounded-full"></div>
          
          {/* Progress Line */}
          <div 
            className="absolute top-8 right-4 h-1 bg-gradient-to-l from-primary-500 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `calc(${waypointProgressPercent}% - 32px)` }}
          ></div>

          {/* Waypoint Points */}
          <div className="relative flex justify-between">
            {routeWaypoints.map((waypoint, index) => {
              const isCompleted = index <= currentWaypointIndex;
              const isCurrent = index === currentWaypointIndex;
              const isFirst = index === 0;
              const isLast = index === routeWaypoints.length - 1;

              return (
                <div 
                  key={index} 
                  className="flex flex-col items-center" 
                  style={{ width: `${100 / routeWaypoints.length}%` }}
                >
                  <div 
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted 
                        ? isFirst 
                          ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                          : isLast 
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                            : 'bg-primary-600 text-white shadow-lg shadow-primary-200' 
                        : 'bg-gray-100 text-gray-400'
                      }
                      ${isCurrent ? 'ring-4 ring-primary-200 scale-110' : ''}
                    `}
                  >
                    <MapPin className="w-7 h-7" />
                  </div>
                  <p className={`
                    mt-3 text-sm font-medium text-center
                    ${isCompleted ? 'text-gray-800' : 'text-gray-400'}
                  `}>
                    {waypoint.name}
                  </p>
                  {waypoint.description && (
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {waypoint.description}
                    </p>
                  )}
                  {isCurrent && (
                    <span className="mt-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                      الموقع الحالي
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Waypoints Timeline */}
        <div className="md:hidden space-y-4">
          {routeWaypoints.map((waypoint, index) => {
            const isCompleted = index <= currentWaypointIndex;
            const isCurrent = index === currentWaypointIndex;
            const isFirst = index === 0;
            const isLast = index === routeWaypoints.length - 1;

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="relative">
                  <div 
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted 
                        ? isFirst 
                          ? 'bg-green-500 text-white'
                          : isLast 
                            ? 'bg-blue-500 text-white'
                            : 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-400'
                      }
                      ${isCurrent ? 'ring-4 ring-primary-200' : ''}
                    `}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  {index < routeWaypoints.length - 1 && (
                    <div className={`
                      absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-4
                      ${isCompleted ? 'bg-primary-600' : 'bg-gray-200'}
                    `}></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`
                    font-medium
                    ${isCompleted ? 'text-gray-800' : 'text-gray-400'}
                  `}>
                    {waypoint.name}
                  </p>
                  {waypoint.description && (
                    <p className="text-xs text-gray-500">{waypoint.description}</p>
                  )}
                </div>
                {isCurrent && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                    الموقع الحالي
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Regular Status Info */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-4">حالة الشحنة:</p>
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = statusIcons[currentStatus] || Package;
              return (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-800">
                    {STATUS_LABELS[currentStatus]}
                  </span>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // Original Status-based Timeline (fallback when no route waypoints)
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-8 text-center">
        حالة الشحنة
      </h3>

      {/* Desktop Timeline */}
      <div className="hidden md:block relative">
        {/* Background Line */}
        <div className="absolute top-8 left-4 right-4 h-1 bg-gray-200 rounded-full"></div>
        
        {/* Progress Line */}
        <div 
          className="absolute top-8 right-4 h-1 bg-gradient-to-l from-primary-500 to-primary-600 rounded-full transition-all duration-500"
          style={{ width: `calc(${progressPercent}% - 32px)` }}
        ></div>

        {/* Status Points */}
        <div className="relative flex justify-between">
          {STATUS_ORDER.map((status, index) => {
            const Icon = statusIcons[status];
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const timestamp = getStatusTimestamp(status);

            return (
              <div key={status} className="flex flex-col items-center" style={{ width: '16.66%' }}>
                <div 
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCompleted 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' 
                      : 'bg-gray-100 text-gray-400'
                    }
                    ${isCurrent ? 'ring-4 ring-primary-200 scale-110' : ''}
                  `}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <p className={`
                  mt-3 text-sm font-medium text-center
                  ${isCompleted ? 'text-primary-600' : 'text-gray-400'}
                `}>
                  {STATUS_LABELS[status]}
                </p>
                {timestamp && isCompleted && (
                  <p className="text-xs text-gray-500 mt-1 text-center" dir="ltr">
                    {timestamp}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Timeline */}
      <div className="md:hidden space-y-4">
        {STATUS_ORDER.map((status, index) => {
          const Icon = statusIcons[status];
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const timestamp = getStatusTimestamp(status);

          return (
            <div key={status} className="flex items-center gap-4">
              <div className="relative">
                <div 
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCompleted 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-400'
                    }
                    ${isCurrent ? 'ring-4 ring-primary-200' : ''}
                  `}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {index < STATUS_ORDER.length - 1 && (
                  <div className={`
                    absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-4
                    ${isCompleted ? 'bg-primary-600' : 'bg-gray-200'}
                  `}></div>
                )}
              </div>
              <div className="flex-1">
                <p className={`
                  font-medium
                  ${isCompleted ? 'text-gray-800' : 'text-gray-400'}
                `}>
                  {STATUS_LABELS[status]}
                </p>
                {timestamp && isCompleted && (
                  <p className="text-xs text-gray-500" dir="ltr">{timestamp}</p>
                )}
              </div>
              {isCurrent && (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                  الحالة الحالية
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShipmentTimeline;
