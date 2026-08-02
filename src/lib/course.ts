/** The course's eight parts, shared by the lectures index and the lecture TOC. */
export const PARTS = [
  "Foundations",
  "Solving Ax = b",
  "Vector Spaces",
  "Orthogonality",
  "Determinants & Eigenvalues",
  "The Missing Third",
  "The Machine",
  "Adaptation",
] as const;

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export const PART_COLORS = [
  "bg-part1",
  "bg-part2",
  "bg-part3",
  "bg-part4",
  "bg-part5",
  "bg-part6",
  "bg-part7",
  "bg-part8",
];

/** 4 -> "04", 7.5 -> "7.5" */
export const numberLabel = (n: number) =>
  Number.isInteger(n) ? String(n).padStart(2, "0") : String(n);
