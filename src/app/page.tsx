import Link from "next/link";

export default function AccountSelectionPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <header className="w-full px-4 h-16 flex items-center bg-white border-b border-gray-200">
        <span className="text-xl font-bold text-gray-900">B2B Driver</span>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="mb-8 text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
            <span className="text-4xl">🚚</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">أهلاً بك في B2B Driver</h1>
          <p className="text-base text-gray-500">اختر نوع الحساب للمتابعة في رحلتك اللوجستية</p>
        </div>

        <div className="w-full space-y-4">
          <Link
            href="/register/customer"
            className="w-full flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-orange-400 transition-all active:scale-[0.98] block"
          >
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">انضم كزبون</h2>
            <p className="text-sm text-gray-500">احصل على حلول نقل ذكية وشحن سريع لبضائعك</p>
            <span className="mt-4 text-orange-500 font-medium text-sm">ابدأ الآن ←</span>
          </Link>

          <Link
            href="/register/driver"
            className="w-full flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-orange-400 transition-all active:scale-[0.98] block"
          >
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <span className="text-4xl">🚛</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">انضم كسائق</h2>
            <p className="text-sm text-gray-500">كن شريكنا في النجاح وحقق أرباحاً إضافية مع أسطولنا</p>
            <span className="mt-4 text-orange-500 font-medium text-sm">سجل الآن ←</span>
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-orange-500 font-bold hover:underline">
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
