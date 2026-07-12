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

    try {
      const result = await signIn("credentials", {
        phone: `+966${phone}`,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("رقم الهاتف أو كلمة المرور غير صحيحة");
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-[420px] flex flex-col">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-center p-4 border border-outline-variant">
            <img
              src="https://lh3.googleusercontent.com/aida/AP1WRLtYZ5jwWQMUVAxkDRRChuMLOCDeF-xwRUFTgHgyUYObUK4PgIL4_6QXO5Msj_jG18X26Mh_VaXtmRmQsRfttJBd9MfBjyLH51tp11939CH2u9ekTG3yJvvcOstol1OREqMvUHj_DMVubJj6J-pQ2BFe007NItoZOeh8oH5nA-FBT0NDGXFQpCxXe5jVLvT6RBpjLpd932S3HoWVqlNpB8Ae2hi1dYXxSdc73xi58PSIc2LHOQfRMfBz4_hL"
              alt="B2B Driver Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <header className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-primary mb-2">تسجيل الدخول</h1>
          <p className="text-base text-on-surface-variant">
            مرحباً بك مجدداً في B2B Driver
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant"
        >
          {error && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-on-surface px-1">
              رقم الهاتف
            </label>
            <div className="relative flex items-center border border-outline-variant rounded-lg bg-surface-container-low focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(9,20,38,0.2)] transition-all duration-200" dir="ltr">
              <div className="flex items-center gap-1 px-3 border-r border-outline-variant h-12">
                <span className="text-base text-primary font-inter">+966</span>
              </div>
              <input
                type="tel"
                className="w-full h-12 px-3 bg-transparent border-none focus:ring-0 text-base text-on-surface text-left placeholder:text-on-surface-variant/50"
                placeholder="5xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-on-surface px-1">
              كلمة المرور
            </label>
            <div className="relative flex items-center border border-outline-variant rounded-lg bg-surface-container-low focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(9,20,38,0.2)] transition-all duration-200">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full h-12 px-3 bg-transparent border-none focus:ring-0 text-base text-on-surface text-right placeholder:text-on-surface-variant/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex justify-start">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-secondary hover:underline transition-all"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-14 bg-secondary-container text-white rounded-lg font-bold text-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 ${
              loading ? "opacity-80" : ""
            }`}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                جاري الدخول...
              </>
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <span className="material-symbols-outlined">login</span>
              </>
            )}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <p className="text-base text-on-surface-variant">
            ليس لديك حساب؟{" "}
            <Link href="/" className="text-secondary font-bold hover:underline mr-1">
              إنشاء حساب جديد
            </Link>
          </p>
        </footer>

        <div className="mt-8 flex justify-center gap-6 opacity-40 grayscale">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">verified_user</span>
            <span className="text-xs">آمن ومشفر</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">public</span>
            <span className="text-xs">لوجستيات ذكية</span>
          </div>
        </div>
      </main>
    </div>
  );
}
