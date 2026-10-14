import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./src/sanity/env";

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: "sporty-tadka",
  deployment: {
    appId: "pmktdb8zjph3ev5uef4ykj33",
  },
});
