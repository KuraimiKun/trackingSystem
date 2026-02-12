import { useState, useEffect } from 'react';
import { 
  Route as RouteIcon, 
  Plus, 
  Edit,
  Trash2,
  MapPin,
  Clock,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  X
} from 'lucide-react';
import { 
  getAllRoutes, 
  createRoute, 
  updateRoute, 
  deleteRoute, 
  toggleRouteStatus 
} from '../../services/routeService';
import { useAuth } from '../../context/AuthContext';

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routeModal, setRouteModal] = useState({ open: false, route: null, mode: 'create' });
  const [deleteModal, setDeleteModal] = useState({ open: false, route: null });
  const [expandedRoute, setExpandedRoute] = useState(null);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const result = await getAllRoutes();
    if (result.success) {
      setRoutes(result.routes);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (route) => {
    const result = await toggleRouteStatus(route.id, !route.active);
    if (result.success) {
      setRoutes(prev => prev.map(r => 
        r.id === route.id ? { ...r, active: !r.active } : r
      ));
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.route) return;
    
    const result = await deleteRoute(deleteModal.route.id);
    if (result.success) {
      setRoutes(prev => prev.filter(r => r.id !== deleteModal.route.id));
    }
    setDeleteModal({ open: false, route: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المسارات</h1>
          <p className="text-gray-500 mt-1">تحديد مسارات الشحن مع نقاط العبور</p>
        </div>
        <button
          onClick={() => setRouteModal({ open: true, route: null, mode: 'create' })}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>مسار جديد</span>
        </button>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        {routes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <RouteIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد مسارات بعد</p>
            <button
              onClick={() => setRouteModal({ open: true, route: null, mode: 'create' })}
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mt-4"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة مسار جديد</span>
            </button>
          </div>
        ) : (
          routes.map((route) => (
            <div 
              key={route.id} 
              className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                !route.active ? 'opacity-60' : ''
              }`}
            >
              {/* Route Header */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${route.active ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}
                  `}>
                    <RouteIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{route.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {route.waypoints?.length || 0} نقطة
                      </span>
                      {route.estimatedDays > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {route.estimatedDays} يوم
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(route);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      route.active 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={route.active ? 'تعطيل' : 'تفعيل'}
                  >
                    {route.active ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRouteModal({ open: true, route, mode: 'edit' });
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  {/* Delete */}
                  {isAdmin() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal({ open: true, route });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}

                  {/* Expand/Collapse */}
                  {expandedRoute === route.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content - Waypoints */}
              {expandedRoute === route.id && route.waypoints && route.waypoints.length > 0 && (
                <div className="px-4 pb-4 border-t bg-gray-50">
                  <div className="pt-4">
                    <p className="text-sm font-medium text-gray-600 mb-3">نقاط المسار:</p>
                    <div className="relative">
                      {/* Connection Line */}
                      <div className="absolute right-6 top-4 bottom-4 w-0.5 bg-primary-200"></div>
                      
                      <div className="space-y-3">
                        {route.waypoints.map((waypoint, index) => (
                          <div key={index} className="flex items-center gap-3 relative">
                            <div className={`
                              w-12 h-12 rounded-full flex items-center justify-center z-10
                              ${index === 0 
                                ? 'bg-green-500 text-white' 
                                : index === route.waypoints.length - 1 
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-primary-500 text-white'
                              }
                            `}>
                              {index + 1}
                            </div>
                            <div className="flex-1 bg-white rounded-lg p-3 shadow-sm">
                              <p className="font-medium text-gray-800">{waypoint.name}</p>
                              {waypoint.description && (
                                <p className="text-sm text-gray-500">{waypoint.description}</p>
                              )}
                              {waypoint.estimatedDays > 0 && (
                                <p className="text-xs text-gray-400 mt-1">
                                  الوقت المتوقع من النقطة السابقة: {waypoint.estimatedDays} يوم
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Route Modal */}
      {routeModal.open && (
        <RouteModal
          route={routeModal.route}
          mode={routeModal.mode}
          onClose={() => setRouteModal({ open: false, route: null, mode: 'create' })}
          onSave={async (data) => {
            if (routeModal.mode === 'create') {
              const result = await createRoute(data, user?.uid);
              if (result.success) {
                await fetchRoutes();
                setRouteModal({ open: false, route: null, mode: 'create' });
              }
              return result;
            } else {
              const result = await updateRoute(routeModal.route.id, data);
              if (result.success) {
                await fetchRoutes();
                setRouteModal({ open: false, route: null, mode: 'create' });
              }
              return result;
            }
          }}
        />
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف مسار 
              <span className="font-medium mx-1">{deleteModal.route?.name}</span>
              ؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ open: false, route: null })}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Route Modal Component
const RouteModal = ({ route, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: route?.name || '',
    description: route?.description || '',
    estimatedDays: route?.estimatedDays || '',
    waypoints: route?.waypoints || [
      { name: '', description: '', estimatedDays: '' }
    ]
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addWaypoint = () => {
    setFormData(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, { name: '', description: '', estimatedDays: '' }]
    }));
  };

  const removeWaypoint = (index) => {
    if (formData.waypoints.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index)
    }));
  };

  const updateWaypoint = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      waypoints: prev.waypoints.map((wp, i) => 
        i === index ? { ...wp, [field]: value } : wp
      )
    }));
  };

  const moveWaypoint = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= formData.waypoints.length) return;
    
    const newWaypoints = [...formData.waypoints];
    [newWaypoints[index], newWaypoints[newIndex]] = [newWaypoints[newIndex], newWaypoints[index]];
    
    setFormData(prev => ({ ...prev, waypoints: newWaypoints }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name) {
      setError('الرجاء إدخال اسم المسار');
      return;
    }

    const validWaypoints = formData.waypoints.filter(wp => wp.name.trim());
    if (validWaypoints.length < 2) {
      setError('الرجاء إدخال نقطتين على الأقل');
      return;
    }

    setSaving(true);

    // Calculate total estimated days
    const totalDays = validWaypoints.reduce((sum, wp) => sum + (parseInt(wp.estimatedDays) || 0), 0);

    const result = await onSave({
      name: formData.name,
      description: formData.description,
      estimatedDays: totalDays,
      waypoints: validWaypoints.map(wp => ({
        ...wp,
        estimatedDays: parseInt(wp.estimatedDays) || 0
      }))
    });

    if (!result.success) {
      setError(result.error);
    }

    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {mode === 'create' ? 'إنشاء مسار جديد' : 'تعديل المسار'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Route Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المسار <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="مثال: شنغهاي - جدة"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="وصف مختصر للمسار..."
              />
            </div>

            {/* Waypoints */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  نقاط المسار <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addWaypoint}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  إضافة نقطة
                </button>
              </div>

              <div className="space-y-3">
                {formData.waypoints.map((waypoint, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium
                        ${index === 0 
                          ? 'bg-green-500' 
                          : index === formData.waypoints.length - 1 
                            ? 'bg-blue-500'
                            : 'bg-primary-500'
                        }
                      `}>
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-500">
                        {index === 0 ? 'نقطة البداية' : index === formData.waypoints.length - 1 ? 'نقطة النهاية' : 'نقطة عبور'}
                      </span>
                      <div className="flex-1"></div>
                      
                      {/* Move buttons */}
                      <button
                        type="button"
                        onClick={() => moveWaypoint(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveWaypoint(index, 1)}
                        disabled={index === formData.waypoints.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {/* Remove */}
                      {formData.waypoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWaypoint(index)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={waypoint.name}
                          onChange={(e) => updateWaypoint(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          placeholder="اسم الموقع (مثال: ميناء شنغهاي)"
                        />
                      </div>
                      <div>
                        <div className="relative">
                          <input
                            type="number"
                            value={waypoint.estimatedDays}
                            onChange={(e) => updateWaypoint(index, 'estimatedDays', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            placeholder="الأيام"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="spinner w-4 h-4"></div>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              mode === 'create' ? 'إنشاء المسار' : 'حفظ التغييرات'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutesPage;
