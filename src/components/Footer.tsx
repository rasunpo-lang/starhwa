import Link from "next/link";
import { navItems } from "./navData";
import Mark from "./Mark";
import AtmosphereNote from "./AtmosphereNote";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ivory">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Mark className="h-9 w-9 text-[15px]" />
              <p className="font-display text-2xl">The Starhwa Encyclopedia</p>
            </div>
            <p className="mt-3 max-w-sm text-sm text-charcoal/80">
              A living archive of Park Seonghwa of ATEEZ, documenting his
              journey from 2018 to the present.
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
          </nav>
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <p className="max-w-3xl text-xs leading-relaxed text-charcoal/70">
            This is an unofficial fan-created project. It is not affiliated
            with, endorsed by, or connected to Park Seonghwa, ATEEZ, KQ
            Entertainment, or any associated rights holders. Original
            photography, video, and press materials belong to their
            respective owners and are linked to, not reproduced. All written
            entries, descriptions, and database organization are original
            work by this archive&apos;s maintainers.
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
