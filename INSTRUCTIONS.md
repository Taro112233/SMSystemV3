# InvenStock Development Instructions

## 🎯 Project Overview

InvenStock เป็นระบบ Multi-Tenant Inventory Management ที่ออกแบบสำหรับโรงพยาบาลและสถานพยาบาล โดยเน้นการจัดการสต็อกแบบ Department-Centric พร้อม Custom Role Management

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

## 🔐 Security Implementation

### Authentication Flow
1. **Login:** JWT token with org memberships
2. **Org Selection:** Validate user access to organization
3. **Department Access:** Check dept-specific permissions
4. **API Protection:** Middleware validates org context

### Permission Validation
```typescript
// API route protection pattern
export async function GET(request: Request, context: RouteContext) {
  const { orgId, deptId } = context.params
  const user = await authenticateUser(request)
  
  await validateOrgAccess(user.id, orgId)
  await validateDeptPermission(user.id, orgId, deptId, 'stocks.read')
  
  // Proceed with business logic
}
```

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