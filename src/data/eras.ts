import { Era } from "@/lib/types";

export const eras: Era[] = [
  {
    id: "treasure",
    name: "TREASURE Era",
    years: "2018 – 2019",
    startDate: "2018-01-01",
    endDate: "2019-12-31",
    summary:
      "The debut showcase at Yes24 Live Hall on October 24, 2018 was Seonghwa's first stage as a member of ATEEZ, on the night TREASURE EP.1 came out. The TREASURE series ran through EP.2 and EP.3 in 2019 and closed with \"WONDERLAND\" in October.",
  },
  {
    id: "zero-fever",
    name: "ZERO: FEVER Era",
    years: "2020 – 2022",
    startDate: "2020-01-01",
    endDate: "2022-06-30",
    summary:
      "TREASURE EPILOGUE and \"Answer\" open 2020, and the three-part ZERO: FEVER series follows: Part.1 in July 2020, Part.2 and \"Fireworks (I'm The One)\" in March 2021, Part.3 and \"Deja Vu\" that September. THE FELLOWSHIP: BEGINNING OF THE END opens in Seoul in January 2022.",
  },
  {
    id: "the-world",
    name: "THE WORLD Era",
    years: "2022 – 2024",
    startDate: "2022-07-01",
    endDate: "2024-05-30",
    summary:
      "Three releases frame the era: \"Guerrilla\" in July 2022, \"BOUNCY\" in June 2023, and \"Crazy Form\" that December. On tour, THE FELLOWSHIP: BREAK THE WALL begins in Seoul in October 2022 and TOWARDS THE LIGHT: WILL TO POWER in late January 2024. In January 2024, Seonghwa and Hongjoong release \"MATZ,\" the group's first unit music video.",
  },
  {
    id: "golden-hour",
    name: "GOLDEN HOUR Era",
    years: "2024 – Present",
    startDate: "2024-05-31",
    endDate: null,
    summary:
      "GOLDEN HOUR: Part.1 and \"WORK\" open the era on May 31, 2024, and Parts 2 through 5 follow through June 2026. TOWARDS THE LIGHT reaches Europe in January 2025, IN YOUR FANTASY begins that July, and in January 2026 Seonghwa's \"Skin\" arrives as part of ATEEZ Present.",
  },
];

export function getEra(id: string): Era | undefined {
  return eras.find((e) => e.id === id);
}
