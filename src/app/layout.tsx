import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href="/tailwind.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Noto+Kufi+Arabic:wght@400;600;700&amp;family=Noto+Sans+Arabic:wght@300;400;500;600;700&amp;family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&amp;display=swap" />
      </head>
      <body className="bg-[#1A1A2E] min-h-screen flex justify-center items-center font-sans antialiased m-0 p-0">
        <div className="w-full max-w-md min-h-screen bg-[#F9F9F9] shadow-2xl flex flex-col relative text-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}
