// next.js
import Link from "next/link";

// utils
import { truncateText } from "@/utils/stringUtils";

type Props = {
  links: { title: string; href: string }[];
};

export default function Breadcrumbs({ links }: Props) {
  return (
    <div className="breadcrumbs text-sm pb-7">
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{truncateText(link.title, 10)}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
