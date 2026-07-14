"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
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
      setError("رقم الهاتف أو كلمة المرور غير صحيحة");
    } else if (result?.ok) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] flex flex-col">

        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-white rounded-xl shadow-sm flex items-center justify-center p-4 border border-gray-200">
            <span className="text-4xl">🚚</span>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-[#091426] text-center mb-2">تسجيل الدخول</h1>
        <p className="text-base text-gray-500 text-center mb-8">مرحباً بك مجدداً في B2B Driver</p>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#E05A2B] text-white rounded-lg font-bold text-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              "جاري الدخول..."
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <span className="material-symbols-outlined">login</span>
              </>
            )}
          </button>
        </form>

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
