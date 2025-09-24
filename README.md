Directory structure:
└── taro112233-smsystemv3/
    ├── README.md
    ├── components.json
    ├── eslint.config.mjs
    ├── INSTRUCTIONS.md
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
    │   │   ├── dashboard/
    │   │   │   └── organizations/
    │   │   │       └── route.ts
    │   │   ├── organizations/
    │   │   │   ├── route.ts
    │   │   │   └── join-by-code/
    │   │   │       └── route.ts
    │   │   └── security/
    │   │       └── monitoring/
    │   │           └── route.ts
    │   ├── dashboard/
    │   │   └── page.tsx
    │   ├── login/
    │   │   └── page.tsx
    │   ├── org/
    │   │   └── [orgSlug]/
    │   │       ├── page.tsx
    │   │       └── members/
    │   │           └── page.tsx
    │   ├── register/
    │   │   └── page.tsx
    │   └── utils/
    │       ├── auth-client.ts
    │       └── auth.tsx
    ├── components/
    │   ├── DepartmentDashboard/
    │   │   ├── DepartmentActions.tsx
    │   │   ├── DepartmentInfo.tsx
    │   │   ├── DepartmentStats.tsx
    │   │   └── index.tsx
    │   ├── MembersManagement/
    │   │   ├── EditMemberModal.tsx
    │   │   ├── index.tsx
    │   │   ├── InviteMemberModal.tsx
    │   │   ├── MembersHeader.tsx
    │   │   ├── MembersStats.tsx
    │   │   └── MembersTable.tsx
    │   ├── OrganizationDashboard/
    │   │   ├── DepartmentOverview.tsx
    │   │   ├── index.tsx
    │   │   ├── OrganizationPerformance.tsx
    │   │   ├── OrganizationStats.tsx
    │   │   ├── QuickActions.tsx
    │   │   └── RecentActivity.tsx
    │   ├── OrganizationLayout/
    │   │   ├── DepartmentList.tsx
    │   │   ├── index.tsx
    │   │   ├── OrganizationHeader.tsx
    │   │   ├── SidebarFooter.tsx
    │   │   ├── SidebarHeader.tsx
    │   │   └── SidebarNavigation.tsx
    │   ├── OrganizationList/
    │   │   ├── AddOrganizationCard.tsx
    │   │   ├── CreateOrganizationModal.tsx
    │   │   ├── DashboardHeader.tsx
    │   │   ├── JoinOrganizationModal.tsx
    │   │   ├── OrganizationCard.tsx
    │   │   └── OrganizationGrid.tsx
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
    │   ├── membersMockData.ts
    │   └── orgMockData.ts
    ├── hooks/
    │   └── use-mobile.ts
    ├── lib/
    │   ├── auth-server.ts
    │   ├── auth.ts
    │   ├── config.ts
    │   ├── invite-code.ts
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
/api/[orgId]/departments/[deptId]/stocks
/api/[orgId]/departments/[deptId]/transfers

// ❌ Avoid: Global stock endpoints
/api/[orgId]/stocks (should not exist)
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

### 📱 Frontend Page Patterns

#### Pattern 1: Public Page (No Auth Required)
```typescript
// pages/login.tsx, pages/register.tsx, pages/landing.tsx
export default function PublicPage() {
  return Public content
}
```

#### Pattern 2: Auth Required (No Organization)
```typescript
// pages/dashboard.tsx (organization selector)
export default function DashboardPage() {
  const { user, loading } = useAuth()
  
  if (loading) return 
  if (!user) return 
  
  return 
}
```

#### Pattern 3: Organization + Role Required
```typescript
// pages/org/[orgSlug]/products.tsx
export default function ProductsPage() {
  const { user, currentOrganization, userRole, switchOrganization } = useAuth()
  const { orgSlug } = useParams()
  
  // Initialize organization context
  useEffect(() => {
    if (user && orgSlug && (!currentOrganization || currentOrganization.slug !== orgSlug)) {
      switchOrganization(orgSlug)
    }
  }, [user, orgSlug, currentOrganization])
  
  // Loading states
  if (!user) return 
  if (!currentOrganization) return 
  
  // Permission check
  if (!userRole || !['ADMIN', 'OWNER'].includes(userRole)) {
    return 
  }
  
  return 
}
```

#### Pattern 4: Department Context (All Org Members)
```typescript
// pages/org/[orgSlug]/departments/[deptId]/stocks.tsx
export default function DepartmentStocksPage() {
  const { user, currentOrganization, userRole, switchOrganization } = useAuth()
  const { orgSlug, deptId } = useParams()
  
  useEffect(() => {
    if (user && orgSlug && (!currentOrganization || currentOrganization.slug !== orgSlug)) {
      switchOrganization(orgSlug)
    }
  }, [user, orgSlug, currentOrganization])
  
  if (!user) return 
  if (!currentOrganization) return 
  if (!userRole) return 
  
  // All org members can access departments
  return 
}
```

---

### 🔌 API Route Patterns

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

#### Pattern 3: Organization Member Required
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

#### Pattern 4: Role-Based Permission Required
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

#### Pattern 5: Helper Wrapper for Clean Code
```typescript
// app/api/[orgSlug]/admin-only/route.ts
import { withOrgContext } from '@/lib/auth-server'

export const POST = (request: Request, { params }: any) => 
  withOrgContext(request, async (userId, orgId, userRole) => {
    // Check if user is admin
    if (!['ADMIN', 'OWNER'].includes(userRole)) {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    }
    
    // Business logic here
    return NextResponse.json({ success: true })
  })
```

## 🎨 Frontend Component Standards

### Page Structure
🎨 Responsive Design
typescript// Desktop-first, mobile-compatible
<div className="grid grid-cols-3 lg:grid-cols-2 md:grid-cols-1">

// Touch-friendly sizes
const BUTTON_HEIGHT = 'h-11'  // 44px minimum
🧩 Component Modularity
File Structure
components/
├── ui/           # Base components
├── layout/       # Layouts, headers, nav
├── forms/        # Form modules
├── data-display/ # Tables, cards
└── features/     # Business components
Size Rules

Max 200 lines per component
Max 8 props - use composition
Extract logic to custom hooks

Component Patterns
```typescript
typescript// ✅ Page = orchestrator only
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

📁 Module Component Creation
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

🎯 Key Rules
Desktop-first, mobile-compatible
Extract logic to hooks
Split complex forms into modules
Pages orchestrate, components execute
แยกไฟล์ module + คอมเมนต์ชื่อไฟล์ ด้านบนทุกไฟล์

### Data Isolation
- **Row-level Security:** Enforced at database level
- **API Filtering:** All queries include org context
- **Frontend Guards:** Permission-based UI rendering

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


## 📋 Development Guidelines

### API Design Patterns
```typescript
// ✅ Multi-tenant API structure
/api/[orgId]/departments/[deptId]/stocks
/api/[orgId]/departments/[deptId]/transfers
/api/[orgId]/products
/api/[orgId]/users

// ✅ Always include org context validation
export async function GET(
  request: Request,
  { params }: { params: { orgId: string; deptId: string } }
) {
  const user = await authenticateUser(request)
  await validateOrgAccess(user.id, params.orgId)
  // Business logic here
}
```

### Component Architecture
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

### Error Handling
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