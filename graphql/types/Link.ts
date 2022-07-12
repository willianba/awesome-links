import { Link as LinkEntity } from "@prisma/client";
import { extendType, objectType } from "nexus";
import { Context } from "../context";
import { User } from "./User";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.string("id");
    t.string("title");
    t.string("url");
    t.string("description");
    t.string("imageUrl");
    t.string("category");
    t.list.field("users", {
      type: User,
      async resolve(parent: LinkEntity, _args, ctx) {
        return await ctx.prisma.link
          .findUnique({
            where: {
              id: parent.id,
            },
          })
          .users();
      },
    });
  },
});

export const LinksQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("links", {
      type: "Link",
      resolve(_parent, _args, ctx: Context) {
        return ctx.prisma.link.findMany();
      },
    });
  },
});
