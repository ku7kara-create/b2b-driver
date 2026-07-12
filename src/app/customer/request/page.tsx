"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SERVICES = {
  car: { label: "سيارة خاصة", icon: "directions_car" },
  porter: { label: "بورتر", icon: "local_shipping" },
  tow_truck: { label: "ساحبة", icon: "precision_manufacturing" },
};

export default function CustomerRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedType = searchParams.get("type") || "";

  const [step, setStep] = useState(preselectedType ? 2 : 1);
  const [serviceType, setServiceType] = useState(preselectedType);
  const [form, setForm] = useState({
    pickupAddress: "",
    dropoffAddress: "",
    cargoDetails: "",
    cargoPhotos: [] as File[],
    vehicleMakeModel: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function selectService(type: string) {
    setServiceType(type);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body: Record<string, string> = {
        serviceType,
        pickupAddress: form.pickupAddress,
        dropoffAddress: form.dropoffAddress,
      };

      if (serviceType === "porter") {
        body.cargoDetails = form.cargoDetails;
      }
      if (serviceType === "tow_truck") {
        body.vehicleMakeModel = form.vehicleMakeModel;
      }

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
      } else {
        router.push(`/customer/bids/${data.tripId}`);
      }
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-surface border-b border-outline-variant flex flex-row-reverse items-center w-full px-4 h-16 sticky top-0 z-50">
          <Link href="/customer/dashboard" className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface">arrow_forward</span>
          </Link>
          <h1 className="text-xl font-semibold text-on-surface mr-4">اختيار الخدمة</h1>
        </header>

        <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">اطلب خدمة جديدة</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              اختر نوع الخدمة اللوجستية التي تناسب احتياجاتك. نضمن السرعة والأمان في كل رحلة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => selectService("car")}
              className="group bg-white/80 backdrop-blur-md border border-outline-variant rounded-xl p-6 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mb-6 group-hover:bg-secondary-container group-hover:text-white transition-all text-primary">
                <span className="material-symbols-outlined text-5xl">directions_car</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">سيارة خاصة</h3>
              <p className="text-base text-on-surface-variant mb-6 leading-relaxed">
                خدمة التوصيل السريع للمهام والمستندات الهامة داخل المدينة بكفاءة عالية.
              </p>
              <div className="w-full h-48 mb-6 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBunljD517EzvEnJCvYLI-DFh6zPCspkSIGyb7PRld15TYvEoVZJ0CdyiHD21uyMo2pJInWsNstT9SG_Du5JB_1rhdecVWbd8VAn2nRDhBrveCdE5B2BbAyvkKaHkFzfXzZEARtjQmYeEwwZ5HuET03AcJcSEmWUCaJtGC9ZdKC7cJCYLXAzaxa5npSRfDLZROlzzTkZyqRHY9DTne7OVKVu55gVC601JRW44jT8lVkttBb_Dnx-ZKcEVxVfX230BaGi1tMlVMI4QyH"
                  alt="سيارة خاصة"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="w-full py-3 bg-secondary-container text-white font-bold rounded-lg shadow-md text-base">
                اطلب الآن
              </span>
            </button>

            <button
              onClick={() => selectService("porter")}
              className="group bg-white/80 backdrop-blur-md border-2 border-secondary rounded-xl p-6 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1 relative"
            >
              <span className="absolute -top-3 px-4 py-1 bg-secondary text-white text-xs rounded-full">
                الأكثر طلباً
              </span>
              <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mb-6 group-hover:bg-secondary-container group-hover:text-white transition-all text-primary">
                <span className="material-symbols-outlined text-5xl">local_shipping</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">بورتر</h3>
              <p className="text-base text-on-surface-variant mb-6 leading-relaxed">
                حلول نقل شاملة للشحنات المتوسطة والكبيرة. أسطول مجهز لضمان وصول بضائعك بسلامة.
              </p>
              <div className="w-full h-48 mb-6 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQLF5yP4V8hMfvAESCwsqh_QmpD8XDU7VD4IuE_AbkA6EMA9lZ6vpW7Y3p_RIjQmDY2zww8oWps-49TA1PuB05AqYft07boX_bvVMfOobmKWhcRDGgBopLN4R-SZw8Gifdo4abNGcId4uK3yzeeCZy9x9Zl8mpBb7pqJo3Ca3vlzuiwXZVV0nCTEVLhNr3CS6_ktXMvY552EG6kmHTxFAw5y3Y_UJI9L6IT_Ajz57XfqHJq7b5mfBUWvcSXBFVnOxVWKJPx86ZsX7u"
                  alt="بورتر"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="w-full py-3 bg-secondary-container text-white font-bold rounded-lg shadow-md text-base">
                اطلب الآن
              </span>
            </button>

            <button
              onClick={() => selectService("tow_truck")}
              className="group bg-white/80 backdrop-blur-md border border-outline-variant rounded-xl p-6 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mb-6 group-hover:bg-secondary-container group-hover:text-white transition-all text-primary">
                <span className="material-symbols-outlined text-5xl">construction</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">ساحبة</h3>
              <p className="text-base text-on-surface-variant mb-6 leading-relaxed">
                نقل المركبات والمعدات الثقيلة بأمان تام. متاح 24 ساعة للحالات الطارئة.
              </p>
              <div className="w-full h-48 mb-6 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW-A7-HF5E8kGUtnM1-vJ9TNLvbcm8K08P4orm4giu1sOBpGWr5m0Yyd7xaAi9BG498jmL_9MkIO6c37dk0l6AcuP_kNt49iqYcw4Wv6sGX7DNZ-ZAzgjlchvLwEIQA9v1ZPu2M45v9YThkQ2G-GEoKTHVg_Scgw3N41I7kaHHpVUysoJn82hClqnuCtnacVsTSZDiuKYhdASzmT_3IE9pJ562GXNVRfK1hearPXnbzsonxPq7Rhd0j1zc2tYTAzdIC7U3uT08g5pH"
                  alt="ساحبة"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="w-full py-3 bg-secondary-container text-white font-bold rounded-lg shadow-md text-base">
                اطلب الآن
              </span>
            </button>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { value: "500+", label: "سائق معتمد" },
              { value: "24/7", label: "دعم فني" },
              { value: "15 min", label: "متوسط الوصول" },
              { value: "100%", label: "تأمين شامل" },
            ].map((s) => (
              <div key={s.label} className="p-4 bg-white rounded-lg border border-outline-variant">
                <span className="block text-xl font-bold text-secondary">{s.value}</span>
                <span className="text-sm text-on-surface-variant">{s.label}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface border-b border-outline-variant flex flex-row-reverse items-center w-full px-4 h-16 sticky top-0 z-50">
        <button onClick={() => setStep(1)} className="p-2 hover:bg-surface-container-low rounded-full">
          <span className="material-symbols-outlined text-on-surface">arrow_forward</span>
        </button>
        <h1 className="text-xl font-semibold text-on-surface mr-4">
          {SERVICES[serviceType]?.label || "طلب جديد"}
        </h1>
      </header>

      <main className="flex-grow flex items-center justify-center py-8 px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant">
          {error && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-on-surface-variant px-1">
              موقع الانطلاق
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute right-3 top-3 text-outline">
                trip_origin
              </span>
              <input
                type="text"
                className="w-full pr-10 pl-3 h-12 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary-container text-base"
                placeholder="أدخل عنوان الانطلاق"
                value={form.pickupAddress}
                onChange={(e) => updateField("pickupAddress", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-on-surface-variant px-1">
              موقع الوصول
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute right-3 top-3 text-outline">
                location_on
              </span>
              <input
                type="text"
                className="w-full pr-10 pl-3 h-12 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary-container text-base"
                placeholder="أدخل عنوان الوصول"
                value={form.dropoffAddress}
                onChange={(e) => updateField("dropoffAddress", e.target.value)}
                required
              />
            </div>
          </div>

          {serviceType === "porter" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface-variant px-1">
                تفاصيل البضائع
              </label>
              <textarea
                className="w-full px-3 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary-container text-base min-h-24"
                placeholder="اكتب وصفاً للبضائع المراد شحنها (النوع، الوزن التقريبي، الأبعاد)..."
                value={form.cargoDetails}
                onChange={(e) => updateField("cargoDetails", e.target.value)}
                required
              />
              <label className="block text-sm font-medium text-on-surface-variant px-1 mt-2">
                صور البضائع (اختياري)
              </label>
              <input
                type="file"
                className="w-full text-sm text-on-surface-variant file:ml-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-surface-container file:text-on-surface file:font-medium"
                accept="image/*"
                multiple
                onChange={(e) => setForm((prev) => ({ ...prev, cargoPhotos: Array.from(e.target.files || []) }))}
              />
            </div>
          )}

          {serviceType === "tow_truck" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface-variant px-1">
                نوع وموديل المركبة
              </label>
              <input
                type="text"
                className="w-full px-3 h-12 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary-container text-base"
                placeholder="مثال: تويوتا كامري 2020"
                value={form.vehicleMakeModel}
                onChange={(e) => updateField("vehicleMakeModel", e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-secondary-container text-white font-bold text-lg rounded-lg shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                جاري الإرسال...
              </>
            ) : (
              <>
                <span>إرسال الطلب</span>
                <span className="material-symbols-outlined">send</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
