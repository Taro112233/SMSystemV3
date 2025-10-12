// app/login/page.tsx - FIXED NAVIGATION ISSUE

"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/utils/auth";
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
  Eye,
  EyeOff,
  XCircle,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

interface LoginFormData {
  username: string;
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

  const { login, loading } = useAuth();
  const router = useRouter();

  // ✅ FIXED: ลบ useEffect ที่ทำ auth check ออก (ไม่จำเป็น)
  // ✅ FIXED: ลบ loginSuccess state ออก (ไม่จำเป็น)

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

    const loadingToast = toast.loading("กำลังเข้าสู่ระบบ...", {
      description: "กรุณารอสักครู่",
    });

    try {
      // ✅ FIXED: รอให้ login เสร็จก่อน แล้ว redirect ทันที
      await login({
        username: formData.username.trim(),
        password: formData.password,
      });

      toast.dismiss(loadingToast);

      toast.success("เข้าสู่ระบบสำเร็จ!", {
        description: `ยินดีต้อนรับเข้าสู่ระบบจัดการสต็อก`,
        duration: 2000,
      });

      // ✅ FIXED: ใช้ window.location.href แทน router.push 
      // เพื่อให้แน่ใจว่า full page reload และ auth state update ถูกต้อง
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Login error:", error);
      
      const errorMsg = error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ";
      setError(errorMsg);
      
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
                  disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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

              {/* ✅ FIXED: ปุ่ม login เดียว ไม่มี conditional rendering */}
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
            </form>

            {/* Registration link */}
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