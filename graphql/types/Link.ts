import { Link as PrismaLink } from "@prisma/client";
import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
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
      async resolve(parent, _args, ctx) {
        return ctx.prisma.link
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

export const Edge = objectType({
  name: "Edge",
  definition(t) {
    t.string("cursor");
    t.field("node", {
      type: Link,
    });
  },
});

export const PageInfo = objectType({
  name: "PageInfo",
  definition(t) {
    t.string("endCursor");
    t.boolean("hasNextPage");
  },
});

export const Response = objectType({
  name: "Response",
  definition(t) {
    t.field("pageInfo", { type: PageInfo });
    t.list.field("edges", {
      type: Edge,
    });
  },
});

export const LinksQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("links", {
      type: "Response",
      args: {
        first: intArg(),
        after: stringArg(),
      },
      async resolve(_, args, ctx) {
        let queryResults: PrismaLink[] = null;

        if (args.after) {
          queryResults = await ctx.prisma.link.findMany({
            take: args.first,
            skip: 1,
            cursor: {
              id: args.after,
            },
          });
        } else {
          queryResults = await ctx.prisma.link.findMany({
            take: args.first,
          });
        }

        if (queryResults.length > 0) {
          const lastLinkInResults = queryResults[queryResults.length - 1];
          const lastElementId = lastLinkInResults.id;

          const nextPageCount = await ctx.prisma.link.count({
            take: args.first,
            cursor: {
              id: lastElementId,
            },
            orderBy: {
              id: "asc",
            },
          });

          return {
            pageInfo: {
              endCursor: lastElementId,
              hasNextPage: nextPageCount >= args.first,
            },
            edges: queryResults.map((link: PrismaLink) => ({
              cursor: link.id,
              node: link,
            })),
          };
        }
        //
        return {
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
          edges: [],
        };
      },
    });
  },
});

export const CreateLinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createLink", {
      type: Link,
      args: {
        title: nonNull(stringArg()),
        url: nonNull(stringArg()),
        imageUrl: nonNull(stringArg()),
        category: nonNull(stringArg()),
        description: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        if (!ctx.user) {
          throw new Error("You need to be logged in to perform an action");
        }

        const user = await ctx.prisma.user.findUnique({
          where: {
            email: ctx.user.email,
          },
        });

        if (user.role !== "ADMIN") {
          throw new Error("You do not have permission to perform action");
        }

        return ctx.prisma.link.create({
          data: { ...args },
        });
      },
    });
  },
});
