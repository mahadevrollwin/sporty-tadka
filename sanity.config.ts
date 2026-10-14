import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: "SportyTadka",
  projectId,
  dataset,
  basePath: process.env.SANITY_BASE_PATH || "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Homepage")
              .id("homePage")
              .child(S.document().schemaType("homePage").documentId("homePage")),
            S.documentTypeListItem("post").title("Blog posts"),
            S.documentTypeListItem("galleryItem").title("Gallery"),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
});
