import { defineField, defineType } from "sanity";

export const galleryItem = defineType({
  name: "galleryItem",
  title: "Gallery item",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kind",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "category", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "span",
      title: "Column span",
      type: "number",
      options: { list: [1, 2, 3] },
      initialValue: 1,
      validation: (rule) => rule.required().min(1).max(3),
    }),
    defineField({ name: "order", type: "number" }),
    defineField({ name: "width", type: "number" }),
    defineField({ name: "height", type: "number" }),
    defineField({ name: "image", type: "image", options: { hotspot: true } }),
    defineField({ name: "video", type: "file", options: { accept: "video/*" } }),
    defineField({ name: "poster", type: "image" }),
    defineField({
      name: "path",
      title: "Site path",
      type: "string",
      description: "Used when the file already lives on the site, for example /gallery/videos/cr7-last-dance.mp4.",
    }),
    defineField({
      name: "posterPath",
      title: "Poster path",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "image" },
  },
});
