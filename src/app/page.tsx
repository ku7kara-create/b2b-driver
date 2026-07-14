import Link from "next/link";

export default function AccountSelectionPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <header className="w-full px-4 h-16 flex items-center bg-white border-b border-gray-200 sticky top-0 z-50">
        <span className="text-xl font-bold text-[#091426]">B2B Driver</span>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="mb-8 text-center">
          <img
            src="https://lh3.googleusercontent.com/aida/AP1WRLtYZ5jwWQMUVAxkDRRChuMLOCDeF-xwRUFTgHgyUYObUK4PgIL4_6QXO5Msj_jG18X26Mh_VaXtmRmQsRfttJBd9MfBjyLH51tp11939CH2u9ekTG3yJvvcOstol1OREqMvUHj_DMVubJj6J-pQ2BFe007NItoZOeh8oH5nA-FBT0NDGXFQpCxXe5jVLvT6RBpjLpd932S3HoWVqlNpB8Ae2hi1dYXxSdc73xi58PSIc2LHOQfRMfBz4_hL"
            alt="B2B Driver"
            className="w-24 h-24 mx-auto mb-4 rounded-xl object-contain bg-white p-2 border border-gray-200 shadow-sm"
          />
          <h1 className="text-2xl font-bold text-[#091426] mb-2">أهلاً بك في B2B Driver</h1>
          <p className="text-base text-gray-500">اختر نوع الحساب للمتابعة في رحلتك اللوجستية</p>
        </div>

        <div className="w-full space-y-4">
          <Link
            href="/register/customer"
            className="group w-full flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#E05A2B] transition-all active:scale-[0.98] block no-underline"
          >
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-orange-50 transition-colors">
              <span className="material-symbols-outlined text-4xl text-[#091426] group-hover:text-[#E05A2B] transition-colors">person</span>
            </div>
            <h2 className="text-xl font-semibold text-[#091426] mb-1">انضم كزبون</h2>
            <p className="text-sm text-gray-500">احصل على حلول نقل ذكية وشحن سريع لبضائعك</p>
            <span className="mt-4 flex items-center text-[#E05A2B] font-medium text-sm">
              ابدأ الآن
              <span className="material-symbols-outlined text-sm mr-1">chevron_left</span>
            </span>
          </Link>

          <Link
            href="/register/driver"
            className="group w-full flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#E05A2B] transition-all active:scale-[0.98] block no-underline"
          >
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-orange-50 transition-colors">
              <span className="material-symbols-outlined text-4xl text-[#091426] group-hover:text-[#E05A2B] transition-colors">local_shipping</span>
            </div>
            <h2 className="text-xl font-semibold text-[#091426] mb-1">انضم كسائق</h2>
            <p className="text-sm text-gray-500">كن شريكنا في النجاح وحقق أرباحاً إضافية مع أسطولنا</p>
            <span className="mt-4 flex items-center text-[#E05A2B] font-medium text-sm">
              سجل الآن
              <span className="material-symbols-outlined text-sm mr-1">chevron_left</span>
            </span>
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-[#E05A2B] font-bold hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </main>

      <footer className="w-full py-3 px-4 text-center border-t border-gray-200">
        <p className="text-xs text-gray-400">&copy; 2024 B2B Driver Logistics. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
