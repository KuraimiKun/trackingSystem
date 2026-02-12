import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Edit,
  Copy,
  Check,
  MapPin,
  Calendar,
  Package,
  Weight,
  FileText,
  User,
  Phone,
  Plus,
  MessageSquare,
  Route,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getShipmentById, updateShipmentStatus, addTransitPoint, updateShipmentWaypoint } from '../../services/shipmentService';
import { STATUS_LABELS, STATUS_ORDER, STATUS_COLORS } from '../../constants/shipmentStatus';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const ShipmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [transitModal, setTransitModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [transitPoint, setTransitPoint] = useState({ location: '', note: '' });
  const [updating, setUpdating] = useState(false);
  const [updatingWaypoint, setUpdatingWaypoint] = useState(false);

  // Check if this is a new shipment
  const isNewShipment = location.state?.newShipment;
  const newTrackingNumber = location.state?.trackingNumber;

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    const result = await getShipmentById(id);
    if (result.success) {
      setShipment(result.shipment);
      setNewStatus(result.shipment.status);
    } else {
      navigate('/admin/shipments');
    }
    setLoading(false);
  };

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(shipment.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === shipment.status) return;
    
    setUpdating(true);
    const result = await updateShipmentStatus(id, newStatus, statusNote, user?.uid);
    
    if (result.success) {
      await fetchShipment();
      setStatusModal(false);
      setStatusNote('');
    }
    setUpdating(false);
  };

  const handleAddTransitPoint = async () => {
    if (!transitPoint.location) return;
    
    setUpdating(true);
    const result = await addTransitPoint(id, transitPoint, user?.uid);
    
    if (result.success) {
      await fetchShipment();
      setTransitModal(false);
      setTransitPoint({ location: '', note: '' });
    }
    setUpdating(false);
  };

  const handleUpdateWaypoint = async (direction) => {
    if (!shipment.routeWaypoints || shipment.routeWaypoints.length === 0) return;
    
    const currentIndex = shipment.currentWaypointIndex || 0;
    let newIndex;
    
    if (direction === 'next' && currentIndex < shipment.routeWaypoints.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      return;
    }
    
    setUpdatingWaypoint(true);
    const result = await updateShipmentWaypoint(id, newIndex, user?.uid);
    
    if (result.success) {
      await fetchShipment();
    }
    setUpdatingWaypoint(false);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return format(d, 'dd MMMM yyyy', { locale: ar });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">الشحنة غير موجودة</p>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(shipment.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Message for New Shipment */}
      {isNewShipment && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 fade-in">
          <Check className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-medium text-green-800">تم إنشاء الشحنة بنجاح!</p>
            <p className="text-green-600 text-sm">
              رقم التتبع: <span className="font-mono" dir="ltr">{newTrackingNumber}</span>
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/shipments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">تفاصيل الشحنة</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-gray-600" dir="ltr">
                {shipment.trackingNumber}
              </span>
              <button
                onClick={copyTrackingNumber}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="نسخ رقم التتبع"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        <Link
          to={`/admin/shipments/${id}/edit`}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span>تعديل</span>
        </Link>
      </div>

      {/* Status & Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">الحالة الحالية</p>
            <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-full border ${STATUS_COLORS[shipment.status]}`}>
              {STATUS_LABELS[shipment.status]}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStatusModal(true)}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>تحديث الحالة</span>
            </button>
            <button
              onClick={() => setTransitModal(true)}
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>نقطة عبور</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            {STATUS_ORDER.map((status, index) => (
              <div 
                key={status}
                className={`text-xs text-center flex-1 ${
                  index <= currentStatusIndex ? 'text-primary-600 font-medium' : 'text-gray-400'
                }`}
              >
                {STATUS_LABELS[status]}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-l from-primary-500 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentStatusIndex + 1) / STATUS_ORDER.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Shipment Details */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">معلومات الشحنة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Route */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ميناء المغادرة</p>
              <p className="font-medium text-gray-800">{shipment.originPort || '-'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ميناء الوصول</p>
              <p className="font-medium text-gray-800">{shipment.destinationPort || '-'}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">تاريخ المغادرة</p>
              <p className="font-medium text-gray-800">{formatDate(shipment.departureDate)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">تاريخ الوصول المتوقع</p>
              <p className="font-medium text-gray-800">{formatDate(shipment.expectedArrival)}</p>
            </div>
          </div>

          {/* Cargo Info */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">عدد القطع</p>
              <p className="font-medium text-gray-800">{shipment.pieces || '-'} قطعة</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Weight className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">الوزن</p>
              <p className="font-medium text-gray-800">{shipment.weight || '-'} كجم</p>
            </div>
          </div>

          {/* Reference */}
          {shipment.referenceNumber && (
            <div className="flex items-start gap-3 md:col-span-2">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">رقم المرجع</p>
                <p className="font-medium text-gray-800 font-mono" dir="ltr">{shipment.referenceNumber}</p>
              </div>
            </div>
          )}

          {/* Customer Info */}
          {shipment.customerName && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">اسم العميل</p>
                <p className="font-medium text-gray-800">{shipment.customerName}</p>
              </div>
            </div>
          )}

          {shipment.customerPhone && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">رقم الهاتف</p>
                <p className="font-medium text-gray-800 font-mono" dir="ltr">{shipment.customerPhone}</p>
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
      </div>

      {/* Route Waypoints */}
      {shipment.routeWaypoints && shipment.routeWaypoints.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-800">مسار الشحنة</h2>
            </div>
            {shipment.routeName && (
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                {shipment.routeName}
              </span>
            )}
          </div>
          
          {/* Waypoints Progress */}
          <div className="relative mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-l from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                style={{ 
                  width: `${((shipment.currentWaypointIndex || 0) + 1) / shipment.routeWaypoints.length * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Waypoints List */}
          <div className="space-y-3">
            {shipment.routeWaypoints.map((waypoint, index) => {
              const isCompleted = index <= (shipment.currentWaypointIndex || 0);
              const isCurrent = index === (shipment.currentWaypointIndex || 0);
              const isFirst = index === 0;
              const isLast = index === shipment.routeWaypoints.length - 1;
              
              return (
                <div 
                  key={index} 
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                    ${isCurrent 
                      ? 'border-primary-500 bg-primary-50' 
                      : isCompleted 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${isFirst 
                      ? isCompleted ? 'bg-green-500 text-white' : 'bg-green-100 text-green-500'
                      : isLast 
                        ? isCompleted ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500'
                        : isCompleted ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                      {waypoint.name}
                    </p>
                    {waypoint.description && (
                      <p className="text-sm text-gray-500">{waypoint.description}</p>
                    )}
                  </div>
                  {isCurrent && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                      الموقع الحالي
                    </span>
                  )}
                  {isCompleted && !isCurrent && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Waypoint Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t">
            <button
              onClick={() => handleUpdateWaypoint('prev')}
              disabled={updatingWaypoint || (shipment.currentWaypointIndex || 0) === 0}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
              <span>النقطة السابقة</span>
            </button>
            <span className="text-sm text-gray-500">
              {(shipment.currentWaypointIndex || 0) + 1} / {shipment.routeWaypoints.length}
            </span>
            <button
              onClick={() => handleUpdateWaypoint('next')}
              disabled={updatingWaypoint || (shipment.currentWaypointIndex || 0) === shipment.routeWaypoints.length - 1}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>النقطة التالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Transit Points */}
      {shipment.transitPoints && shipment.transitPoints.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">نقاط العبور</h2>
          <div className="space-y-3">
            {shipment.transitPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{point.location}</p>
                  {point.note && <p className="text-sm text-gray-500">{point.note}</p>}
                </div>
                <p className="text-xs text-gray-400" dir="ltr">
                  {format(new Date(point.timestamp), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status History */}
      {shipment.statusHistory && shipment.statusHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">سجل التحديثات</h2>
          <div className="space-y-4">
            {[...shipment.statusHistory].reverse().map((history, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary-600' : 'bg-gray-300'}`} />
                  {index < shipment.statusHistory.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`
                      px-2 py-0.5 text-xs font-medium rounded-full
                      ${index === 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {STATUS_LABELS[history.status]}
                    </span>
                    <span className="text-xs text-gray-400" dir="ltr">
                      {format(new Date(history.timestamp), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  {history.note && (
                    <p className="text-sm text-gray-600">{history.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">تحديث حالة الشحنة</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة الجديدة
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {STATUS_ORDER.map(status => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظة (اختياري)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="أضف ملاحظة للعميل..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setStatusModal(false);
                  setStatusNote('');
                  setNewStatus(shipment.status);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === shipment.status}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="spinner w-4 h-4"></div>
                    <span>جاري التحديث...</span>
                  </>
                ) : (
                  'تحديث'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transit Point Modal */}
      {transitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">إضافة نقطة عبور</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموقع <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={transitPoint.location}
                  onChange={(e) => setTransitPoint(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="مثال: ميناء سنغافورة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظة (اختياري)
                </label>
                <textarea
                  value={transitPoint.note}
                  onChange={(e) => setTransitPoint(prev => ({ ...prev, note: e.target.value }))}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="ملاحظة إضافية..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setTransitModal(false);
                  setTransitPoint({ location: '', note: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddTransitPoint}
                disabled={updating || !transitPoint.location}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="spinner w-4 h-4"></div>
                    <span>جاري الإضافة...</span>
                  </>
                ) : (
                  'إضافة'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentDetailPage;
