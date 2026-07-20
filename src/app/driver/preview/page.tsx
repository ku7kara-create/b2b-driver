"use client";

export default function DriverPreviewPage() {
  return (
    <div style={{ padding: "20px", backgroundColor: "#f0f0f0", fontFamily: "sans-serif", direction: "rtl" }}>
      <h1 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", marginBottom: "20px", color: "#091426" }}>
        🎨 معرض شاشات السائق - Driver Screens Gallery
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "20px", maxWidth: "1400px", margin: "0 auto" }}>

        {/* 1. Pending Trip Card / Live Bidding Feed */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ background: "#091426", color: "white", padding: "12px 16px", fontWeight: "bold", fontSize: "14px" }}>📋 1. بطاقة الطلب المعلق + العروض</div>
          <div style={{ padding: "16px" }}>
            <div style={{ backgroundColor: "#1e293b", color: "white", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#9ca3af", fontSize: "12px" }}>رقم الطلب</span>
                <span style={{ backgroundColor: "#FF8C00", color: "white", padding: "2px 8px", borderRadius: "9999px", fontSize: "11px" }}>معلق</span>
              </div>
              <p style={{ fontSize: "18px", fontWeight: "bold" }}>#ABC12345</p>
              <p style={{ fontSize: "13px", color: "#d1d5db", marginTop: "4px" }}>المنطقة الصناعية → حي الياسمين</p>
              <div style={{ marginTop: "8px" }}>
                <span style={{ fontSize: "11px", color: "#f87171", border: "1px solid #f87171", padding: "2px 8px", borderRadius: "4px" }}>إلغاء الطلب</span>
              </div>
            </div>
            <p style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>العروض المقدمة (2)</p>
            {[
              { name: "أحمد القحطاني", price: 150, rating: 4.9, eta: 5 },
              { name: "خالد العتيبي", price: 135, rating: 4.7, eta: 8 },
            ].map((b, i) => (
              <div key={i} style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "12px", marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div>
                    <p style={{ fontWeight: "bold" }}>{b.name}</p>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>⭐ {b.rating} · 🚗 {b.eta} دقائق</p>
                  </div>
                  <p style={{ fontSize: "20px", fontWeight: "800", color: "#FF8C00" }}>{b.price} <span style={{ fontSize: "12px", color: "#9ca3af" }}>LYD</span></p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ flex: 1, padding: "10px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold" }}>قبول العرض</button>
                  <button style={{ padding: "10px 16px", backgroundColor: "transparent", border: "2px solid #fca5a5", color: "#ef4444", borderRadius: "8px", fontWeight: "bold" }}>رفض</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Active Trip - Stage 1 */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ background: "#16a34a", color: "white", padding: "12px 16px", fontWeight: "bold", fontSize: "14px" }}>🚀 2. رحلة نشطة - Stage 1</div>
          <div style={{ padding: "16px" }}>
            <div style={{ backgroundColor: "#e5e7eb", height: "160px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "40px" }}>🗺️</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#6b7280" }}>الحالة</p>
                <p style={{ fontSize: "18px", fontWeight: "bold", color: "#2563eb" }}>في الطريق</p>
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: "12px", color: "#6b7280" }}>السعر</p>
                <p style={{ fontSize: "24px", fontWeight: "800", color: "#FF8C00" }}>150.00 <span style={{ fontSize: "14px", color: "#9ca3af" }}>LYD</span></p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <a style={{ flex: 1, padding: "12px", backgroundColor: "#FF8C00", color: "white", borderRadius: "8px", fontWeight: "bold", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }} href="#"><span>💬</span> رسالة</a>
              <a style={{ flex: 1, padding: "12px", backgroundColor: "#16a34a", color: "white", borderRadius: "8px", fontWeight: "bold", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }} href="#"><span>📞</span> اتصال</a>
            </div>
            <button style={{ width: "100%", padding: "12px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
              <span>🧭</span> الانتقال إلى موقع الزبون (Google Maps)
            </button>
            <button style={{ width: "100%", padding: "14px", backgroundColor: "#FF8C00", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px" }}>
              تأكيد الوصول للزبون
            </button>
          </div>
        </div>

        {/* 3. Active Trip - Stage 2 */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ background: "#7c3aed", color: "white", padding: "12px 16px", fontWeight: "bold", fontSize: "14px" }}>🚀 3. رحلة نشطة - Stage 2 (جاري التوصيل)</div>
          <div style={{ padding: "16px" }}>
            <div style={{ backgroundColor: "#e5e7eb", height: "160px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "40px" }}>🗺️</span>
            </div>
            <p style={{ fontSize: "14px", fontWeight: "bold", color: "#7c3aed", marginBottom: "12px" }}>جاري التوصيل</p>
            <button style={{ width: "100%", padding: "12px", backgroundColor: "#1e40af", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
              <span>🧭</span> الانتقال إلى وجهة التوصيل (Google Maps)
            </button>
            <button style={{ width: "100%", padding: "14px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px" }}>
              إنهاء الرحلة
            </button>
          </div>
        </div>

        {/* 4. In-App Chat */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ background: "#FF8C00", color: "white", padding: "12px 16px", fontWeight: "bold", fontSize: "14px" }}>💬 4. المحادثة</div>
          <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "8px" }}>
              <div style={{ maxWidth: "70%", padding: "8px 16px", borderRadius: "12px", backgroundColor: "#F0F2F5", color: "#1a1a1a" }}>
                <p style={{ fontSize: "14px" }}>مرحباً، كم المسافة المتبقية؟</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
              <div style={{ maxWidth: "70%", padding: "8px 16px", borderRadius: "12px", backgroundColor: "#FF8C00", color: "white" }}>
                <p style={{ fontSize: "14px" }}>5 دقائق فقط ✓</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "8px" }}>
              <div style={{ maxWidth: "70%", padding: "8px 16px", borderRadius: "12px", backgroundColor: "#F0F2F5", color: "#1a1a1a" }}>
                <p style={{ fontSize: "14px" }}>تمام، في الانتظار</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <input placeholder="اكتب رسالة..." style={{ flex: 1, padding: "10px 16px", border: "1px solid #e0e0e0", borderRadius: "8px" }} />
              <button style={{ backgroundColor: "#FF8C00", color: "white", padding: "0 20px", border: "none", borderRadius: "8px", fontWeight: "bold" }}>
                <span>📤</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5. Cargo Image Preview Modal */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ background: "#000", color: "white", padding: "12px 16px", fontWeight: "bold", fontSize: "14px" }}>🖼️ 5. معاينة صورة البضائع</div>
          <div style={{ padding: "16px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", gap: "8px", marginBottom: "12px" }}>
              <img src="/uploads/test-cargo.jpg" alt="Cargo" style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover", cursor: "pointer", border: "1px solid #e5e7eb" }} />
              <img src="/uploads/test-cargo.jpg" alt="Cargo" style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover", cursor: "pointer", border: "1px solid #e5e7eb" }} />
            </div>
            <div style={{ backgroundColor: "rgba(0,0,0,0.9)", borderRadius: "16px", padding: "40px 20px", position: "relative", marginTop: "8px" }}>
              <button style={{ position: "absolute", top: "12px", right: "12px", width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "white", fontSize: "18px", cursor: "pointer" }}>✕</button>
              <img src="/uploads/test-cargo.jpg" alt="Preview" style={{ maxWidth: "80%", maxHeight: "200px", borderRadius: "8px", objectFit: "contain" }} />
            </div>
          </div>
        </div>

        {/* 6. Wallet */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ background: "#FF8C00", color: "white", padding: "12px 16px", fontWeight: "bold", fontSize: "14px" }}>💰 6. المحفظة</div>
          <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
              {["اليوم", "هذا الأسبوع", "هذا الشهر", "الكل"].map((f, i) => (
                <span key={i} style={{ padding: "6px 14px", borderRadius: "9999px", fontSize: "12px", fontWeight: "bold", border: i === 0 ? "2px solid #FF8C00" : "1px solid #d1d5db", backgroundColor: i === 0 ? "#FFF7ED" : "white", color: i === 0 ? "#FF8C00" : "#6b7280" }}>{f}</span>
              ))}
            </div>
            <div style={{ backgroundColor: "#FF8C00", color: "white", borderRadius: "16px", padding: "24px", textAlign: "center", marginBottom: "16px" }}>
              <p style={{ fontSize: "14px", marginBottom: "8px" }}>الرصيد الحالي</p>
              <p style={{ fontSize: "36px", fontWeight: "800" }}>148.00 <span style={{ fontSize: "20px" }}>LYD</span></p>
              <p style={{ fontSize: "12px", marginTop: "4px" }}>إجمالي الأرباح</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>عدد الرحلات</p>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: "#212121" }}>12</p>
              </div>
              <div style={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>أرباح الرحلات</p>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: "#212121" }}>148.00 <span style={{ fontSize: "14px", color: "#6b7280" }}>LYD</span></p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
