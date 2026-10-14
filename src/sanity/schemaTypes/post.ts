import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "excerpt", type: "text", rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: "publishedAt", type: "date", validation: (rule) => rule.required() }),
    defineField({ name: "category", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "readTime", type: "string", initialValue: "4 min" }),
    defineField({
      name: "tone",
      type: "string",
      options: {
        list: [
          { title: "Lime", value: "lime" },
          { title: "Magenta", value: "mag" },
          { title: "Cyan", value: "cyan" },
        ],
        layout: "radio",
      },
      initialValue: "lime",
    }),
    defineField({
      name: "player",
      title: "Player thumbnail",
      type: "reference",
      to: [{ type: "galleryItem" }],
    }),
    defineField({
      name: "body",
      type: "array",
      of: [{ type: "block", styles: [{ title: "Normal", value: "normal" }], lists: [] }],
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Newest",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "category" },
  },
});
