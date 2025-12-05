Directory structure:
└── taro112233-smsystemv3/
    ├── README.md
    ├── components.json
    ├── DESIGN-SYSTEM.md
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
    │   │   │   ├── page.tsx
    │   │   │   ├── stocks/
    │   │   │   │   └── page.tsx
    │   │   │   └── transfers/
    │   │   │       ├── page.tsx
    │   │   │       ├── [transferId]/
    │   │   │       │   └── page.tsx
    │   │   │       └── create/
    │   │   │           └── page.tsx
    │   │   ├── products/
    │   │   │   └── page.tsx
    │   │   ├── settings/
    │   │   │   ├── page.tsx
    │   │   │   ├── categories/
    │   │   │   │   └── page.tsx
    │   │   │   └── units/
    │   │   │       └── page.tsx
    │   │   └── transfers/
    │   │       └── page.tsx
    │   ├── api/
    │   │   ├── [orgSlug]/
    │   │   │   ├── route.ts
    │   │   │   ├── [deptSlug]/
    │   │   │   │   ├── stocks/
    │   │   │   │   │   ├── route.ts
    │   │   │   │   │   └── [stockId]/
    │   │   │   │   │       ├── route.ts
    │   │   │   │   │       └── batches/
    │   │   │   │   │           ├── route.ts
    │   │   │   │   │           └── [batchId]/
    │   │   │   │   │               └── route.ts
    │   │   │   │   └── transfers/
    │   │   │   │       ├── incoming/
    │   │   │   │       │   └── route.ts
    │   │   │   │       ├── outgoing/
    │   │   │   │       │   └── route.ts
    │   │   │   │       └── products/
    │   │   │   │           └── route.ts
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
    │   │   │   ├── product-categories/
    │   │   │   │   ├── route.ts
    │   │   │   │   └── [categoryId]/
    │   │   │   │       └── route.ts
    │   │   │   ├── product-units/
    │   │   │   │   ├── route.ts
    │   │   │   │   └── [unitId]/
    │   │   │   │       └── route.ts
    │   │   │   ├── products/
    │   │   │   │   ├── route.ts
    │   │   │   │   ├── [id]/
    │   │   │   │   │   ├── route.ts
    │   │   │   │   │   └── stocks/
    │   │   │   │   │       └── route.ts
    │   │   │   │   └── batch-update-status/
    │   │   │   │       └── route.ts
    │   │   │   ├── settings/
    │   │   │   │   └── route.ts
    │   │   │   └── transfers/
    │   │   │       ├── route.ts
    │   │   │       └── [transferId]/
    │   │   │           ├── route.ts
    │   │   │           ├── approve-item/
    │   │   │           │   └── route.ts
    │   │   │           ├── cancel-item/
    │   │   │           │   └── route.ts
    │   │   │           ├── deliver-item/
    │   │   │           │   └── route.ts
    │   │   │           └── prepare-item/
    │   │   │               └── route.ts
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
    │   ├── DepartmentStocksManagement/
    │   │   ├── AddStockDialog.tsx
    │   │   ├── index.tsx
    │   │   ├── StockDetailDialog.tsx
    │   │   ├── StocksFilters.tsx
    │   │   ├── StocksHeader.tsx
    │   │   ├── StocksTable.tsx
    │   │   ├── StocksTableHeader.tsx
    │   │   ├── StocksTableRow.tsx
    │   │   └── StockDetailDialog/
    │   │       ├── BatchFormModal.tsx
    │   │       ├── BatchManagementTab.tsx
    │   │       └── ProductInfoTab.tsx
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
    │   ├── ProductsManagement/
    │   │   ├── DeleteProductDialog.tsx
    │   │   ├── index.tsx
    │   │   ├── ProductDetailDialog.tsx
    │   │   ├── ProductForm.tsx
    │   │   ├── ProductsFilters.tsx
    │   │   ├── ProductsHeader.tsx
    │   │   ├── ProductsTable.tsx
    │   │   ├── ProductsTableHeader.tsx
    │   │   ├── ProductsTableRow.tsx
    │   │   └── ProductDetailDialog/
    │   │       ├── ProductInfoTab.tsx
    │   │       └── StockSummaryTab.tsx
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
    │   │   ├── ProductCategorySettings/
    │   │   │   ├── CategoryCard.tsx
    │   │   │   ├── CategoryFormFields.tsx
    │   │   │   ├── CategoryFormModal.tsx
    │   │   │   ├── CategoryList.tsx
    │   │   │   └── index.tsx
    │   │   ├── ProductUnitSettings/
    │   │   │   ├── index.tsx
    │   │   │   ├── UnitCard.tsx
    │   │   │   ├── UnitFormFields.tsx
    │   │   │   ├── UnitFormModal.tsx
    │   │   │   └── UnitList.tsx
    │   │   └── shared/
    │   │       ├── ConfirmDialog.tsx
    │   │       ├── SettingsCard.tsx
    │   │       └── SettingsSection.tsx
    │   ├── TransferManagement/
    │   │   ├── index.tsx
    │   │   ├── CreateTransfer/
    │   │   │   ├── CreateTransferForm.tsx
    │   │   │   ├── ProductSelectionTable.tsx
    │   │   │   ├── SelectedItemsSummary.tsx
    │   │   │   ├── Step1BasicInfo.tsx
    │   │   │   ├── Step2ProductSelection.tsx
    │   │   │   └── Step3ReviewSubmit.tsx
    │   │   ├── ItemActions/
    │   │   │   ├── ApproveItemDialog.tsx
    │   │   │   ├── BatchInfoDisplay.tsx
    │   │   │   ├── BatchSelectionTable.tsx
    │   │   │   ├── CancelItemDialog.tsx
    │   │   │   ├── DeliverItemDialog.tsx
    │   │   │   └── PrepareItemDialog.tsx
    │   │   ├── shared/
    │   │   │   ├── DepartmentBadge.tsx
    │   │   │   ├── DepartmentSelectionDialog.tsx
    │   │   │   ├── QuantityDisplay.tsx
    │   │   │   ├── TransferCodeDisplay.tsx
    │   │   │   ├── TransferPriorityBadge.tsx
    │   │   │   └── TransferStatusBadge.tsx
    │   │   ├── TransferDetail/
    │   │   │   ├── TransferDetailHeader.tsx
    │   │   │   ├── TransferDetailView.tsx
    │   │   │   ├── TransferHistoryTab.tsx
    │   │   │   ├── TransferHistoryTable.tsx
    │   │   │   ├── TransferItemCard.tsx
    │   │   │   ├── TransferItemsTab.tsx
    │   │   │   ├── TransferNotes.tsx
    │   │   │   └── TransferStatusTimeline.tsx
    │   │   ├── TransferList/
    │   │   │   ├── DepartmentTransfersView.tsx
    │   │   │   ├── TransferEmptyState.tsx
    │   │   │   ├── TransferFilters.tsx
    │   │   │   ├── TransferListTabs.tsx
    │   │   │   ├── TransferTable.tsx
    │   │   │   ├── TransferTableHeader.tsx
    │   │   │   └── TransferTableRow.tsx
    │   │   └── TransferOverview/
    │   │       ├── OrganizationTransfersView.tsx
    │   │       ├── OverviewFilters.tsx
    │   │       └── OverviewStats.tsx
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
    │   ├── category-helpers.ts
    │   ├── config.ts
    │   ├── department-helpers.ts
    │   ├── prisma.ts
    │   ├── product-helpers.ts
    │   ├── reserved-routes.ts
    │   ├── role-helpers.ts
    │   ├── security-logger.ts
    │   ├── slug-validator.ts
    │   ├── stock-helpers.ts
    │   ├── transfer-helpers.ts
    │   ├── unit-helpers.ts
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
    │   │   ├── transfer.prisma
    │   │   └── user.prisma
    │   └── seeds/
    │       ├── audit-logs.seed.ts
    │       ├── departments.seed.ts
    │       ├── organizations.seed.ts
    │       ├── product-categories.seed.ts
    │       ├── product-units.seed.ts
    │       ├── products.seed.ts
    │       ├── stocks.seed.ts
    │       └── users.seed.ts
    ├── scripts/
    │   ├── merge-schemas.js
    │   └── merge-seeds.js
    └── types/
        ├── auth.d.ts
        ├── cookie.d.ts
        ├── product-category.ts
        ├── product-unit.ts
        ├── product.ts
        ├── stock.ts
        └── transfer.ts