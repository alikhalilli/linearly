import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const lectures = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/lectures" }),
  schema: z.object({
    /** Position in the course. Decimals allowed (7.5-style interludes are history now, but stay flexible). */
    number: z.number(),
    title: z.string(),
    description: z.string(),
    part: z.enum([
      "Foundations",
      "Solving Ax = b",
      "Vector Spaces",
      "Orthogonality",
      "Determinants & Eigenvalues",
      "The Missing Third",
    ]),
    /** Folder name under /public/slides holding 1.webp … N.webp, if the lecture has a deck. */
    deck: z.string().optional(),
    /** Number of slides in the deck. */
    slides: z.number().int().positive().optional(),
    /** Slide to use as the lecture's thumbnail. Defaults to the cover. */
    thumb: z.number().int().positive().optional(),
    /** Matching MIT 18.06 lectures, human-readable (e.g. "18.06 L1–L2"). */
    mit1806: z.string().optional(),
    /** Matching Strang ILA 6th-ed sections (e.g. "§1.1–1.3"). */
    strang: z.string().optional(),
    status: z.enum(["ready", "draft", "planned"]).default("draft"),
  }),
});

export const collections = { lectures };
