import type { Metadata } from "next";
import HelpForm from "@/components/HelpForm";
import Glint from "@/components/Glint";

const description =
  "Spot something missing from The Starhwa Encyclopedia? Suggest a source, a correction, or new content — every suggestion helps make Seonghwa's archive more complete.";

export const metadata: Metadata = {
  title: "Contribute to the Archive",
  description,
  alternates: { canonical: "/help" },
  openGraph: {
    type: "website",
    url: "/help",
    title: "Contribute to the Archive — The Starhwa Encyclopedia",
    description,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contribute to the Archive — The Starhwa Encyclopedia",
    description,
  },
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="eyebrow text-plum">Contribute</p>
      <h1 className="mt-3 font-display text-4xl sm:text-6xl">
        Contribute to the Archive{" "}
        <span className="relative inline-block">
          <Glint className="glint-burst -right-2 -top-3" />
          <span aria-hidden="true">✦</span>
        </span>
      </h1>

      <div className="mt-10 space-y-6 text-base leading-relaxed text-charcoal/90">
        <p className="font-display text-2xl leading-snug text-ink sm:text-3xl">
          Did we miss a piece of the story?
        </p>
        <p>
          Maybe you found a link hiding in an old bookmark, spotted something
          we got wrong, or remembered a Seonghwa moment that hasn&apos;t
          found its place here yet.
        </p>
        <p>
          Leave it here. <span aria-hidden="true">💌</span> We&apos;ll look
          into it and see where it belongs.
        </p>
      </div>

      <div className="mt-12">
        <HelpForm />
      </div>
    </div>
  );
}
