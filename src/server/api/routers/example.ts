import { z } from "zod";
import { helloAction } from "~/pages/api/actions/say-hello";
import { runAction } from "~/server/actions";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log("input:", input);
      const result = await runAction(helloAction, {
        name: input.text,
      });
      return result;
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
