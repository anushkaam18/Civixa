import "./globals.css";
import Sidebar from "@/components/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Sidebar />

        <main className="pt-[70px] lg:ml-64 lg:pt-0">
          {children}
        </main>
      </body>
    </html>
  );
}