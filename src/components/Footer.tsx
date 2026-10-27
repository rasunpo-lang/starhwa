import Link from "next/link";
import { navItems } from "./navData";
import BrandLockup from "./BrandLockup";
import AtmosphereNote from "./AtmosphereNote";
import CrewHourglass from "./CrewHourglass";

export default function Footer() {
  return (
    <footer className="footer-sky-glass border-t border-line/40 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <BrandLockup size="footer" />
            <p className="mt-3 max-w-sm text-sm text-charcoal/80">
              A fan archive of Park Seonghwa of ATEEZ, from the 2018 debut
              onward.
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow text-charcoal/85">Navigate</p>
            <ul className="mt-4 space-y-2 text-sm">
              {navItems.slice(0, 8).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-plum">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Project">
            <p className="eyebrow text-charcoal/85">Project</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/official" className="hover:text-plum">
                  Official Links
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-plum">
                  About This Archive
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-plum">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-plum">
                  Help the Encyclopedia <span aria-hidden="true">✦</span>
                </Link>
              </li>
            </ul>
            <CrewHourglass />
          </nav>
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <p className="max-w-3xl text-xs leading-relaxed text-charcoal/70">
            An unofficial fan project, not affiliated with Park Seonghwa,
            ATEEZ, KQ Entertainment, or any rights holders. Photography,
            video, and press materials belong to their owners.
          </p>
          <AtmosphereNote />
          <p className="meta mt-2 text-charcoal/75">
            © {new Date().getFullYear()} The Starhwa Encyclopedia — Fan
            Archive Project
          </p>
        </div>
      </div>
    </footer>
  );
}
