import Link from "next/link";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const links = [
    { href: "/problem", label: "Problems" },
    { href: "/contest", label: "Contests" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/rank", label: "Rank" },
  ];

  return (
    <div className="drawer drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content p-10 flex">{children}</div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn btn-ghost text-xl justify-start"
            >
              {link.label}
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}
