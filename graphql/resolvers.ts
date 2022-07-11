import { Context } from "./context";

export const resolvers = {
  Query: {
    links: (_parent, _args, ctx: Context) => {
      return ctx.prisma.link.findMany();
    },
  },
};
