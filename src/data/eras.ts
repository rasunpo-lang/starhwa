import { Era } from "@/lib/types";

export const eras: Era[] = [
  {
    id: "treasure",
    name: "TREASURE Era",
    years: "2018 – 2019",
    startDate: "2018-10-01",
    endDate: "2019-12-31",
    summary:
      "The debut chapter. Seonghwa steps forward as a founding member of ATEEZ, establishing his stage presence and vocal identity across the group's earliest title tracks, showcases, and early international promotions.",
  },
  {
    id: "zero-fever",
    name: "ZERO: FEVER Era",
    years: "2020 – 2022",
    startDate: "2020-01-01",
    endDate: "2022-06-30",
    summary:
      "A period of rapid international growth. Seonghwa's role expands across broadcast stages, variety appearances, and the group's first large-scale tours, alongside a growing presence in fashion and magazine editorials.",
  },
  {
    id: "the-world",
    name: "THE WORLD Era",
    years: "2022 – 2024",
    startDate: "2022-07-01",
    endDate: "2024-05-30",
    summary:
      "A more deliberate, cinematic phase of the group's discography. Seonghwa takes on a more visible presence across performances, interviews, and the group's expanding content, reflecting ATEEZ's growing international profile.",
  },
  {
    id: "golden-hour",
    name: "GOLDEN HOUR Era",
    years: "2024 – Present",
    startDate: "2024-05-31",
    endDate: null,
    summary:
      "The current chapter. Continued global touring, expanded solo visibility in fashion and media, and an evolving artistic voice — documented here as it unfolds.",
  },
];

export function getEra(id: string): Era | undefined {
  return eras.find((e) => e.id === id);
}
