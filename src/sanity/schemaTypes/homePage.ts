import { defineArrayMember, defineField, defineType } from "sanity";

const tone = [
  { title: "Lime", value: "lime" },
  { title: "Magenta", value: "mag" },
  { title: "Cyan", value: "cyan" },
  { title: "Yellow", value: "yellow" },
  { title: "Mixed", value: "mix" },
];

export const homePage = defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({ name: "heroEyebrow", title: "Hero eyebrow", type: "string" }),
    defineField({ name: "heroTitle", title: "Hero first line", type: "string" }),
    defineField({ name: "heroAccent", title: "Hero accent word", type: "string" }),
    defineField({ name: "heroEnding", title: "Hero last word", type: "string" }),
    defineField({ name: "heroLead", title: "Hero lead", type: "text", rows: 3 }),
    defineField({ name: "heroLeadBold", title: "Hero lead emphasis", type: "string" }),
    defineField({ name: "heroPrimary", title: "Primary button", type: "string" }),
    defineField({ name: "heroSecondary", title: "Secondary button", type: "string" }),
    defineField({ name: "aboutHeading", title: "About heading", type: "string" }),
    defineField({ name: "aboutHeadingAccent", title: "About heading accent", type: "string" }),
    defineField({ name: "aboutDek", title: "About dek", type: "string" }),
    defineField({
      name: "aboutBody",
      title: "About paragraphs",
      type: "array",
      of: [{ type: "block", styles: [{ title: "Normal", value: "normal" }], lists: [] }],
    }),
    defineField({
      name: "nav",
      type: "array",
      of: [
        defineArrayMember({
          name: "navLink",
          type: "object",
          fields: [
            defineField({ name: "href", type: "string" }),
            defineField({ name: "label", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({ name: "marquee", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "work",
      type: "array",
      of: [
        defineArrayMember({
          name: "workItem",
          type: "object",
          fields: [
            defineField({ name: "num", type: "string" }),
            defineField({ name: "cat", title: "Category", type: "string" }),
            defineField({ name: "title", type: "string" }),
            defineField({ name: "copy", type: "text", rows: 3 }),
            defineField({ name: "tone", type: "string", options: { list: tone } }),
          ],
          preview: { select: { title: "title", subtitle: "cat" } },
        }),
      ],
    }),
    defineField({
      name: "services",
      type: "array",
      of: [
        defineArrayMember({
          name: "serviceItem",
          type: "object",
          fields: [
            defineField({ name: "n", title: "Label", type: "string" }),
            defineField({ name: "title", type: "string" }),
            defineField({ name: "headlineLead", type: "string" }),
            defineField({ name: "headlineAccent", type: "string" }),
            defineField({ name: "copy", type: "text", rows: 3 }),
          ],
          preview: { select: { title: "title", subtitle: "n" } },
        }),
      ],
    }),
    defineField({
      name: "audiences",
      title: "Who we play for",
      type: "array",
      of: [
        defineArrayMember({
          name: "audience",
          type: "object",
          fields: [
            defineField({ name: "label", type: "string" }),
            defineField({ name: "tone", type: "string", options: { list: tone } }),
          ],
          preview: { select: { title: "label" } },
        }),
      ],
    }),
    defineField({
      name: "stats",
      type: "array",
      of: [
        defineArrayMember({
          name: "stat",
          type: "object",
          fields: [
            defineField({ name: "value", type: "string" }),
            defineField({ name: "label", type: "string" }),
            defineField({ name: "tone", type: "string", options: { list: tone } }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
    }),
    defineField({ name: "logos", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "phoneVideos",
      title: "About phone films",
      type: "array",
      of: [{ type: "reference", to: [{ type: "galleryItem" }] }],
      validation: (rule) => rule.max(5),
    }),
  ],
  preview: { prepare: () => ({ title: "Homepage" }) },
});
