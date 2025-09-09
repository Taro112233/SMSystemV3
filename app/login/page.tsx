// app/login/page.tsx - FIXED IMPORTS

"use client";

import React, { useState, useEffect } from "react";
// ✅ แก้ไข import ให้ถูกต้อง
import { useAuth } from "@/app/utils/auth"; // ← เปลี่ยนจาก auth-client เป็น auth
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Hospital,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

// ✅ ปรับ interface ให้ตรงกับ current schema
interface LoginFormData {
  username: string;  // ✅ Primary credential ตาม schema
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // ✅ ใช้ useAuth hook จาก auth.tsx
  const { login, loading, user } = useAuth();
  const router = useRouter();

  // ตรวจสอบสถานะ auth ทุก 2 วินาที หลัง login success
  useEffect(() => {
    let authCheckInterval: NodeJS.Timeout;

    if (loginSuccess && !user) {
      authCheckInterval = setInterval(async () => {
        try {
          const response = await fetch("/api/auth/me", {
            credentials: "include",
          });

          if (response.ok) {
            const userData = await response.json();
            if (userData.success && userData.data?.user) {
              toast.success("พร้อมใช้งาน!", {
                description: "การยืนยันตัวตนเสร็จสมบูรณ์",
                icon: <CheckCircle2 className="w-4 h-4" />,
              });
              router.push("/dashboard");
            }
          }
        } catch (error) {
          console.error("Auth check error:", error);
        }
      }, 2000);
    }

    return () => {
      if (authCheckInterval) {
        clearInterval(authCheckInterval);
      }
    };
  }, [loginSuccess, user, router]);

  const validateForm = (): boolean => {
    if (!formData.username?.trim()) {
      setError("กรุณากรอก Username");
      toast.error("ข้อมูลไม่ครบถ้วน", {
        description: "กรุณากรอก Username เพื่อเข้าสู่ระบบ",
        icon: <AlertTriangle className="w-4 h-4" />,
        duration: 4000,
      });
      return false;
    }

    if (!formData.password?.trim()) {
      setError("กรุณากรอกรหัสผ่าน");
      toast.error("ข้อมูลไม่ครบถ้วน", {
        description: "กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบ",
        icon: <AlertTriangle className="w-4 h-4" />,
        duration: 4000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setLoginSuccess(false);

    const loadingToast = toast.loading("กำลังเข้าสู่ระบบ...", {
      description: "กรุณารอสักครู่",
    });

    try {
      // ✅ ใช้ login function จาก useAuth hook
      await login({
        username: formData.username.trim(), // ✅ ใช้ username ตาม schema
        password: formData.password,
      });

      toast.dismiss(loadingToast);
      setLoginSuccess(true);

      toast.success("เข้าสู่ระบบสำเร็จ!", {
        description: `ยินดีต้อนรับเข้าสู่ระบบจัดการสต็อก`,
        duration: 3000,
      });

      // Navigate based on organizations
      router.push("/dashboard");
      
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Login error:", error);
      
      const errorMsg = error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ";
      setError(errorMsg);
      
      // ✅ แสดง error message ที่เฉพาะเจาะจง
      if (errorMsg.includes("Username") || errorMsg.includes("username")) {
        toast.error("Username ไม่ถูกต้อง", {
          description: "ไม่พบ Username นี้ในระบบ กรุณาตรวจสอบอีกครั้ง",
          icon: <XCircle className="w-4 h-4" />,
          duration: 5000,
        });
      } else if (errorMsg.includes("password") || errorMsg.includes("รหัสผ่าน")) {
        toast.error("รหัสผ่านไม่ถูกต้อง", {
          description: "รหัสผ่านไม่ตรงกับในระบบ กรุณาลองใหม่อีกครั้ง",
          icon: <XCircle className="w-4 h-4" />,
          duration: 5000,
        });
      } else if (errorMsg.includes("PENDING") || errorMsg.includes("รออนุมัติ")) {
        toast.error("บัญชียังไม่ได้รับการอนุมัติ", {
          description: "กรุณาติดต่อผู้ดูแลระบบเพื่อขออนุมัติการใช้งาน",
          icon: <AlertTriangle className="w-4 h-4" />,
          duration: 6000,
        });
      } else {
        toast.error("เข้าสู่ระบบไม่สำเร็จ", {
          description: errorMsg,
          icon: <XCircle className="w-4 h-4" />,
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleRegisterClick = () => {
    toast.info("กำลังไปหน้าสมัครสมาชิก", {
      description: "จะนำไปยังหน้าลงทะเบียนในอีกสักครู่",
      duration: 2000,
    });
    router.push("/register");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 text-sm">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                InvenStock
              </h1>
              <p className="text-sm text-gray-600">
                Multi-Tenant Inventory System V1.0
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">เข้าสู่ระบบ</CardTitle>
            <CardDescription className="text-center">
              กรอก Username และรหัสผ่านเพื่อเข้าสู่ระบบ
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="กรอก Username"
                  disabled={isLoading || loginSuccess}
                  className="h-11"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="กรอกรหัสผ่าน"
                    disabled={isLoading || loginSuccess}
                    className="h-11 pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-10 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || loginSuccess}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Button */}
              {!loginSuccess && (
                <Button
                  type="submit"
                  className="w-full h-11 text-base bg-blue-500 hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </Button>
              )}

              {/* Success State */}
              {loginSuccess && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                    <p className="text-sm text-green-700 font-medium">
                      เข้าสู่ระบบสำเร็จ! กำลังนำไปยัง Dashboard...
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    className="w-full h-11 text-base bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => router.push('/dashboard')}
                  >
                    เข้าสู่ Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </form>

            {/* Registration link */}
            {!loginSuccess && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ยังไม่มีบัญชี?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600 hover:text-blue-800"
                    onClick={handleRegisterClick}
                    disabled={isLoading}
                  >
                    สมัครสมาชิก
                  </Button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>InvenStock - Multi-Tenant Inventory Management</p>
          <p>© 2025 - Enterprise Grade Solution</p>
        </div>
      </div>
    </div>
  );
}