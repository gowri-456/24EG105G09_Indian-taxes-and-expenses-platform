import { Link } from "react-router-dom";

const FOOTER_LINKS = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms of Use", path: "/terms" },
  { label: "Contact", path: "/contact" },
  { label: "Help", path: "/help" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="h-10 bg-white border-t border-gray-100 flex items-center justify-between px-5 shrink-0">
      <p className="text-[11px] text-gray-400">
        © {year} FinTrack India. All rights reserved.
      </p>

      <div className="flex items-center gap-4">
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.label}
            to={link.path}
            className="text-[11px] text-blue-500 hover:text-blue-700 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}