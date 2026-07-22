"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const VEHICLE_TYPES = [
  { value: "porter_canter", label: "بورتر وكنتر", icon: "local_shipping" },
  { value: "private_car", label: "سيارة خاصة", icon: "directions_car" },
  { value: "tow_truck", label: "ساحبة", icon: "precision_manufacturing" },
];

const LICENSE_TYPES = [
  { value: "private", label: "رخصة قيادة خاصة" },
  { value: "public_light", label: "رخصة قيادة عمومي خفيف" },
  { value: "public_heavy", label: "رخصة قيادة عمومي ثقيل" },
  { value: "motorcycle", label: "رخصة قيادة دراجة آلية" },
];

export default function DriverRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "بني وليد",
    gender: "ذكر",
    licenseType: "",
    vehicleType: "",
    password: "",
    confirmPassword: "",
  });
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!terms) {
      setError("يجب الموافقة على الشروط والأحكام");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }

    if (form.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (!form.vehicleType) {
      setError("الرجاء اختيار نوع المركبة");
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
          role: "driver",
          licenseType: form.licenseType,
          vehicleType: form.vehicleType,
          city: form.city,
          gender: form.gender,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء إنشاء الحساب");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header style={{ backgroundColor: "#FF8C00" }} className="w-full px-4 h-16 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="p-2 rounded-full hover:brightness-110 transition-all">
          <span className="material-symbols-outlined" style={{ color: "white" }}>arrow_forward</span>
        </Link>
        <span className="text-xl font-bold" style={{ color: "white" }}>B2B Driver</span>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 bg-primary-container text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">طلب تسجيل سائق جديد</h2>
              <p className="text-on-primary-container font-medium opacity-90">
                انضم إلى شبكتنا اللوجستية الاحترافية وابدأ رحلتك اليوم
              </p>
            </div>
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6" autoComplete="off">
            <input type="text" style={{ display: "none" }} tabIndex={-1} readOnly />
            <input type="password" style={{ display: "none" }} tabIndex={-1} readOnly />
            {error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm text-center">
                تم إرسال الطلب بنجاح! جاري التحويل لصفحة الدخول...
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-on-surface-variant px-1">
                  الاسم بالكامل
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline">
                    person
                  </span>
                  <input
                    type="text"
                    placeholder="أدخل اسمك الثلاثي"
                    className="w-full pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-base focus:outline-none focus:border-secondary-container transition-all"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-on-surface-variant px-1">
                  رقم الهاتف
                </label>
                <div className="relative flex flex-row-reverse">
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline">
                    phone_iphone
                  </span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    autoComplete="off"
                    data-lpignore="true"
                    placeholder="91XXXXXXXX"
                    className="w-full pr-10 pl-16 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-base text-left focus:outline-none focus:border-secondary-container transition-all"
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    required
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-primary border-r border-outline-variant pr-2 text-sm" dir="ltr">
                    +218
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-on-surface-variant px-1">المدينة</label>
              <select
                className="w-full py-3 bg-surface-container-low border border-outline-variant rounded-lg text-base focus:outline-none focus:border-secondary-container transition-all"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              >
                <option value="بني وليد">بني وليد</option>
                <option value="بنغازي">بنغازي</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-on-surface-variant px-1">الجنس</label>
              <div className="flex gap-4">
                <button type="button" onClick={() => updateField("gender", "ذكر")} className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${form.gender === "ذكر" ? "border-[#FF8C00] bg-orange-50 text-[#FF8C00] font-semibold" : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"}`}>
                  <span className="material-symbols-outlined text-3xl">man</span>
                  <span className="text-sm">ذكر</span>
                </button>
                <button type="button" onClick={() => updateField("gender", "أنثى")} className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${form.gender === "أنثى" ? "border-[#FF8C00] bg-orange-50 text-[#FF8C00] font-semibold" : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"}`}>
                  <span className="material-symbols-outlined text-3xl">woman</span>
                  <span className="text-sm">أنثى</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-on-surface-variant px-1">
                  نوع الرخصة
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline">
                    assignment_ind
                  </span>
                  <select
                    className="w-full pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-base appearance-none focus:outline-none focus:border-secondary-container transition-all"
                    value={form.licenseType}
                    onChange={(e) => updateField("licenseType", e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      اختر نوع الرخصة
                    </option>
                    {LICENSE_TYPES.map((lt) => (
                      <option key={lt.value} value={lt.value}>
                        {lt.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-on-surface-variant px-1">
                نوع المركبة
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {VEHICLE_TYPES.map((vt) => (
                  <label key={vt.value} className="cursor-pointer">
                    <input
                      className="hidden peer"
                      type="radio"
                      name="vehicleType"
                      value={vt.value}
                      checked={form.vehicleType === vt.value}
                      onChange={(e) => updateField("vehicleType", e.target.value)}
                    />
                    <div className="flex flex-col items-center justify-center p-4 border border-outline-variant rounded-xl bg-surface-container-low hover:bg-surface-variant peer-checked:border-secondary-container peer-checked:bg-secondary-fixed transition-all duration-200">
                      <span className="material-symbols-outlined text-3xl mb-1">
                        {vt.icon}
                      </span>
                      <span className="text-sm font-bold">{vt.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-on-surface-variant px-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline">
                    lock
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-base text-left focus:outline-none focus:border-secondary-container transition-all"
                    dir="ltr"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-on-surface-variant px-1">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline">
                    lock_reset
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-base text-left focus:outline-none focus:border-secondary-container transition-all"
                    dir="ltr"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-secondary-container border-outline-variant rounded focus:ring-secondary"
              />
              <label htmlFor="terms" className="text-sm text-on-surface-variant">
                أوافق على{" "}
                <a href="#" className="text-secondary font-bold hover:underline">
                  الشروط والأحكام
                </a>{" "}
                و{" "}
                <a href="#" className="text-secondary font-bold hover:underline">
                  سياسة الخصوصية
                </a>{" "}
                الخاصة بمنصة B2B Driver.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                success
                  ? "bg-green-600 text-white"
                  : "bg-secondary-container text-white hover:bg-secondary"
              } ${loading ? "opacity-80" : ""}`}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  جاري معالجة الطلب...
                </>
              ) : success ? (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  تم إرسال الطلب بنجاح
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">how_to_reg</span>
                  تقديم طلب للتسجيل
                </>
              )}
            </button>
          </form>

          <div className="px-8 py-6 bg-surface-container border-t border-outline-variant flex flex-col items-center gap-3">
            <p className="text-sm text-on-surface-variant">لديك حساب بالفعل؟</p>
            <Link
              href="/login"
              className="text-primary font-bold hover:text-secondary-container transition-colors"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 px-4 flex flex-col items-center gap-4 bg-surface-dim">
        <div className="flex items-center gap-8 opacity-60">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined">verified_user</span>
            <span className="text-xs">آمن ومشفر</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined">support_agent</span>
            <span className="text-xs">دعم 24/7</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined">gpp_good</span>
            <span className="text-xs">موثق من الهيئة</span>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant opacity-50">
          &copy; 2024 B2B Driver Logistics. جميع الحقوق محفوظة.
        </p>
      </footer>
    </div>
  );
}
