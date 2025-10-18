# InvenStock Design System
> UI Patterns & Component Standards for Multi-tenant Inventory Management

## 🎨 Core Design Tokens

### Color Palette
```typescript
// Primary Actions
Primary:     blue-600       // Buttons, links
Success:     green-500      // Confirmations, active states
Warning:     yellow-500     // Alerts, warnings  
Danger:      red-600        // Destructive actions
Muted:       gray-100       // Backgrounds
Border:      gray-200       // Dividers, borders
Text:        gray-900       // Primary text
TextMuted:   gray-500/600   // Secondary text
```

### Typography Scale
```typescript
PageTitle:      text-2xl font-semibold
SectionHeader:  text-lg font-semibold
CardTitle:      font-semibold text-gray-900      // No fixed size
CardSubtitle:   text-sm text-gray-500
Body:           text-sm
Caption:        text-xs text-gray-500/600
```

### Spacing System
```typescript
Section:     space-y-6      // Between major sections
List:        space-y-4      // Between section header and content
Card:        space-y-4      // Inside cards (legacy - still valid)
CardCompact: space-y-3      // Inside cards (preferred for new components)
FormField:   space-y-2      // Form field groups
Grid:        gap-4          // Grid spacing
RowStack:    space-y-2      // Vertical row stacking (alternative to grid)
Button:      px-4 py-2      // Button padding
Icon+Text:   mr-2           // Icon before text
IconBadge:   mr-1           // Icon before text in badges
```

---

## 🏗️ Component Architecture Patterns

### Pattern 1: Settings Page Structure
**Reference:** `components/SettingsManagement/`

```
SettingsModule/
├── index.tsx              # Container + state orchestrator
├── ModuleList.tsx         # Grid/Row renderer + search
├── ModuleCard.tsx         # Individual item display
├── ModuleFormModal.tsx    # Create/Edit dialog
└── ModuleFormFields.tsx   # Reusable form inputs
```

**Container Pattern (index.tsx):**
```typescript
export function ModuleSettings({ data, onCRUD }) {
  const canManage = ['ADMIN', 'OWNER'].includes(userRole);
  
  return (
    <div className="space-y-6">
      {!canManage && <PermissionAlert />}
      <ModuleList 
        items={data}
        canManage={canManage}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
}
```

---

### Pattern 2: List Component with Header
**Reference:** `DepartmentList.tsx`, `CategoryList.tsx`

```typescript
export function ModuleList({ items, canManage, onCRUD }) {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <SettingsCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Title</h3>
            <p className="text-sm text-gray-600">Description</p>
          </div>
          {canManage && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </SettingsCard>
      
      {/* ✅ FLEXIBLE: Choose Grid OR Row layout based on content */}
      
      {/* Option A: Grid Layout (for card-based content) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(item => <ModuleCard key={item.id} {...} />)}
      </div>
      
      {/* Option B: Row Layout (for list-based content with more details) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Section Title</h3>
        <div className="space-y-2">
          {items.map(item => <ModuleCard key={item.id} {...} />)}
        </div>
      </div>
      
      {/* Modals */}
      <ModuleFormModal {...} />
    </div>
  );
}
```

**Layout Decision Guide:**
- **Use Grid** (`grid gap-4 md:grid-cols-2 lg:grid-cols-3`):
  - When cards are compact and equal-height
  - Visual icon/color is important
  - Items are independent
  - Examples: Departments (icon-focused), simple categories
  
- **Use Row Stack** (`space-y-2` or `space-y-3`):
  - When content varies in length
  - Need to show multiple attributes inline
  - Space efficiency is important
  - Examples: Categories with many options, members with roles

---

### Pattern 3: Card Component - Grid Style
**Reference:** `DepartmentCard.tsx`

```typescript
export function ModuleCard({ item, canManage, onEdit, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);
  
  return (
    <Card className={`${!item.isActive ? 'opacity-60' : ''} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Icon + Title + Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                <p className="text-sm text-gray-500 font-mono">{item.slug}</p>
              </div>
            </div>
            
            {/* Status Badge */}
            {item.isActive ? (
              <Badge variant="default" className="bg-green-500 flex-shrink-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                ใช้งาน
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex-shrink-0">
                <XCircle className="w-3 h-3 mr-1" />
                ปิด
              </Badge>
            )}
          </div>
          
          {/* Description */}
          <div className="min-h-[40px]">
            {item.description ? (
              <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">ไม่มีคำอธิบาย</p>
            )}
          </div>
          
          {/* Actions (if canManage) */}
          {canManage && (
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                <Edit className="w-3 h-3 mr-1" />
                แก้ไข
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                ลบ
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      <ConfirmDialog {...} />
    </Card>
  );
}
```

---

### Pattern 3B: Card Component - Row Style
**Reference:** `CategoryCard.tsx`

```typescript
export function ModuleCard({ item, canManage, onEdit, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);
  
  // For row layout: horizontal arrangement with inline content
  return (
    <Card className={`${!item.isActive ? 'opacity-60' : ''} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Horizontal layout with icon (optional) + content */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Title + Metadata on same line or stacked */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{item.label}</h3>
                <span className="text-sm text-gray-500 font-mono">{item.key}</span>
              </div>
              
              {/* Description (optional, can be inline) */}
              {item.description && (
                <p className="text-sm text-gray-600">{item.description}</p>
              )}
            </div>
            
            {/* Status Badge + Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {item.isActive ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  ใช้งาน
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-3 h-3 mr-1" />
                  ปิด
                </Badge>
              )}
              
              {canManage && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setShowDelete(true)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Additional inline content (badges, tags, etc.) */}
          <div className="flex flex-wrap gap-2">
            {item.tags?.map(tag => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
      
      <ConfirmDialog {...} />
    </Card>
  );
}
```

---

### Pattern 4: Form Modal
**Reference:** `DepartmentFormModal.tsx`, `CategoryFormModal.tsx`

```typescript
export function ModuleFormModal({ open, onOpenChange, item, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultValues);
  
  useEffect(() => {
    if (open) {
      setFormData(item || defaultValues);
    }
  }, [open, item]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success(item ? 'อัพเดทสำเร็จ' : 'สร้างสำเร็จ');
      onOpenChange(false);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{item ? 'แก้ไข' : 'สร้างใหม่'}</DialogTitle>
          <DialogDescription>กรอกข้อมูลด้านล่าง</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <ModuleFormFields formData={formData} setFormData={setFormData} />
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {item ? 'อัพเดท' : 'สร้าง'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Pattern 5: Form Fields Component
**Reference:** `DepartmentFormFields.tsx`, `CategoryFormFields.tsx`

```typescript
export function ModuleFormFields({ formData, setFormData, isEditing }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  return (
    <>
      {/* Text Input */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter name"
        />
      </div>
      
      {/* Textarea */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter description"
          className="resize-none"
          rows={3}
        />
      </div>
      
      {/* Switch - PREFERRED for boolean fields */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="space-y-1">
          <div className="font-medium">Active Status</div>
          <div className="text-sm text-gray-600">Description here</div>
        </div>
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ ...prev, isActive: checked }))
          }
        />
      </div>
      
      {/* Editable List (for arrays like options/tags) */}
      <div className="space-y-2">
        <Label>Options</Label>
        <div className="space-y-2">
          {formData.options.map((option, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => updateOption(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOption(idx)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addOption}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        </div>
      </div>
    </>
  );
}
```

---

## 🎯 UI Component Standards

### Button Variants
```typescript
// Primary action (1 per section)
<Button>Primary Action</Button>

// Secondary actions  
<Button variant="outline">Secondary</Button>

// Destructive
<Button variant="destructive">Delete</Button>
<Button variant="outline" className="text-red-600 hover:bg-red-50">Delete</Button>

// Ghost (for inline actions)
<Button variant="ghost" size="sm">
  <Edit className="w-4 h-4" />
</Button>

// Icon only
<Button variant="ghost" size="sm">
  <MoreVertical className="w-4 h-4" />
</Button>
```

### Badge Usage
```typescript
// Status
<Badge variant="default" className="bg-green-500">Active</Badge>
<Badge variant="secondary">Inactive</Badge>

// With icon (w-3 h-3 with mr-1)
<Badge variant="outline" className="border-orange-500 text-orange-600">
  <AlertCircle className="w-3 h-3 mr-1" />
  Required
</Badge>

// Inline content badges (for tags/options)
<Badge variant="outline">Tag Name</Badge>
```

### Icon Standards
```typescript
// Regular icons: w-4 h-4 (16px)
// Badge icons: w-3 h-3 (12px)
// Card header icons: w-5 h-5 (20px) in colored circle
// Spacing: mr-2 for regular, mr-1 for badges

import { Plus, Edit, Trash2, Search, CheckCircle } from 'lucide-react';

<Button>
  <Plus className="w-4 h-4 mr-2" />
  Create
</Button>

<Badge>
  <CheckCircle className="w-3 h-3 mr-1" />
  Active
</Badge>
```

---

## 📐 Layout Patterns

### Responsive Grid
```typescript
// Settings cards (2-3 columns)
className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"

// Stats cards (2-4 columns)
className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"

// Full-width with sidebar
className="grid gap-6 lg:grid-cols-[300px_1fr]"
```

### Row Stack (Alternative to Grid)
```typescript
// Vertical stacking for list-style content
className="space-y-2"    // Tight spacing for rows
className="space-y-3"    // Medium spacing
className="space-y-4"    // Loose spacing with section headers

// Example usage
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Active Items</h3>
  <div className="space-y-2">
    {items.map(item => <ItemCard key={item.id} />)}
  </div>
</div>
```

### Section Spacing
```typescript
// Page sections
<div className="space-y-6">...</div>

// Between section header and content
<div className="space-y-4">...</div>

// Card content (legacy - still valid)
<div className="space-y-4">...</div>

// Card content (preferred for new components)
<div className="space-y-3">...</div>

// Form fields
<div className="space-y-2">...</div>
```

---

## 🔄 State Patterns

### Loading State
```typescript
{isLoading ? (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
  </div>
) : (
  <Content />
)}
```

### Empty State
```typescript
<Card className="flex flex-col items-center justify-center py-12">
  <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
  <p className="text-lg font-medium mb-2">No items found</p>
  <p className="text-sm text-muted-foreground mb-4">
    Get started by creating your first item
  </p>
  <Button onClick={onCreate}>
    <Plus className="w-4 h-4 mr-2" />
    Create New
  </Button>
</Card>
```

---

## 📱 Responsive Design

### Breakpoint Usage
```typescript
// Hide/show by screen size
className="hidden md:block"       // Desktop only
className="md:hidden"             // Mobile only

// Responsive text
className="text-sm md:text-base lg:text-lg"

// Responsive padding
className="p-4 md:p-6 lg:p-8"

// Responsive flex direction
className="flex flex-col md:flex-row"
```

---

## ✨ Toast Notifications
```typescript
import { toast } from 'sonner';

// Success
toast.success('Created successfully');

// Error with description
toast.error('Failed to create', {
  description: error.message
});

// Promise-based
toast.promise(apiCall(), {
  loading: 'Creating...',
  success: 'Created!',
  error: 'Failed'
});
```

---

## ✅ Component Checklist

Every component must have:
- [ ] TypeScript interfaces
- [ ] Loading state (Skeleton/Spinner)
- [ ] Empty state (No data message)
- [ ] Error handling (try-catch + toast)
- [ ] Responsive design (mobile-compatible)
- [ ] Consistent spacing (space-y-*)
- [ ] Standard icon size (h-4 w-4 or h-3 w-3)
- [ ] Accessibility (keyboard nav, aria-labels)

---

## 🎨 Quick Reference

```typescript
// ALWAYS use these patterns
✅ Card hover:        hover:shadow-md transition-shadow
✅ Icon size:         h-4 w-4 (h-3 w-3 in badges, h-5 w-5 in headers)
✅ Icon spacing:      mr-2 (mr-1 in badges)
✅ Grid gap:          gap-4
✅ Row stack:         space-y-2 (alternative to grid)
✅ Section spacing:   space-y-6 (pages), space-y-4 (lists)
✅ Card spacing:      space-y-3 (preferred), space-y-4 (legacy)
✅ Form spacing:      space-y-2
✅ Button padding:    px-4 py-2
✅ Border top:        border-t pt-2 (for actions)
✅ Flex shrink:       flex-shrink-0 (for badges/icons)
✅ Min width:         min-w-0 (for truncate to work)

// FLEXIBLE patterns (choose based on content)
⚖️ Layout:           Grid (card-based) OR Row Stack (list-based)
⚖️ Card header:      With icon (visual) OR Without icon (simple)
⚖️ Actions:          Inline buttons OR Bottom border section

// NEVER do these
❌ Hard-coded colors (use Tailwind classes)
❌ Inline styles
❌ Mixed icon sizes in same context
❌ Missing loading/error states
❌ Non-responsive layouts
❌ Fixed width without min-w-0 + truncate
```

---

## 📝 Pattern Selection Guide

### When to use Grid Layout:
- ✅ Content is card-based with visual icons
- ✅ Items are similar in height
- ✅ Visual separation is important
- ✅ Works well on mobile (stacks vertically)
- **Examples:** Departments, simple categories, user cards

### When to use Row Stack:
- ✅ Content varies in length/complexity
- ✅ Need to show multiple inline attributes
- ✅ Space efficiency is priority
- ✅ Better for dense information
- **Examples:** Categories with options, detailed lists, activity logs

### Card Header Styles:

**With Icon (Grid Style):**
```typescript
<div className="w-10 h-10 bg-blue-500 rounded-lg">
  <Icon className="w-5 h-5 text-white" />
</div>
```
- Use when: Visual identity is important
- Examples: Departments, categories with distinct icons

**Without Icon (Row Style):**
```typescript
<h3 className="font-semibold text-gray-900">{title}</h3>
```
- Use when: Content speaks for itself
- Examples: Text-heavy lists, simple records