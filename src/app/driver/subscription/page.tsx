"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function DriverSubscriptionPage() {
  const [status, setStatus] = useState<{
    subscriptionStatus: string;
    subscriptionExpiry: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/driver/subscription");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  async function handleRequestSubscription() {
    setRequesting(true);
    setMessage("");
    try {
      const res = await fetch("/api/driver/subscription", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage("تم تقديم طلب الاشتراك. سيتم مراجعة الدفع وتفعيل حسابك.");
        setStatus({
          subscriptionStatus: "pending",
          subscriptionExpiry: null,
        });
      } else {
        setMessage(data.error || "فشل الطلب");
      }
    } catch {
      setMessage("تعذر الاتصال بالخادم");
    }
    setRequesting(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface border-b border-outline-variant flex flex-row-reverse items-center w-full px-4 h-16 sticky top-0 z-50">
        <Link href="/driver/dashboard" className="p-2 hover:bg-surface-container-low rounded-full">
          <span className="material-symbols-outlined text-on-surface">arrow_forward</span>
        </Link>
        <h1 className="text-xl font-semibold text-on-surface mr-4">الاشتراك</h1>
      </header>

      <main className="flex-grow flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md">
          {loading ? (
            <div className="text-center text-on-surface-variant">جاري التحميل...</div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-secondary-fixed flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-4xl text-secondary">credit_card</span>
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">
                  {status?.subscriptionStatus === "active"
                    ? "الاشتراك نشط"
                    : status?.subscriptionStatus === "pending"
                      ? "الاشتراك قيد المراجعة"
                      : "الاشتراك غير مفعل"}
                </h2>
                <p className="text-on-surface-variant">
                  {status?.subscriptionStatus === "active"
                    ? `ينتهي الاشتراك في: ${status.subscriptionExpiry ? new Date(status.subscriptionExpiry).toLocaleDateString("ar") : "—"}`
                    : status?.subscriptionStatus === "pending"
                      ? "جارٍ مراجعة طلبك من قبل الإدارة"
                      : "الاشتراك الشهري 150 LYD"}
                </p>
              </div>

              {message && (
                <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm text-center mb-4">
                  {message}
                </div>
              )}

              {status?.subscriptionStatus === "inactive" && (
                <button
                  onClick={handleRequestSubscription}
                  disabled={requesting}
                  className="w-full h-14 bg-secondary-container text-white font-bold text-lg rounded-lg shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {requesting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">sync</span>
                      جاري الطلب...
                    </>
                  ) : (
                    <>
                      <span>تقديم طلب اشتراك (150 LYD)</span>
                      <span className="material-symbols-outlined">send</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
