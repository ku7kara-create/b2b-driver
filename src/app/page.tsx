import Link from "next/link";

export default function AccountSelectionPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="w-full px-4 h-16 flex items-center justify-between bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">B2B Driver</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto w-full">
        <div className="mb-8 text-center">
          <img
            src="https://lh3.googleusercontent.com/aida/AP1WRLtYZ5jwWQMUVAxkDRRChuMLOCDeF-xwRUFTgHgyUYObUK4PgIL4_6QXO5Msj_jG18X26Mh_VaXtmRmQsRfttJBd9MfBjyLH51tp11939CH2u9ekTG3yJvvcOstol1OREqMvUHj_DMVubJj6J-pQ2BFe007NItoZOeh8oH5nA-FBT0NDGXFQpCxXe5jVLvT6RBpjLpd932S3HoWVqlNpB8Ae2hi1dYXxSdc73xi58PSIc2LHOQfRMfBz4_hL"
            alt="B2B Driver Logo"
            className="w-24 h-24 mx-auto mb-4 rounded-xl object-contain bg-white p-2 border border-outline-variant shadow-sm"
          />
          <h1 className="text-2xl font-semibold text-primary mb-2">
            أهلاً بك في B2B Driver
          </h1>
          <p className="text-base text-on-surface-variant">
            اختر نوع الحساب للمتابعة في رحلتك اللوجستية
          </p>
        </div>

        <div className="w-full space-y-4">
          <Link
            href="/register/customer"
            className="group w-full flex flex-col items-center p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:border-secondary-container transition-all duration-300 active:scale-[0.98] block"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:bg-secondary-container/10 transition-colors">
              <span className="material-symbols-outlined text-4xl text-primary group-hover:text-secondary-container transition-colors">
                person
              </span>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-primary mb-1">انضم كزبون</h2>
              <p className="text-sm text-on-surface-variant">
                احصل على حلول نقل ذكية وشحن سريع لبضائعك
              </p>
            </div>
            <div className="mt-4 flex items-center text-secondary font-medium text-sm">
              ابدأ الآن
              <span className="material-symbols-outlined mr-1 text-sm">chevron_left</span>
            </div>
          </Link>

          <Link
            href="/register/driver"
            className="group w-full flex flex-col items-center p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:border-secondary-container transition-all duration-300 active:scale-[0.98] block"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:bg-secondary-container/10 transition-colors">
              <span className="material-symbols-outlined text-4xl text-primary group-hover:text-secondary-container transition-colors">
                local_shipping
              </span>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-primary mb-1">انضم كسائق</h2>
              <p className="text-sm text-on-surface-variant">
                كن شريكنا في النجاح وحقق أرباحاً إضافية مع أسطولنا
              </p>
            </div>
            <div className="mt-4 flex items-center text-secondary font-medium text-sm">
              سجل اهتمامك
              <span className="material-symbols-outlined mr-1 text-sm">chevron_left</span>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-secondary font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </main>

      <footer className="w-full py-3 px-4 text-center border-t border-outline-variant bg-surface-container-low">
        <p className="text-xs text-on-surface-variant">
          &copy; 2024 B2B Driver Logistics. جميع الحقوق محفوظة.
        </p>
      </footer>
    </div>
  );
}
