import { makeSchema } from "nexus";
import { join } from "path";
import * as types from "./types";

export const schema = makeSchema({
  types,
  outputs: {
    typegen: join(process.cwd(), "graphql", "nexus-typegen", "index.d.ts"),
    schema: join(process.cwd(), "graphql", "schema.graphql"),
  },
  contextType: {
    export: "Context",
    module: join(process.cwd(), "graphql", "context.ts"),
  },
  sourceTypes: {
    modules: [
      {
        module: "@prisma/client",
        alias: "db",
        typeMatch: (name) => new RegExp(`(?:interface|type|class)\\s+(${name}s?)\\W`, "g"),
      },
    ],
    mapping: {
      Date: "Date",
      DateTime: "Date",
      UUID: "string",
    },
  },
  prettierConfig: join(process.cwd(), ".prettierrc"),
});
