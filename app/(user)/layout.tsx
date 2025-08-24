import Navbar from "@/components/Navbar";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Navbar />
      <main className="pt-20 p-10 h-screen flex-col flex">{children}</main>
    </div>
  );
}
