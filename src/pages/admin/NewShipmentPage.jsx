import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Package,
  MapPin,
  Calendar,
  FileText,
  Weight,
  Route,
  ChevronDown,
  Info
} from 'lucide-react';
import { createShipment } from '../../services/shipmentService';
import { getActiveRoutes } from '../../services/routeService';
import { useAuth } from '../../context/AuthContext';

const NewShipmentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    referenceNumber: '',
    routeId: '',
    originPort: '',
    destinationPort: '',
    departureDate: '',
    expectedArrival: '',
    pieces: '',
    weight: '',
    description: '',
    customerName: '',
    customerPhone: ''
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const result = await getActiveRoutes();
    if (result.success) {
      setRoutes(result.routes);
    }
  };

  const handleRouteChange = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    setSelectedRoute(route);
    
    if (route && route.waypoints && route.waypoints.length >= 2) {
      const firstWaypoint = route.waypoints[0];
      const lastWaypoint = route.waypoints[route.waypoints.length - 1];
      
      setFormData(prev => ({
        ...prev,
        routeId: routeId,
        originPort: firstWaypoint.name,
        destinationPort: lastWaypoint.name
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        routeId: routeId,
        originPort: '',
        destinationPort: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.originPort || !formData.destinationPort) {
      setError('الرجاء إدخال ميناء المغادرة وميناء الوصول');
      setLoading(false);
      return;
    }

    // Prepare shipment data with route info
    const shipmentData = {
      ...formData,
      routeId: selectedRoute?.id || null,
      routeName: selectedRoute?.name || null,
      routeWaypoints: selectedRoute?.waypoints || [],
      currentWaypointIndex: 0 // Start at the first waypoint
    };

    const result = await createShipment(shipmentData, user?.uid);

    if (result.success) {
      navigate(`/admin/shipments/${result.id}`, {
        state: { newShipment: true, trackingNumber: result.trackingNumber }
      });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إضافة شحنة جديدة</h1>
          <p className="text-gray-500 mt-1">أدخل بيانات الشحنة الجديدة</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Reference Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم المرجع (اختياري)
            </label>
            <div className="relative">
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="رقم مرجعي خاص بكم"
                dir="ltr"
              />
              <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Route Selection */}
          {routes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختيار مسار محدد مسبقاً
              </label>
              <div className="relative">
                <select
                  value={formData.routeId}
                  onChange={(e) => handleRouteChange(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
                >
                  <option value="">-- اختر مسار أو أدخل يدوياً --</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.name} ({route.waypoints?.length || 0} نقاط - {route.estimatedDays} يوم)
                    </option>
                  ))}
                </select>
                <Route className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              {/* Route Preview */}
              {selectedRoute && selectedRoute.waypoints && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">نقاط المسار:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedRoute.waypoints.map((wp, index) => (
                      <div key={index} className="flex items-center">
                        <span className={`
                          px-3 py-1 text-sm rounded-full
                          ${index === 0 
                            ? 'bg-green-100 text-green-700' 
                            : index === selectedRoute.waypoints.length - 1 
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }
                        `}>
                          {wp.name}
                        </span>
                        {index < selectedRoute.waypoints.length - 1 && (
                          <span className="mx-1 text-gray-400">←</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Route Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ميناء المغادرة <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="originPort"
                  value={formData.originPort}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${selectedRoute ? 'bg-gray-50' : ''}`}
                  placeholder="مثال: ميناء شنغهاي"
                  required
                  readOnly={!!selectedRoute}
                />
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ميناء الوصول <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="destinationPort"
                  value={formData.destinationPort}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${selectedRoute ? 'bg-gray-50' : ''}`}
                  placeholder="مثال: ميناء جدة"
                  required
                  readOnly={!!selectedRoute}
                />
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ المغادرة
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الوصول المتوقع
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="expectedArrival"
                  value={formData.expectedArrival}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Pieces & Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد القطع
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="pieces"
                  value={formData.pieces}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                  min="0"
                />
                <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوزن (كجم)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                <Weight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم العميل
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="اسم العميل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم هاتف العميل
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="05XXXXXXXX"
                dir="ltr"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف البضاعة
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="وصف مختصر للبضاعة..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>جاري الإنشاء...</span>
              </>
            ) : (
              'إنشاء الشحنة'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewShipmentPage;
