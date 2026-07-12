import "./globals.css";
import Providers from "@/components/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href="/tailwind.css" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-[#1A1A2E] flex items-center justify-center min-h-screen p-0 m-0">
        <div className="w-full max-w-md mx-auto min-h-screen bg-[#F9F9F9] shadow-2xl relative overflow-hidden font-arabic text-on-surface antialiased">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
