// next.js
import Link from "next/link";

type Props = {
  links: { title: string; href: string }[];
};

export default function Breadcrumbs({ links }: Props) {
  return (
    <div className="breadcrumbs text-sm pb-7">
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            {link.title == "undefined" ? (
              "Loading..."
            ) : (
              <Link href={link.href}>{link.title}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
