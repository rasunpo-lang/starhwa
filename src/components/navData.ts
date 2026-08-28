export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Chronology", href: "/chronology" },
  { label: "Archive", href: "/archive" },
  { label: "Music", href: "/archive?category=Music" },
  { label: "Performances", href: "/archive?category=Performances" },
  { label: "Fashion", href: "/archive?category=Fashion" },
  { label: "Interviews", href: "/archive?category=Interviews" },
  { label: "Social", href: "/archive?category=Social+Media" },
  { label: "Official", href: "/official" },
  { label: "About", href: "/about" },
  { label: "Search", href: "/search" },
  { label: "Help the Encyclopedia", href: "/help" },
];
