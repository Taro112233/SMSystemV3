// app/layout.tsx - Simplified Essential Version
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/app/utils/auth";

export const metadata: Metadata = {
  title: "InvenStock - Multi-Tenant Inventory System",
  description: "ระบบจัดการสต็อกสินค้าแบบ Multi-Tenant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}