"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      phone: `+218${phone}`,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error.includes("مراجعة") || result.error.includes("PENDING")) {
        setError("حسابك قيد المراجعة حالياً من قبل الإدارة. سيتم إشعارك فور تفعيل الحساب.");
      } else {
        setError("رقم الهاتف أو كلمة المرور غير صحيحة");
      }
    } else if (result?.ok) {
      const session = await getSession();
      const role = (session?.user as any)?.role;
      if (role === "admin") router.push("/admin/dashboard");
      else if (role === "driver") router.push("/driver/dashboard");
      else router.push("/customer/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] flex flex-col">

        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-[#1e293b] rounded-xl shadow-sm flex items-center justify-center">
            <span className="text-3xl text-[#E05A2B] font-extrabold">B2B</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#091426] mb-1">تسجيل الدخول</h1>
          <p className="text-base text-gray-500">مرحباً بك مجدداً في B2B Driver</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">رقم الهاتف</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#E05A2B] focus-within:ring-1 focus-within:ring-[#E05A2B] transition-all">
              <input
                type="tel"
                className="w-full h-12 px-4 bg-transparent border-none focus:ring-0 text-base text-left"
                dir="ltr"
                placeholder="091xxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">كلمة المرور</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#E05A2B] focus-within:ring-1 focus-within:ring-[#E05A2B] transition-all">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full h-12 px-4 bg-transparent border-none focus:ring-0 text-base text-right"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-4 text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>

          <div className="text-right">
            <a href="#" className="text-sm font-medium text-[#E05A2B] hover:underline">نسيت كلمة المرور؟</a>
          </div>

        </form>

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            const form = document.querySelector("form") as HTMLFormElement;
            if (form) form.requestSubmit();
          }}
          style={{
            width: "100%",
            height: "56px",
            backgroundColor: "#E05A2B",
            color: "white",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "18px",
            marginTop: "16px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "جاري الدخول..." : "تسجيل الدخول"}
        </button>

        <p className="mt-8 text-center text-base text-gray-500">
          ليس لديك حساب؟{" "}
          <Link href="/" className="text-[#E05A2B] font-bold hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>

        <div className="mt-8 flex justify-center gap-6 opacity-40">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">verified_user</span>
            <span className="text-xs text-gray-500">آمن ومشفر</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">public</span>
            <span className="text-xs text-gray-500">لوجستيات ذكية</span>
          </div>
        </div>

      </div>
    </div>
  );
}
