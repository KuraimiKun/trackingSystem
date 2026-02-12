# نظام إدارة وتتبع الشحنات
# Shipment Tracking System

نظام متكامل لتتبع وإدارة الشحنات مبني باستخدام React و Firebase.

## المميزات

### واجهة العملاء
- 🔍 بحث سريع برقم التتبع أو رقم المرجع
- 📊 شريط زمني مرئي يوضح حالة الشحنة
- 📱 تصميم متوافق مع الجوال
- 🚫 لا يحتاج تسجيل دخول

### لوحة التحكم (للموظفين)
- ➕ إنشاء شحنات جديدة
- 📝 تحديث حالة الشحنات يدوياً
- 📍 إضافة نقاط عبور
- 💬 إضافة ملاحظات مع كل تحديث
- 📋 أرشيف الشحنات مع البحث والفلترة

### إدارة المستخدمين (للمدير)
- 👥 إضافة وتعديل حسابات الموظفين
- 🔐 نظام صلاحيات (مدير / موظف)
- ✅ تفعيل وتعطيل الحسابات
- 🗑️ حذف الحسابات (للمدير فقط)

## متطلبات التشغيل

- Node.js 18+
- حساب Firebase

## التثبيت

1. **استنساخ المشروع:**
```bash
git clone <repository-url>
cd shipment-tracking-system
```

2. **تثبيت الحزم:**
```bash
npm install
```

3. **إعداد Firebase:**
   - أنشئ مشروع جديد في [Firebase Console](https://console.firebase.google.com/)
   - فعّل Authentication مع Email/Password
   - فعّل Firestore Database
   - انسخ إعدادات المشروع

4. **تحديث إعدادات Firebase:**
   - افتح ملف `src/config/firebase.js`
   - استبدل القيم بإعدادات مشروعك:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

5. **إعداد قواعد Firestore:**
   - انسخ محتوى ملف `firestore.rules` إلى قواعد Firestore في لوحة تحكم Firebase

6. **إنشاء حساب المدير الأول:**
   - استخدم السكربت التالي في console المتصفح أو أنشئ المستخدم يدوياً:

```javascript
// في Firebase Console -> Authentication -> Add User
// ثم في Firestore -> users collection، أضف document بـ ID = User UID
{
  "email": "admin@example.com",
  "name": "المدير",
  "role": "admin",
  "active": true,
  "createdAt": Timestamp.now()
}
```

7. **تشغيل المشروع:**
```bash
npm run dev
```

## هيكل المشروع

```
src/
├── components/          # مكونات قابلة لإعادة الاستخدام
│   ├── customer/       # مكونات واجهة العملاء
│   └── ProtectedRoute.jsx
├── config/             # إعدادات التطبيق
│   └── firebase.js
├── constants/          # الثوابت
│   └── shipmentStatus.js
├── context/            # React Context
│   └── AuthContext.jsx
├── layouts/            # تخطيطات الصفحات
│   └── AdminLayout.jsx
├── pages/              # صفحات التطبيق
│   ├── admin/         # صفحات لوحة التحكم
│   └── customer/      # صفحات العملاء
├── services/           # خدمات Firebase
│   ├── shipmentService.js
│   └── userService.js
├── App.jsx             # المكون الرئيسي
├── main.jsx           # نقطة الدخول
└── index.css          # الأنماط العامة
```

## حالات الشحنة

| الحالة | الوصف |
|--------|-------|
| received | تم الاستلام |
| in_transit | في البحر |
| arrived_port | وصلت الميناء |
| customs | التخليص الجمركي |
| cleared | تم التخليص |
| delivered | تم التسليم |

## الصلاحيات

| الإجراء | موظف | مدير |
|---------|------|------|
| عرض الشحنات | ✅ | ✅ |
| إنشاء شحنة | ✅ | ✅ |
| تحديث الشحنة | ✅ | ✅ |
| حذف الشحنة | ❌ | ✅ |
| إدارة الموظفين | ❌ | ✅ |

## الروابط

- **واجهة التتبع للعملاء:** `/`
- **تسجيل دخول الموظفين:** `/admin/login`
- **لوحة التحكم:** `/admin/dashboard`
- **إدارة الشحنات:** `/admin/shipments`
- **إدارة الموظفين:** `/admin/users` (للمدير فقط)

## التقنيات المستخدمة

- **Frontend:** React 18, React Router 6
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Auth + Firestore)
- **Build Tool:** Vite
- **Icons:** Lucide React
- **Date Handling:** date-fns

## النشر

```bash
# بناء المشروع للإنتاج
npm run build

# معاينة البناء
npm run preview
```

يمكن نشر المشروع على:
- Firebase Hosting
- Vercel
- Netlify
- أي استضافة ثابتة أخرى

## الترخيص

جميع الحقوق محفوظة © 2026
