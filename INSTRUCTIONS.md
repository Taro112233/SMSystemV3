# InvenStock Development Instructions

## 🎯 Project Overview

InvenStock เป็นระบบ Multi-Tenant Inventory Management ที่ออกแบบสำหรับโรงพยาบาลและสถานพยาบาล โดยเน้นการจัดการสต็อกแบบ Department-Centric

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend:** Next.js 15 + TypeScript + TailwindCSS + Shadcn/UI
- **Backend:** Next.js API Routes + Prisma ORM
- **Database:** PostgreSQL with Row-level Security
- **Authentication:** JWT + bcryptjs
- **Security:** Arcjet + Multi-tenant isolation
- **Hosting:** Vercel + Supabase

### Database Schema Organization
```
prisma/schemas/
├── base.prisma          # Core types & enums
├── user.prisma          # User & authentication
├── organization.prisma  # Multi-tenant setup
├── audit.prisma        # Audit trails & logging
└── (another)
```

## 🏢 Multi-Tenant Architecture Rules

### Organization Context
- **URL Pattern:** `/org/[orgSlug]/...`
- **Data Isolation:** Row-level security enforced
- **User Access:** Multiple organization membership allowed
- **Tab Management:** Each tab maintains separate org context

### Department-Centric Design
```typescript
// ✅ Correct: Department-specific endpoints
/api/[orgSlug]/departments/[deptId]/stocks
/api/[orgSlug]/departments/[deptId]/transfers

// ❌ Avoid: Global stock endpoints
/api/[orgSlug]/stocks (should not exist)
```

### Permission Implementation
```typescript
// Department-level permissions
interface DepartmentPermission {
  pattern: "departments.{deptId}.{resource}.{action}"
  example: "departments.dept-001.stocks.adjust"
}

// Organization-level permissions
interface OrgPermission {
  pattern: "organization.{resource}.{action}"
  example: "organization.departments.create"
}
```

## 🔄 Transfer Workflow Implementation

### State Machine Requirements
```typescript
enum TransferStatus {
  PENDING = "PENDING",           // Initial request
  APPROVED = "APPROVED",         // Management approval
  PREPARED = "PREPARED",         // Items ready for pickup
  IN_TRANSIT = "IN_TRANSIT",     // Items being delivered
  DELIVERED = "DELIVERED",       // Items received
  CANCELLED = "CANCELLED"        // Process cancelled
}
```

### Business Logic Rules
1. **Stock Reservation:** Reserved quantity updated on APPROVED status
2. **Department Validation:** Both source/target departments must exist
3. **Permission Checks:** User must have transfer permissions for source dept
4. **Rollback Logic:** Handle cancellation at any stage
5. **Audit Trail:** Log all status changes with timestamps

## 📊 Real-time Features

### WebSocket Implementation
```typescript
// Department-specific channels
const channel = `org:${orgId}:dept:${deptId}:stocks`

// Event types
interface StockUpdateEvent {
  type: 'STOCK_UPDATED'
  productId: string
  newQuantity: number
  reservedQuantity: number
}

interface TransferStatusEvent {
  type: 'TRANSFER_STATUS_CHANGED'
  transferId: string
  status: TransferStatus
  updatedBy: string
}
```

### Performance Requirements
- **Stock Updates:** < 500ms propagation
- **Low Stock Alerts:** Real-time per department
- **Transfer Notifications:** Immediate status updates

## 🔐 Authentication Architecture Overview

**JWT Strategy**: Lightweight user identity only → Real-time organization permission checking

```typescript
// JWT Payload (Minimal)
{ userId, username, firstName, lastName, email, phone }

// Organization Context (Dynamic)
Check via: getUserOrgRole(userId, orgSlug) → { role, organizationId }
```

---

## 🛡️ **UPDATED: Security & Middleware Architecture**

### **Middleware Security (MVP Level)**
```typescript
// middleware.ts - Simplified 3-step protection
1. ✅ Skip static files
2. ✅ Check public routes → pass immediately
3. ✅ Arcjet protection (auth endpoints only - /api/auth/*)
4. ✅ JWT authentication → redirect /login if no token
5. ✅ Route validation → redirect /not-found if invalid route
6. ✅ Pass user headers to pages/APIs
```

### **Security Flow**
```typescript
// Three-layer security approach
Layer 1: Middleware (Authentication + Route validation)
Layer 2: API (/api/auth/me - Organization access validation)  
Layer 3: Page (Direct API calls, no useAuth context dependency)
```

### **Key Security Features**
- **Bypass Prevention:** Cannot access org pages without proper authentication
- **Route Validation:** Invalid routes automatically redirect to /not-found
- **Selective Protection:** Arcjet only on critical auth endpoints (performance optimized)
- **Real-time Access Control:** Database checks for every organization access

---

### 📱 **UPDATED: Frontend Page Patterns**

#### Pattern 1: Public Page (No Auth Required)
```typescript
// pages/login.tsx, pages/register.tsx, pages/landing.tsx
export default function PublicPage() {
  return <PublicContent />
}
```

#### Pattern 2: Auth Required (No Organization)
```typescript
// pages/dashboard.tsx (organization selector)
export default function DashboardPage() {
  const { user, loading } = useAuth()
  
  if (loading) return <LoadingState />
  if (!user) return <RedirectToLogin />
  
  return <OrganizationSelector />
}
```

#### Pattern 3: **NEW - Organization Page (Direct API Pattern)**
```typescript
// app/org/[orgSlug]/page.tsx - RECOMMENDED PATTERN
export default function OrganizationPage() {
  const params = useParams()
  const orgSlug = params.orgSlug as string
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [organizationData, setOrganizationData] = useState(null)

  useEffect(() => {
    const loadPageData = async () => {
      // ✅ Direct API call (no useAuth context dependency)
      const response = await fetch(`/api/auth/me?orgSlug=${orgSlug}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to load user data')
      }

      const data = await response.json()
      
      // Check organization access
      if (!data.data.currentOrganization || data.data.currentOrganization.slug !== orgSlug) {
        setError('No access to this organization')
        return
      }

      setUser(data.data.user)
      setOrganizationData(data.data.currentOrganization)
    }
    
    loadPageData()
  }, [orgSlug])

  // Render dashboard with full sidebar layout
  return (
    <div className="h-screen bg-gray-50 flex">
      <DashboardSidebar />
      <MainContent />
    </div>
  )
}
```

#### Pattern 4: Department Context (All Org Members)
```typescript
// pages/org/[orgSlug]/departments/[deptId]/stocks.tsx
export default function DepartmentStocksPage() {
  // ✅ Use same Direct API pattern as Organization Page
  const response = await fetch(`/api/auth/me?orgSlug=${orgSlug}`)
  
  // Validate access and render department content
  return <DepartmentDashboard />
}
```

---

### 🔌 **UPDATED: API Route Patterns**

#### Pattern 1: Public API (No Auth)
```typescript
// app/api/health/route.ts
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
```

#### Pattern 2: User Auth Only
```typescript
// app/api/user/profile/route.ts
import { getServerUser } from '@/lib/auth-server'

export async function GET() {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  
  return NextResponse.json({ user })
}
```

#### Pattern 3: **UPDATED - /api/auth/me with Organization Context**
```typescript
// app/api/auth/me/route.ts - Enhanced with org context
export async function GET(request: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Get organization context from query params
  const { searchParams } = new URL(request.url)
  const orgSlug = searchParams.get('orgSlug')

  let currentOrganization = null
  let permissions = {}

  if (orgSlug) {
    // Real-time database check for organization access
    const access = await getUserOrgRole(user.userId, orgSlug)
    if (access) {
      currentOrganization = await getOrganizationBySlug(orgSlug)
      permissions = {
        currentRole: access.role,
        canManageOrganization: access.role === 'OWNER',
        // ... other permissions
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      user,
      currentOrganization,
      permissions,
      organizations: await getUserOrganizations(user.userId)
    }
  })
}
```

#### Pattern 4: Organization Member Required
```typescript
// app/api/[orgSlug]/products/route.ts
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server'

export async function GET(request: Request, { params }: { params: { orgSlug: string } }) {
  const user = getUserFromHeaders(request.headers)
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  
  const access = await getUserOrgRole(user.userId, params.orgSlug)
  if (!access) {
    return NextResponse.json({ error: 'No access to organization' }, { status: 403 })
  }
  
  // Business logic - all org members can read products
  const products = await prisma.product.findMany({
    where: { organizationId: access.organizationId }
  })
  
  return NextResponse.json({ products })
}
```

#### Pattern 5: Role-Based Permission Required
```typescript
// app/api/[orgSlug]/products/route.ts (POST - Create Product)
import { requireOrgPermission } from '@/lib/auth-server'

export async function POST(request: Request, { params }: { params: { orgSlug: string } }) {
  const user = getUserFromHeaders(request.headers)
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  
  // Check permission (ADMIN or OWNER required)
  try {
    const access = await requireOrgPermission(user.userId, params.orgSlug, 'products.create')
    
    const body = await request.json()
    const product = await prisma.product.create({
      data: {
        ...body,
        organizationId: access.organizationId,
        createdBy: user.userId
      }
    })
    
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 })
  }
}
```

---

## 🎨 **UPDATED: Frontend Component Standards**

### **Page Structure & Safety**
```typescript
// ✅ NEW - Safe component props handling
interface ComponentProps {
  stats?: {
    totalProducts?: number;
    lowStockItems?: number;
    // Always use optional props to prevent undefined errors
  };
}

export const Component = ({ stats = {} }: ComponentProps) => {
  // Provide default values
  const safeStats = {
    totalProducts: stats.totalProducts || 0,
    lowStockItems: stats.lowStockItems || 0,
  }
  
  return <div>{safeStats.totalProducts}</div>
}
```

### **🎨 Responsive Design**
```typescript
// Desktop-first, mobile-compatible
<div className="grid grid-cols-3 lg:grid-cols-2 md:grid-cols-1">

// Touch-friendly sizes
const BUTTON_HEIGHT = 'h-11'  // 44px minimum
```

### **🧩 Component Modularity**
```
components/
├── ui/           # Base components
├── layout/       # Layouts, headers, nav
├── forms/        # Form modules
├── data-display/ # Tables, cards
└── features/     # Business components
```

### **Size Rules**
- Max 200 lines per component
- Max 8 props - use composition
- Extract logic to custom hooks

### **Component Patterns**
```typescript
// ✅ Page = orchestrator only
export default function StocksPage() {
  return (
    <PageLayout>
      <StockHeader />
      <StockTable />
    </PageLayout>
  )
}

// ✅ Responsive rendering
const DataDisplay = ({ data }) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  return isMobile ? <CardView /> : <TableView />
}

// ✅ Complex forms as directories
forms/TransferForm/
├── index.tsx
├── BasicInfo.tsx
└── ItemSelection.tsx
```

### **📁 Module Component Creation**
เมื่อสร้าง module component ให้แยกไฟล์และใส่คอมเมนต์ระบุไฟล์ที่ด้านบนทุกไฟล์
```typescript
// components/forms/TransferForm/index.tsx
// TransferForm - Main form component

// components/forms/TransferForm/BasicInfo.tsx  
// TransferForm/BasicInfo - Basic information step

// components/data-display/StockTable/index.tsx
// StockTable - Main table component

// components/data-display/StockTable/StockRow.tsx
// StockTable/StockRow - Individual table row
```

### **🎯 Key Rules**
- Desktop-first, mobile-compatible
- Extract logic to hooks
- Split complex forms into modules
- Pages orchestrate, components execute
- แยกไฟล์ module + คอมเมนต์ชื่อไฟล์ ด้านบนทุกไฟล์
- **Always provide default values for props to prevent undefined errors**

---

## 📈 Performance & Monitoring

### Database Optimization
- **Indexes:** Composite indexes on (orgId, deptId, ...)
- **Query Patterns:** Always include org context in WHERE clauses
- **Connection Pooling:** Configured for multi-tenant usage

### Monitoring Requirements
- **API Response Times:** < 200ms for CRUD operations
- **Real-time Latency:** < 500ms for stock updates
- **Database Connections:** Monitor pool usage
- **Security Events:** Log authentication failures

---

## 📋 **UPDATED: Development Guidelines**

### **API Design Patterns**
```typescript
// ✅ Multi-tenant API structure
/api/[orgSlug]/departments/[deptId]/stocks
/api/[orgSlug]/departments/[deptId]/transfers
/api/[orgSlug]/products
/api/[orgSlug]/users

// ✅ Always include org context validation
export async function GET(
  request: Request,
  { params }: { params: { orgSlug: string; deptId: string } }
) {
  const user = getUserFromHeaders(request.headers)
  const access = await getUserOrgRole(user.userId, params.orgSlug)
  // Business logic here
}
```

### **Component Architecture**
```typescript
// ✅ Permission-aware components
interface BaseComponentProps {
  organizationId: string
  permissions: string[]
}

// ✅ Department context
interface DepartmentComponentProps extends BaseComponentProps {
  departmentId: string
}
```

### **Error Handling**
```typescript
// ✅ Structured error responses
interface APIError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// Common error patterns
const ErrorCodes = {
  ORG_ACCESS_DENIED: 'ORG_ACCESS_DENIED',
  DEPT_PERMISSION_REQUIRED: 'DEPT_PERMISSION_REQUIRED',
  STOCK_INSUFFICIENT: 'STOCK_INSUFFICIENT',
  TRANSFER_INVALID_STATE: 'TRANSFER_INVALID_STATE'
}
```

---

## 🚀 **Key Architecture Benefits**

### **🔒 Security Excellence**
- **Multi-layer Protection:** Middleware + API + UI layers
- **Bypass Prevention:** Cannot access organization pages without proper authentication
- **Real-time Access Control:** Database checks for every organization access
- **Selective Protection:** Arcjet only on critical endpoints (performance optimized)

### **⚡ Performance Optimized**
- **Lightweight JWT:** Only user identity, no organization context
- **Direct API Pattern:** No useAuth context dependency issues
- **Selective Security:** Protection only where needed
- **Safe Component Props:** Prevents undefined errors and crashes

### **🏢 Multi-tenant Ready**
- **Organization Isolation:** Complete data separation
- **Dynamic Permissions:** Real-time role checking
- **Multiple Membership:** Users can belong to multiple organizations
- **Organization Switching:** No re-login required

### **🛠️ Developer Experience**
- **Clear Error Handling:** Comprehensive error states and debug info
- **Consistent Patterns:** Reusable patterns for all organization pages
- **Safe Development:** Default values prevent runtime errors
- **Easy Debugging:** Debug info displayed in error states

---

## 🚀 Deployment Guide

### Environment Configuration
```bash
# Production environment variables
# .env
# InvenStock - Production Configuration

# Database Configuration (Neon)
DATABASE_URL="postgresql://neondb_owner:npg_INhGAa5CDRH8@ep-cold-fog-a1lm4e80-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:npg_INhGAa5CDRH8@ep-cold-fog-a1lm4e80-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT Configuration
JWT_SECRET="565c8b590ef28ebf5ab45dfe6d4f2d18f26cbe5045e378d425d90d91749dc319"

# Security (Arcjet)
ARCJET_KEY="ajkey_01k4fqfvdzeb1sw7sectgh005x"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```