"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "بني وليد",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }

    if (form.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          phone: `+218${form.phone}`,
          password: form.password,
          role: "customer",
          city: form.city,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء إنشاء الحساب");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 1500);
      }
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full px-4 h-16 flex items-center justify-between bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0 z-50">
        <Link href="/" className="p-2 rounded-full hover:bg-surface-variant transition-colors">
          <span className="material-symbols-outlined text-primary">arrow_forward</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">B2B Driver</span>
        </div>
        <h1 className="text-lg font-semibold text-on-surface">إنشاء حساب عميل</h1>
      </header>

      <main className="flex-grow flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg flex flex-col items-center">
          <div className="mb-8 text-center">
            <img
              src="https://lh3.googleusercontent.com/aida/AP1WRLtYZ5jwWQMUVAxkDRRChuMLOCDeF-xwRUFTgHgyUYObUK4PgIL4_6QXO5Msj_jG18X26Mh_VaXtmRmQsRfttJBd9MfBjyLH51tp11939CH2u9ekTG3yJvvcOstol1OREqMvUHj_DMVubJj6J-pQ2BFe007NItoZOeh8oH5nA-FBT0NDGXFQpCxXe5jVLvT6RBpjLpd932S3HoWVqlNpB8Ae2hi1dYXxSdc73xi58PSIc2LHOQfRMfBz4_hL"
              alt="B2B Driver Logo"
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-semibold text-primary mb-1">
              إنشاء حساب جديد
            </h1>
            <p className="text-base text-on-surface-variant">
              انضم إلينا واستمتع بخدمات لوجستية متطورة
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full space-y-4 bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md border border-outline-variant/30"
          >
            {error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm text-center">
                تم إنشاء الحساب بنجاح! جاري التحويل...
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-on-surface-variant px-1">
                الاسم الكامل
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline">
                  person
                </span>
                <input
                  type="text"
                  className="w-full pr-10 pl-3 h-12 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-secondary-container transition-all text-base"
                  placeholder="أدخل اسمك بالكامل"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-on-surface-variant px-1">
                رقم الهاتف
              </label>
              <div className="flex gap-2" dir="ltr">
                <div className="relative w-28 shrink-0">
                  <select className="w-full pl-1 pr-8 h-12 bg-surface-container-lowest border border-outline-variant rounded-lg appearance-none focus:outline-none focus:border-secondary-container text-base">
                    <option>+218</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-sm">
                    expand_more
                  </span>
                </div>
                <input
                  type="tel"
                  className="flex-1 px-3 h-12 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-secondary-container transition-all text-base text-left"
                  placeholder="91 000 0000"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-on-surface-variant px-1">المدينة</label>
              <select
                className="w-full px-3 h-12 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-secondary-container text-base"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              >
                <option value="بني وليد">بني وليد</option>
                <option value="بنغازي">بنغازي</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-on-surface-variant px-1">
                كلمة المرور
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline">
                  lock
                </span>
                <input
                  type="password"
                  className="w-full pr-10 pl-3 h-12 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-secondary-container transition-all text-base text-left"
                  dir="ltr"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-on-surface-variant px-1">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline">
                  lock_reset
                </span>
                <input
                  type="password"
                  className="w-full pr-10 pl-3 h-12 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-secondary-container transition-all text-base text-left"
                  dir="ltr"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className={`w-full h-14 rounded-lg font-bold text-lg shadow-sm hover:shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 ${
                  success
                    ? "bg-green-600 text-white"
                    : "bg-secondary-container text-white hover:bg-secondary"
                } ${loading ? "opacity-80" : ""}`}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    جاري المعالجة...
                  </>
                ) : success ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    تم الإرسال بنجاح
                  </>
                ) : (
                  <>
                    <span>تقديم طلب للتسجيل</span>
                    <span className="material-symbols-outlined">send</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-outline-variant/30">
              <p className="text-base text-on-surface-variant">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="text-secondary font-bold hover:underline transition-all">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-6 grid grid-cols-3 gap-4 w-full opacity-60">
            <div className="h-1 bg-outline-variant rounded-full"></div>
            <div className="h-1 bg-secondary-container rounded-full"></div>
            <div className="h-1 bg-outline-variant rounded-full"></div>
          </div>
        </div>
      </main>

      <footer className="w-full py-3 text-center border-t border-outline-variant bg-surface-container-lowest">
        <p className="text-xs text-on-surface-variant">
          &copy; 2024 B2B Driver Logistics. جميع الحقوق محفوظة.
        </p>
      </footer>
    </div>
  );
}
