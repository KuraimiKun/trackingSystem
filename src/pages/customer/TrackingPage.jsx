import { useState } from 'react';
import { Search, Package, Ship, Anchor, FileCheck, Truck, CheckCircle } from 'lucide-react';
import { getShipmentByTracking, getShipmentByReference } from '../../services/shipmentService';
import { STATUS_LABELS, STATUS_ORDER, SHIPMENT_STATUSES } from '../../constants/shipmentStatus';
import ShipmentTimeline from '../../components/customer/ShipmentTimeline';
import ShipmentDetails from '../../components/customer/ShipmentDetails';

const TrackingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('الرجاء إدخال رقم التتبع أو رقم المرجع');
      return;
    }

    setLoading(true);
    setError('');
    setShipment(null);
    setSearched(true);

    // Try tracking number first
    let result = await getShipmentByTracking(searchQuery);
    
    // If not found, try reference number
    if (!result.success) {
      result = await getShipmentByReference(searchQuery);
    }

    setLoading(false);

    if (result.success) {
      setShipment(result.shipment);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <Ship className="w-10 h-10 text-primary-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              نظام تتبع الشحنات
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            تتبع شحنتك
          </h2>
          <p className="text-gray-600 text-center mb-6">
            أدخل رقم التتبع أو رقم المرجع لمعرفة حالة شحنتك
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="رقم التتبع أو رقم المرجع..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                dir="ltr"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>جاري البحث...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>بحث</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && searched && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-center fade-in">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Shipment Result */}
        {shipment && (
          <div className="space-y-6 fade-in">
            {/* Tracking Number Display */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="text-gray-600 mb-2">رقم التتبع</p>
              <p className="text-2xl font-bold text-primary-600 font-mono" dir="ltr">
                {shipment.trackingNumber}
              </p>
            </div>

            {/* Timeline */}
            <ShipmentTimeline 
              currentStatus={shipment.status} 
              statusHistory={shipment.statusHistory || []}
              routeWaypoints={shipment.routeWaypoints || []}
              currentWaypointIndex={shipment.currentWaypointIndex || 0}
            />

            {/* Shipment Details */}
            <ShipmentDetails shipment={shipment} />
          </div>
        )}

        {/* Empty State */}
        {!shipment && !error && !searched && (
          <div className="text-center py-12">
            <Package className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              أدخل رقم التتبع للبدء في تتبع شحنتك
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>© {new Date().getFullYear()} نظام تتبع الشحنات. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
};

export default TrackingPage;
