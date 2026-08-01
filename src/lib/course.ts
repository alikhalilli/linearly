/** The course's seven parts, shared by the lectures index and the lecture TOC. */
export const PARTS = [
  "Foundations",
  "Solving Ax = b",
  "Vector Spaces",
  "Orthogonality",
  "Determinants & Eigenvalues",
  "The Missing Third",
  "The Machine",
] as const;

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];

export const PART_COLORS = [
  "bg-part1",
  "bg-part2",
  "bg-part3",
  "bg-part4",
  "bg-part5",
  "bg-part6",
  "bg-part7",
];

/** 4 -> "04", 7.5 -> "7.5" */
export const numberLabel = (n: number) =>
  Number.isInteger(n) ? String(n).padStart(2, "0") : String(n);
