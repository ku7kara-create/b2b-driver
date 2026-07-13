import "./globals.css";
import Providers from "@/components/providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#1A1A2E] min-h-screen flex justify-center items-center font-sans antialiased m-0 p-0">
        <div className="w-full max-w-md min-h-screen bg-[#F9F9F9] shadow-2xl overflow-y-auto flex flex-col relative text-gray-900">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
