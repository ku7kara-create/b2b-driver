"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";

const MapPickerModal = dynamic(() => import("@/components/map-picker"), { ssr: false });

const SERVICES: Record<string, { label: string; icon: string }> = {
  private_car: { label: "سيارة خاصة", icon: "directions_car" },
  porter: { label: "بورتر", icon: "local_shipping" },
  tow_truck: { label: "ساحبة", icon: "precision_manufacturing" },
};

export default function CustomerRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedType = searchParams.get("type") || "";
  const { toast } = useToast();

  const [step, setStep] = useState(preselectedType ? 2 : 1);
  const [serviceType, setServiceType] = useState(preselectedType);
  const [form, setForm] = useState({
    pickupAddress: "",
    pickupLat: 24.7136,
    pickupLng: 46.6753,
    dropoffAddress: "",
    dropoffLat: 24.7742,
    dropoffLng: 46.7385,
    cargoDetails: "",
    cargoPhotos: [] as File[],
    vehicleMakeModel: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [mapTarget, setMapTarget] = useState<"pickup" | "dropoff" | null>(null);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setForm((prev) => ({ ...prev, cargoPhotos: files }));
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)));
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
      const body: Record<string, unknown> = {
        serviceType,
        pickupAddress: form.pickupAddress,
        pickupLat: form.pickupLat,
        pickupLng: form.pickupLng,
        dropoffAddress: form.dropoffAddress,
        dropoffLat: form.dropoffLat,
        dropoffLng: form.dropoffLng,
      };

      if (serviceType === "porter") {
        body.cargoDetails = form.cargoDetails;
        if (form.cargoPhotos.length > 0) {
          const fd = new FormData();
          form.cargoPhotos.forEach((f) => fd.append("files", f));
          try {
            const upRes = await fetch("/api/upload", { method: "POST", body: fd });
            if (upRes.ok) {
              const upData = await upRes.json();
              body.cargoPhotos = upData.files.join(",");
            }
          } catch {}
        }
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
        toast(data.error || "حدث خطأ", "error");
      } else {
        toast("تم إرسال الطلب بنجاح، بانتظار العروض", "success");
        router.push(`/customer/bids/${data.tripId}`);
      }
    } catch {
      toast("تعذر الاتصال بالخادم", "error");
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
            {[
              {
                type: "private_car",
                title: "سيارة خاصة",
                desc: "خدمة التوصيل السريع للمهام والمستندات الهامة داخل المدينة بكفاءة عالية.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBunljD517EzvEnJCvYLI-DFh6zPCspkSIGyb7PRld15TYvEoVZJ0CdyiHD21uyMo2pJInWsNstT9SG_Du5JB_1rhdecVWbd8VAn2nRDhBrveCdE5B2BbAyvkKaHkFzfXzZEARtjQmYeEwwZ5HuET03AcJcSEmWUCaJtGC9ZdKC7cJCYLXAzaxa5npSRfDLZROlzzTkZyqRHY9DTne7OVKVu55gVC601JRW44jT8lVkttBb_Dnx-ZKcEVxVfX230BaGi1tMlVMI4QyH",
                popular: false,
              },
              {
                type: "porter",
                title: "بورتر",
                desc: "حلول نقل شاملة للشحنات المتوسطة والكبيرة. أسطول مجهز لضمان وصول بضائعك بسلامة.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQLF5yP4V8hMfvAESCwsqh_QmpD8XDU7VD4IuE_AbkA6EMA9lZ6vpW7Y3p_RIjQmDY2zww8oWps-49TA1PuB05AqYft07boX_bvVMfOobmKWhcRDGgBopLN4R-SZw8Gifdo4abNGcId4uK3yzeeCZy9x9Zl8mpBb7pqJo3Ca3vlzuiwXZVV0nCTEVLhNr3CS6_ktXMvY552EG6kmHTxFAw5y3Y_UJI9L6IT_Ajz57XfqHJq7b5mfBUWvcSXBFVnOxVWKJPx86ZsX7u",
                popular: true,
              },
              {
                type: "tow_truck",
                title: "ساحبة",
                desc: "نقل المركبات والمعدات الثقيلة بأمان تام. متاح 24 ساعة للحالات الطارئة.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCW-A7-HF5E8kGUtnM1-vJ9TNLvbcm8K08P4orm4giu1sOBpGWr5m0Yyd7xaAi9BG498jmL_9MkIO6c37dk0l6AcuP_kNt49iqYcw4Wv6sGX7DNZ-ZAzgjlchvLwEIQA9v1ZPu2M45v9YThkQ2G-GEoKTHVg_Scgw3N41I7kaHHpVUysoJn82hClqnuCtnacVsTSZDiuKYhdASzmT_3IE9pJ562GXNVRfK1hearPXnbzsonxPq7Rhd0j1zc2tYTAzdIC7U3uT08g5pH",
                popular: false,
              },
            ].map((svc) => (
              <button
                key={svc.type}
                onClick={() => selectService(svc.type)}
                className={`group bg-white/80 backdrop-blur-md rounded-xl p-6 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1 relative ${
                  svc.popular ? "border-2 border-secondary" : "border border-outline-variant"
                }`}
              >
                {svc.popular && (
                  <span className="absolute -top-3 px-4 py-1 bg-secondary text-white text-xs rounded-full">
                    الأكثر طلباً
                  </span>
                )}
                <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mb-6 group-hover:bg-secondary-container group-hover:text-white transition-all text-primary">
                  <span className="material-symbols-outlined text-5xl">
                    {SERVICES[svc.type]?.icon}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4">{svc.title}</h3>
                <p className="text-base text-on-surface-variant mb-6 leading-relaxed">{svc.desc}</p>
                <div className="w-full h-48 mb-6 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant">
                  <img src={svc.img} alt={svc.title} className="w-full h-full object-cover" />
                </div>
                <span className="w-full py-3 bg-secondary-container text-white font-bold rounded-lg shadow-md text-base">
                  اطلب الآن
                </span>
              </button>
            ))}
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
            <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm text-center">{error}</div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-on-surface-variant px-1">موقع الانطلاق</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute right-3 top-3 text-outline">trip_origin</span>
              <input
                type="text"
                className="w-full pr-10 pl-3 h-12 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary-container text-base"
                placeholder="أدخل عنوان الانطلاق"
                value={form.pickupAddress}
                onChange={(e) => updateField("pickupAddress", e.target.value)}
                required
              />
            </div>
            <button type="button" onClick={() => setMapTarget("pickup")} className="w-full text-[#E05A2B] text-xs font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">map</span>
              تحديد الموقع على الخريطة
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-on-surface-variant px-1">موقع الوصول</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute right-3 top-3 text-outline">location_on</span>
              <input
                type="text"
                className="w-full pr-10 pl-3 h-12 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary-container text-base"
                placeholder="أدخل عنوان الوصول"
                value={form.dropoffAddress}
                onChange={(e) => updateField("dropoffAddress", e.target.value)}
                required
              />
            </div>
            <button type="button" onClick={() => setMapTarget("dropoff")} className="w-full text-[#E05A2B] text-xs font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">map</span>
              تحديد الموقع على الخريطة
            </button>
          </div>

          {serviceType === "porter" && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-on-surface-variant px-1">تفاصيل البضائع</label>
                <textarea
                  className="w-full px-3 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary-container text-base min-h-24"
                  placeholder="اكتب وصفاً للبضائع المراد شحنها (النوع، الوزن التقريبي، الأبعاد)..."
                  value={form.cargoDetails}
                  onChange={(e) => updateField("cargoDetails", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-on-surface-variant px-1">صور البضائع</label>
                <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-4xl text-outline">add_a_photo</span>
                  <span className="text-sm text-on-surface-variant">اضغط لإضافة صور البضائع</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                </label>
                {photoPreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {photoPreviews.map((src, i) => (
                      <img key={i} src={src} alt={`صورة ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-outline-variant" />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {serviceType === "tow_truck" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface-variant px-1">نوع وموديل المركبة</label>
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
            className="w-full h-14 bg-secondary-container text-white font-bold text-lg rounded-lg shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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

      {mapTarget && (
        <MapPickerModal
          target={mapTarget}
          onSelect={(lat, lng) => {
            if (mapTarget === "pickup") {
              updateField("pickupLat", String(lat));
              updateField("pickupLng", String(lng));
              updateField("pickupAddress", `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            } else {
              updateField("dropoffLat", String(lat));
              updateField("dropoffLng", String(lng));
              updateField("dropoffAddress", `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          }}
          onClose={() => setMapTarget(null)}
        />
      )}
    </div>
  );
}
