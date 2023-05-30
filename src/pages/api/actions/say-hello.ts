/* eslint-disable @typescript-eslint/require-await */
import { z } from "zod";
import { createAction } from "../../../server/actions";

const { action: helloAction, handler } = createAction(
  "/api/actions/push-queue",
  "POST",
  z.object({
    name: z.string(),
  }),
  async (input) => {
    return {
      username: input.name,
      message: "Hello, " + input.name,
    };
  }
);

export default handler;

export { helloAction };
