Directory structure:
└── taro112233-smsystemv3/
    ├── README.md
    ├── components.json
    ├── eslint.config.mjs
    ├── middleware.ts
    ├── next.config.ts
    ├── package.json
    ├── pnpm-lock.yaml
    ├── pnpm-workspace.yaml
    ├── postcss.config.mjs
    ├── tsconfig.json
    ├── vercel.json
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── api/
    │   │   ├── arcjet/
    │   │   │   └── route.ts
    │   │   ├── auth/
    │   │   │   ├── login/
    │   │   │   │   └── route.ts
    │   │   │   ├── logout/
    │   │   │   │   └── route.ts
    │   │   │   ├── me/
    │   │   │   │   └── route.ts
    │   │   │   └── register/
    │   │   │       └── route.ts
    │   │   └── security/
    │   │       └── monitoring/
    │   │           └── route.ts
    │   ├── dashboard/
    │   │   └── page.tsx
    │   ├── login/
    │   │   └── page.tsx
    │   ├── register/
    │   │   └── page.tsx
    │   └── utils/
    │       ├── auth-client.ts
    │       └── auth.tsx
    ├── components/
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── ExcelExportButton.tsx
    │       ├── form.tsx
    │       ├── hover-card.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── menubar.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toast.tsx
    │       ├── toaster.tsx
    │       ├── toggle-group.tsx
    │       ├── toggle.tsx
    │       └── tooltip.tsx
    ├── data/
    │   └── hospital-drugs.csv
    ├── hooks/
    │   └── use-mobile.ts
    ├── lib/
    │   ├── auth-server.ts
    │   ├── auth.ts
    │   ├── config.ts
    │   ├── prisma.ts
    │   ├── security-logger.ts
    │   └── utils.ts
    ├── prisma/
    │   ├── schema.prisma
    │   ├── seed.ts
    │   ├── schemas/
    │   │   ├── audit.prisma
    │   │   ├── base.prisma
    │   │   ├── organization.prisma
    │   │   └── user.prisma
    │   └── seeds/
    │       ├── stock-transactions.seed.ts
    │       ├── transfers-with-transactions.seed.ts
    │       ├── transfers.seed.ts
    │       ├── unified-csv.seed.ts
    │       └── users.seed.ts
    ├── scripts/
    │   ├── merge-schemas.js
    │   └── merge-seeds.js
    └── types/
        ├── auth.d.ts
        └── cookie.d.ts


🏢 InvenStock - Multi-Tenant Inventory Management System V2.0

ระบบจัดการสต็อกสินค้าแบบ Multi-Tenant พร้อม Custom Role Management และการเบิกสินค้าระหว่างแผนกแบบ Department-Centric

✨ Key Features V2.0
🏢 Multi-Tenant Architecture

แยกข้อมูลตามองค์กรอย่างสมบูรณ์
ผู้ใช้สามารถเป็นสมาชิกหลายองค์กรได้
Switch องค์กรโดยเปิด tab ใหม่ (ไม่ต้อง logout)

🎭 Custom Role Management (แบบ Discord)

หัวหน้าองค์กรสร้าง Role เองได้
กำหนดสิทธิ์แบบ Granular (ละเอียด)
Role Hierarchy & Position System
One Role per User per Organization

🏬 Department-Centric Stock Management

โครงสร้างแผนกแบบ Hierarchical
จัดการสต็อกแยกตามแผนก (ไม่มีหน้า stocks แยก)
เบิกสินค้าระหว่างแผนกได้
Workflow: Request → Approve → Prepare → Deliver → Receive

💼 Product & Department Integration

หมวดหมู่สินค้าแบบ Custom per Organization
ติดตาม Batch/Lot และวันหมดอายุ
Stock Tracking แบบ Real-time ตามแผนก
การแจ้งเตือนสต็อกต่ำ/หมดอายุ แยกตามแผนก

🗂️ Application Structure V2.0
Frontend Architecture
app/
├── dashboard/                   # Organization Selector
├── org/[orgSlug]/              # Organization Context
│   ├── layout.tsx              # Org Layout + Sidebar
│   ├── page.tsx                # Org Dashboard
│   ├── products/               # Product Management
│   ├── departments/            # Department-Centric Management
│   │   └── [deptId]/
│   │       ├── stocks/         # Department Stock Management
│   │       └── transfers/      # Department Transfers
│   ├── transfers/              # Organization-wide Transfers
│   ├── reports/                # Analytics & Reports
│   └── settings/               # Organization Settings
Key Navigation Flow
1. Login → /dashboard (เลือกองค์กร)
2. คลิกองค์กร → เปิด tab ใหม่ /org/{slug}
3. จัดการสต็อก → /org/{slug}/departments/{deptId}/stocks
4. ดูสต็อกสินค้า → /org/{slug}/products/{id} (แสดงทุกแผนก)
5. เบิกสินค้า → /org/{slug}/transfers/new
🎯 Business Logic V2.0
Department-Centric Stock Management
javascript// สต็อกแยกตามแผนก
departmentStock = {
  departmentId: "dept-001",
  productId: "prod-001", 
  totalQuantity: 500,
  reservedQty: 50,
  availableQty: 450,
  minStockLevel: 100,
  maxStockLevel: 1000
}

// คำนวณสถานะสต็อก
stockStatus = {
  available: totalQuantity - reservedQty,
  status: available <= minStock ? 'LOW' : 'NORMAL',
  needReorder: available <= (minStock * 0.5)
}
Multi-Tab Organization Context
javascript// แต่ละ tab มี context แยก
organizationContext = {
  orgId: "org-001",
  currentDepartment: "dept-001", 
  userRole: "manager",
  permissions: ["stock.adjust", "transfers.approve"]
}
Transfer Workflow Between Departments
Department A → Department B:
1. Request (Department A สร้างใบเบิก)
2. Approve (ผู้มีสิทธิ์อนุมัติ)
3. Prepare (Department A เตรียมสินค้า)
4. Deliver (ส่งมอบ)
5. Receive (Department B รับและยืนยัน)
🔐 Permission System V2.0
Department-Level Permissions
javascript// Granular permissions per department
departmentPermissions = {
  "departments.{deptId}.stocks.read": true,
  "departments.{deptId}.stocks.adjust": true,
  "departments.{deptId}.transfers.approve": true,
  "departments.*": false, // ไม่ได้สิทธิ์ทุกแผนก
  "products.read": true,
  "products.create": false
}
Role Examples V2.0

เจ้าขององค์กร - สิทธิ์ทุกอย่าง (*)
ผู้จัดการแผนก - จัดการแผนกเฉพาะ (departments.{deptId}.*)
เภสัชกร - จัดการสต็อกและอนุมัติการเบิก
พยาบาล - เบิกสินค้าและดูสต็อก
ผู้ตรวจสอบ - ดูรายงานเท่านั้น

📊 User Experience V2.0
Organization Selection

หน้า /dashboard แสดงการ์ดองค์กรทั้งหมด
คลิกเพื่อเปิด tab ใหม่ไปยัง /org/{slug}
แสดงสถิติพื้นฐาน: สินค้า, สต็อกต่ำ, รออนุมัติ

Department Dashboard

/org/{slug}/departments/{deptId} - หน้าหลักของแผนก
แสดงสต็อกเฉพาะแผนก, การเบิกเข้า-ออก, กิจกรรมล่าสุด
Quick actions: ปรับสต็อก, นับสต็อก, สร้างใบเบิก

Product Overview

/org/{slug}/products/{id} - แสดงสต็อกสินค้าในทุกแผนก
Real-time stock levels per department
ประวัติการเคลื่อนไหวทั้งหมด

Transfer Management

/org/{slug}/transfers - ภาพรวมการเบิกจ่ายทั้งองค์กร
/org/{slug}/departments/{deptId}/transfers - การเบิกเฉพาะแผนก
สถานะ real-time และการแจ้งเตือน

🚀 Technical Implementation V2.0
Multi-Tab Context Management
javascript// แต่ละ tab เก็บ state แยก
const OrgProvider = ({ orgSlug, children }) => {
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  // context per tab
}
Department-Centric API Design
GET /api/[orgId]/departments/[deptId]/stocks
POST /api/[orgId]/departments/[deptId]/stocks/adjust
GET /api/[orgId]/departments/[deptId]/transfers/incoming
POST /api/[orgId]/transfers (organization-wide)
Real-time Stock Updates
javascript// WebSocket per department
useRealtimeStocks(departmentId, {
  onStockUpdate: (productId, newStock) => {
    updateDepartmentStock(productId, newStock);
  },
  onLowStockAlert: (products) => {
    showNotification(products);
  }
});
📈 Analytics & Reporting V2.0
Department Performance

สต็อกต่ำต่อแผนก
ความถี่ในการเบิกจ่าย
ประสิทธิภาพการจัดการสต็อก

Organization Overview

สรุปสต็อกรวมทุกแผนก
การเคลื่อนไหวสินค้าระหว่างแผนก
ต้นทุนและมูลค่าสต็อก

Predictive Analytics

คาดการณ์ความต้องการ per department
แนะนำการสั่งซื้อ
วิเคราะห์รูปแบบการใช้งาน


🎯 Development Priorities
Phase 1: Core Department Management

Organization selector + multi-tab navigation
Department dashboard with stock management
Basic transfer workflow
Real-time notifications

Phase 2: Advanced Features

Batch/Lot tracking per department
Advanced reporting and analytics
Role-based permissions per department
Mobile optimization

Phase 3: Enterprise Features

API integrations
Advanced forecasting
Audit trails and compliance
Multi-language support