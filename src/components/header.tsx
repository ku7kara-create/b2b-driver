import Link from "next/link";

interface HeaderProps {
  title: string;
  backHref?: string;
}

export function Header({ title, backHref = "/" }: HeaderProps) {
  return (
    <header className="w-full px-4 h-16 flex items-center justify-between bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0 z-50">
      <Link
        href={backHref}
        className="p-2 rounded-full hover:bg-surface-variant transition-colors"
      >
        <span className="material-symbols-outlined text-primary">arrow_forward</span>
      </Link>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-primary">B2B Driver</span>
      </div>
      <h1 className="text-xl font-semibold text-on-surface">{title}</h1>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="w-full py-3 px-4 text-center border-t border-outline-variant bg-surface-container-low mt-auto">
      <p className="text-xs text-on-surface-variant">
        &copy; 2024 B2B Driver Logistics. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}
