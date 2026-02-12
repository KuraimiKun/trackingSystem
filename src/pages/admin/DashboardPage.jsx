import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Ship, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { getAllShipments } from '../../services/shipmentService';
import { STATUS_LABELS, SHIPMENT_STATUSES } from '../../constants/shipmentStatus';

const DashboardPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    inTransit: 0,
    delivered: 0,
    pending: 0
  });

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    const result = await getAllShipments();
    if (result.success) {
      setShipments(result.shipments);
      calculateStats(result.shipments);
    }
    setLoading(false);
  };

  const calculateStats = (shipmentsList) => {
    const stats = {
      total: shipmentsList.length,
      inTransit: shipmentsList.filter(s => s.status === SHIPMENT_STATUSES.IN_TRANSIT).length,
      delivered: shipmentsList.filter(s => s.status === SHIPMENT_STATUSES.DELIVERED).length,
      pending: shipmentsList.filter(s => 
        s.status !== SHIPMENT_STATUSES.DELIVERED && 
        s.status !== SHIPMENT_STATUSES.IN_TRANSIT
      ).length
    };
    setStats(stats);
  };

  const recentShipments = shipments.slice(0, 5);

  const statCards = [
    { 
      label: 'إجمالي الشحنات', 
      value: stats.total, 
      icon: Package, 
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50'
    },
    { 
      label: 'في الطريق', 
      value: stats.inTransit, 
      icon: Ship, 
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50'
    },
    { 
      label: 'تم التسليم', 
      value: stats.delivered, 
      icon: CheckCircle, 
      color: 'bg-green-500',
      bgLight: 'bg-green-50'
    },
    { 
      label: 'قيد المعالجة', 
      value: stats.pending, 
      icon: Clock, 
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50'
    },
  ];

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
          <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
          <p className="text-gray-500 mt-1">نظرة عامة على الشحنات</p>
        </div>
        <Link
          to="/admin/shipments/new"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>شحنة جديدة</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgLight} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">آخر الشحنات</h2>
          <Link 
            to="/admin/shipments"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {recentShipments.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد شحنات بعد</p>
            <Link
              to="/admin/shipments/new"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mt-4"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة شحنة جديدة</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    رقم التتبع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    المسار
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الإجراء
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-gray-800" dir="ltr">
                        {shipment.trackingNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {shipment.originPort} → {shipment.destinationPort}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex px-3 py-1 text-xs font-medium rounded-full
                        ${shipment.status === SHIPMENT_STATUSES.DELIVERED 
                          ? 'bg-green-100 text-green-700' 
                          : shipment.status === SHIPMENT_STATUSES.IN_TRANSIT
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }
                      `}>
                        {STATUS_LABELS[shipment.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/shipments/${shipment.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        عرض التفاصيل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
