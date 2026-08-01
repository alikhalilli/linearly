import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const lectures = (
    await getCollection("lectures", ({ data }) => data.status !== "planned")
  ).sort((a, b) => a.data.number - b.data.number);
  return rss({
    title: "linearly",
    description:
      "Linear algebra for people building AI, taught with pictures, plain words, and code.",
    site: context.site,
    items: lectures.map((lecture) => ({
      title: `Lecture ${lecture.data.number}: ${lecture.data.title}`,
      description: lecture.data.description,
      link: `/lectures/${lecture.id}`,
    })),
  });
}
