import { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Shield,
  User
} from 'lucide-react';
import { getAllUsers, deleteUser, toggleUserStatus, createUser, updateUser } from '../../services/userService';
import { ROLE_LABELS, USER_ROLES } from '../../constants/shipmentStatus';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userModal, setUserModal] = useState({ open: false, user: null, mode: 'create' });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'staff'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const result = await getAllUsers();
    if (result.success) {
      setUsers(result.users);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  const handleOpenModal = (mode, user = null) => {
    if (mode === 'edit' && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        role: user.role || 'staff'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'staff'
      });
    }
    setError('');
    setUserModal({ open: true, user, mode });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!formData.name || !formData.email) {
      setError('الرجاء إدخال الاسم والبريد الإلكتروني');
      setSaving(false);
      return;
    }

    if (userModal.mode === 'create' && !formData.password) {
      setError('الرجاء إدخال كلمة المرور');
      setSaving(false);
      return;
    }

    if (userModal.mode === 'create') {
      const result = await createUser(formData);
      if (result.success) {
        await fetchUsers();
        setUserModal({ open: false, user: null, mode: 'create' });
      } else {
        setError(result.error);
      }
    } else {
      const updates = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role
      };
      const result = await updateUser(userModal.user.id, updates);
      if (result.success) {
        await fetchUsers();
        setUserModal({ open: false, user: null, mode: 'create' });
      } else {
        setError(result.error);
      }
    }

    setSaving(false);
  };

  const handleToggleStatus = async (user) => {
    const result = await toggleUserStatus(user.id, !user.active);
    if (result.success) {
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, active: !u.active } : u
      ));
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    
    const result = await deleteUser(deleteModal.user.id);
    if (result.success) {
      setUsers(prev => prev.filter(u => u.id !== deleteModal.user.id));
    }
    setDeleteModal({ open: false, user: null });
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return format(d, 'dd/MM/yyyy', { locale: ar });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الموظفين</h1>
          <p className="text-gray-500 mt-1">إدارة حسابات الموظفين والصلاحيات</p>
        </div>
        <button
          onClick={() => handleOpenModal('create')}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة موظف</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث بالاسم أو البريد الإلكتروني..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-sm p-12 text-center">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery ? 'لا توجد نتائج مطابقة' : 'لا يوجد موظفين بعد'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div 
              key={user.id} 
              className={`bg-white rounded-xl shadow-sm p-6 card-hover ${
                !user.active ? 'opacity-60' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${user.role === USER_ROLES.ADMIN 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'bg-blue-100 text-blue-600'
                    }
                  `}>
                    {user.role === USER_ROLES.ADMIN ? (
                      <Shield className="w-6 h-6" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{user.name || 'بدون اسم'}</h3>
                    <span className={`
                      inline-block px-2 py-0.5 text-xs font-medium rounded-full
                      ${user.role === USER_ROLES.ADMIN 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                      }
                    `}>
                      {ROLE_LABELS[user.role] || 'موظف'}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`
                  inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full
                  ${user.active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                  }
                `}>
                  {user.active ? (
                    <>
                      <UserCheck className="w-3 h-3" />
                      نشط
                    </>
                  ) : (
                    <>
                      <UserX className="w-3 h-3" />
                      معطل
                    </>
                  )}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span dir="ltr">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span dir="ltr">{user.phone}</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-400 mb-4">
                انضم في: {formatDate(user.createdAt)}
              </div>

              {/* Actions */}
              {user.id !== currentUser?.uid && (
                <div className="flex items-center gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleOpenModal('edit', user)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                      user.active 
                        ? 'text-orange-600 hover:bg-orange-50' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {user.active ? (
                      <>
                        <UserX className="w-4 h-4" />
                        تعطيل
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        تفعيل
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteModal({ open: true, user })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* User Modal */}
      {userModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {userModal.mode === 'create' ? 'إضافة موظف جديد' : 'تعديل بيانات الموظف'}
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="اسم الموظف"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="example@company.com"
                  dir="ltr"
                  required
                  disabled={userModal.mode === 'edit'}
                />
              </div>

              {userModal.mode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="••••••••"
                    dir="ltr"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="05XXXXXXXX"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الصلاحية
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="staff">موظف</option>
                  <option value="admin">مدير النظام</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setUserModal({ open: false, user: null, mode: 'create' })}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="spinner w-4 h-4"></div>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    userModal.mode === 'create' ? 'إضافة' : 'حفظ'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف حساب 
              <span className="font-medium mx-1">{deleteModal.user?.name}</span>
              ؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ open: false, user: null })}
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

export default UsersPage;
