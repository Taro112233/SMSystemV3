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
    │   ├── not-found.tsx
    │   ├── page.tsx
    │   ├── [orgSlug]/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── [deptSlug]/
    │   │   │   └── page.tsx
    │   │   └── settings/
    │   │       └── page.tsx
    │   ├── api/
    │   │   ├── [orgSlug]/
    │   │   │   ├── route.ts
    │   │   │   ├── audit-logs/
    │   │   │   │   └── route.ts
    │   │   │   ├── departments/
    │   │   │   │   ├── route.ts
    │   │   │   │   └── [deptId]/
    │   │   │   │       └── route.ts
    │   │   │   ├── members/
    │   │   │   │   ├── route.ts
    │   │   │   │   └── [userId]/
    │   │   │   │       ├── route.ts
    │   │   │   │       └── role/
    │   │   │   │           └── route.ts
    │   │   │   └── settings/
    │   │   │       └── route.ts
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
    │   │   │   └── route.ts
    │   │   ├── organizations/
    │   │   │   ├── route.ts
    │   │   │   └── join-by-code/
    │   │   │       └── route.ts
    │   │   ├── security/
    │   │   │   └── monitoring/
    │   │   │       └── route.ts
    │   │   └── user/
    │   │       ├── change-password/
    │   │       │   └── route.ts
    │   │       └── profile/
    │   │           └── route.ts
    │   ├── dashboard/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   └── settings/
    │   │       └── profile/
    │   │           └── page.tsx
    │   ├── login/
    │   │   └── page.tsx
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
    │   ├── ProfileSettings/
    │   │   ├── index.tsx
    │   │   ├── PasswordChange.tsx
    │   │   ├── ProfileForm.tsx
    │   │   └── ProfileInfo.tsx
    │   ├── SettingsManagement/
    │   │   ├── index.tsx
    │   │   ├── DepartmentSettings/
    │   │   │   ├── DepartmentCard.tsx
    │   │   │   ├── DepartmentFormFields.tsx
    │   │   │   ├── DepartmentFormModal.tsx
    │   │   │   ├── DepartmentList.tsx
    │   │   │   └── index.tsx
    │   │   ├── MembersSettings/
    │   │   │   ├── index.tsx
    │   │   │   ├── InviteCodeEditModal.tsx
    │   │   │   ├── InviteCodeSection.tsx
    │   │   │   ├── MemberCard.tsx
    │   │   │   ├── MembersList.tsx
    │   │   │   └── RoleManager.tsx
    │   │   ├── OrganizationSettings/
    │   │   │   ├── index.tsx
    │   │   │   ├── OrganizationForm.tsx
    │   │   │   └── OrganizationInfo.tsx
    │   │   └── shared/
    │   │       ├── ConfirmDialog.tsx
    │   │       ├── SettingsCard.tsx
    │   │       └── SettingsSection.tsx
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
    ├── hooks/
    │   ├── use-mobile.ts
    │   ├── use-org-access.ts
    │   └── use-sidebar-state.ts
    ├── lib/
    │   ├── audit-helpers.ts
    │   ├── audit-logger.ts
    │   ├── auth-server.ts
    │   ├── auth.ts
    │   ├── config.ts
    │   ├── department-helpers.ts
    │   ├── prisma.ts
    │   ├── product-helpers.ts
    │   ├── reserved-routes.ts
    │   ├── role-helpers.ts
    │   ├── security-logger.ts
    │   ├── slug-validator.ts
    │   ├── stock-helpers.ts
    │   ├── user-snapshot.ts
    │   └── utils.ts
    ├── prisma/
    │   ├── schema.prisma
    │   ├── seed.ts
    │   ├── schemas/
    │   │   ├── audit.prisma
    │   │   ├── base.prisma
    │   │   ├── organization.prisma
    │   │   ├── product.prisma
    │   │   ├── stock.prisma
    │   │   └── user.prisma
    │   └── seeds/
    │       ├── demo-data.seed.ts
    │       ├── organizations.seed.ts
    │       └── users.seed.ts
    ├── scripts/
    │   ├── merge-schemas.js
    │   └── merge-seeds.js
    └── types/
        ├── auth.d.ts
        └── cookie.d.ts