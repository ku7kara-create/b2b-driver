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
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col px-4 pt-8">
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center">
            <span className="text-3xl">🚚</span>
          </div>
          <h1 className="text-2xl font-bold text-[#091426] mb-1">تسجيل الدخول</h1>
          <p className="text-sm text-gray-500">مرحباً بك مجدداً في B2B Driver</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">رقم الهاتف</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#E05A2B] focus-within:ring-1 focus-within:ring-[#E05A2B] transition-all" dir="ltr">
              <span className="px-3 border-r border-gray-300 text-sm text-gray-700">+218</span>
              <input
                type="tel"
                className="w-full h-12 px-3 bg-transparent border-none focus:ring-0 text-base text-left"
                placeholder="91xxxxxxx"
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
                className="w-full h-12 px-3 bg-transparent border-none focus:ring-0 text-base text-right"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3 text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-6 bg-[#E05A2B] text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all cursor-pointer relative z-50 block"
          >
            {loading ? "جاري التحميل..." : "تسجيل الدخول"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ليس لديك حساب؟{" "}
          <Link href="/" className="text-[#E05A2B] font-bold hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}
