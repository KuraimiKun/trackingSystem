import { MapPin, Calendar, Package, Weight, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const ShipmentDetails = ({ shipment }) => {
  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return format(d, 'dd MMMM yyyy', { locale: ar });
    } catch {
      return '-';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        تفاصيل الشحنة
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Origin */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">ميناء المغادرة</p>
            <p className="font-medium text-gray-800">{shipment.originPort || '-'}</p>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">ميناء الوصول</p>
            <p className="font-medium text-gray-800">{shipment.destinationPort || '-'}</p>
          </div>
        </div>

        {/* Departure Date */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">تاريخ المغادرة</p>
            <p className="font-medium text-gray-800">{formatDate(shipment.departureDate)}</p>
          </div>
        </div>

        {/* Expected Arrival */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">تاريخ الوصول المتوقع</p>
            <p className="font-medium text-gray-800">{formatDate(shipment.expectedArrival)}</p>
          </div>
        </div>

        {/* Pieces */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">عدد القطع</p>
            <p className="font-medium text-gray-800">{shipment.pieces || '-'} قطعة</p>
          </div>
        </div>

        {/* Weight */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Weight className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">الوزن</p>
            <p className="font-medium text-gray-800">{shipment.weight || '-'} كجم</p>
          </div>
        </div>

        {/* Reference Number */}
        {shipment.referenceNumber && (
          <div className="flex items-start gap-3 md:col-span-2">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">رقم المرجع</p>
              <p className="font-medium text-gray-800 font-mono" dir="ltr">
                {shipment.referenceNumber}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {shipment.description && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-500 mb-2">وصف البضاعة</p>
          <p className="text-gray-700">{shipment.description}</p>
        </div>
      )}

      {/* Transit Points */}
      {shipment.transitPoints && shipment.transitPoints.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-500 mb-4">نقاط العبور</p>
          <div className="space-y-3">
            {shipment.transitPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{point.location}</p>
                  {point.note && <p className="text-sm text-gray-500">{point.note}</p>}
                </div>
                {point.timestamp && (
                  <p className="text-xs text-gray-400" dir="ltr">
                    {format(new Date(point.timestamp), 'dd/MM/yyyy HH:mm')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Note */}
      {shipment.statusHistory && shipment.statusHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-500 mb-2">آخر تحديث</p>
          {(() => {
            const lastUpdate = shipment.statusHistory[shipment.statusHistory.length - 1];
            return (
              <div className="bg-blue-50 rounded-lg p-4">
                {lastUpdate.note && (
                  <p className="text-gray-700 mb-2">{lastUpdate.note}</p>
                )}
                <p className="text-xs text-gray-500" dir="ltr">
                  {format(new Date(lastUpdate.timestamp), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ShipmentDetails;
