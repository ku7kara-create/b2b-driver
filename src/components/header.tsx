import Link from "next/link";

interface HeaderProps {
  title: string;
  backHref?: string;
  onBackClick?: () => void;
  children?: React.ReactNode;
}

export function Header({ title, backHref, onBackClick, children }: HeaderProps) {
  return (
    <header style={{ backgroundColor: "#FF8C00", color: "white" }} className="w-full px-4 h-16 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {onBackClick ? (
          <button onClick={onBackClick} className="p-2 rounded-full hover:brightness-110 transition-all">
            <span className="material-symbols-outlined text-white">arrow_forward</span>
          </button>
        ) : backHref ? (
          <Link href={backHref} className="p-2 rounded-full hover:brightness-110 transition-all">
            <span className="material-symbols-outlined text-white">arrow_forward</span>
          </Link>
        ) : null}
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
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
