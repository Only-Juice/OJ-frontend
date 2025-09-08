import Navbar from "@/components/Navbar";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen max-h-screen">
      <Navbar />
      <main className="p-8 flex flex-1 max-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}
