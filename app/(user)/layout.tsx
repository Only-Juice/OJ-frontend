import Navbar from "@/components/Navbar";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Navbar />
      <main className="pt-24 p-8 flex-col flex min-h-screen">{children}</main>
    </div>
  );
}
