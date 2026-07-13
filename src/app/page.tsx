export default function HomePage() {
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
          <p className="text-base text-gray-500">اختر نوع الحساب للمتابعة</p>
        </div>

        <div className="w-full space-y-4">
          <a
            href="/register/customer"
            className="w-full flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-orange-400 transition-all active:scale-[0.98] no-underline text-gray-900"
          >
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-xl font-semibold mb-1">انضم كزبون</h2>
            <p className="text-sm text-gray-500">احصل على حلول نقل ذكية وشحن سريع</p>
            <span className="mt-4 text-orange-500 font-medium text-sm">ابدأ الآن ←</span>
          </a>

          <a
            href="/register/driver"
            className="w-full flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-orange-400 transition-all active:scale-[0.98] no-underline text-gray-900"
          >
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <span className="text-4xl">🚛</span>
            </div>
            <h2 className="text-xl font-semibold mb-1">انضم كسائق</h2>
            <p className="text-sm text-gray-500">كن شريكنا وحقق أرباحاً إضافية</p>
            <span className="mt-4 text-orange-500 font-medium text-sm">سجل الآن ←</span>
          </a>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          لديك حساب بالفعل؟{" "}
          <a href="/login" className="text-orange-500 font-bold hover:underline">
            تسجيل الدخول
          </a>
        </p>
      </main>
    </div>
  );
}
