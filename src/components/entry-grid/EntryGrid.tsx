import { Entry } from "@/lib/types";
import { planEntryLayout } from "@/lib/layout";
import YearDivider from "./YearDivider";
import FeatureEntry from "./FeatureEntry";
import MediaEntry from "./MediaEntry";
import StandardEntry from "./StandardEntry";
import CompactGroup from "./CompactGroup";

/**
 * The archive's primary browsing surface: a heterogeneous editorial grid
 * rather than a uniform card wall. Composition (which entries become
 * full-width features vs. image cards vs. text blocks vs. dense list
 * rows) is derived entirely from each entry's own data — see
 * src/lib/layout.ts — so it adapts automatically to any filtered subset
 * and needs no manual per-entry authoring.
 */
export default function EntryGrid({
  entries,
  showYearDividers = true,
}: {
  entries: Entry[];
  showYearDividers?: boolean;
}) {
  const rows = planEntryLayout(entries);

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8">
      {rows.map((row, index) => {
        if (row.kind === "divider") {
          return showYearDividers ? (
            <YearDivider key={`y-${row.year}`} year={row.year} count={row.count} />
          ) : null;
        }
        if (row.kind === "compact-group") {
          return (
            <CompactGroup key={`c-${row.items[0].entry.id}`} items={row.items} />
          );
        }
        const { item } = row;
        if (item.variant === "feature") {
          // Derived purely from this row's position among prior rows (no
          // mutable counter) so alternation stays correct regardless of
          // render order/count — feature rows are rare (~1 per year), so
          // this stays cheap in practice.
          const priorFeatures = rows
            .slice(0, index)
            .filter((r) => r.kind === "entry" && r.item.variant === "feature").length;
          const reverse = priorFeatures % 2 === 1;
          return <FeatureEntry key={item.entry.id} item={item} reverse={reverse} />;
        }
        if (item.variant === "media") {
          return <MediaEntry key={item.entry.id} item={item} />;
        }
        return <StandardEntry key={item.entry.id} item={item} />;
      })}
    </div>
  );
}
