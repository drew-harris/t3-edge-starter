import { TRPCError } from "@trpc/server";
import { type NextApiRequest, type NextApiResponse } from "next";
import { ZodError, type z, type ZodSchema } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Action<_R, _S> = {
  path: string;
  input: ZodSchema;
  method?: "GET" | "POST" | "PUT" | "DELETE";
};

export const createAction = <S extends ZodSchema, R extends object>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  input: S,
  handler: (input: z.infer<S>) => Promise<R>
): {
  action: Action<R, z.infer<S>>;
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | R>;
} => {
  return {
    action: {
      input,
      path,
      method,
    },
    handler: async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        // Parse input
        const parsedInput = input.parse(
          JSON.parse(req.body as string)
        ) as z.infer<S>;
        const result = await handler(parsedInput);
        return res.status(200).json(result);
      } catch (error) {
        console.log(error);
        if (error instanceof ZodError) {
          throw new TRPCError({
            message: "Validation error",
            code: "BAD_REQUEST",
          });
        }
      }
    },
  };
};

export const runAction = async <T, S>(action: Action<T, S>, input: S) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    `http://localhost:${process.env.PORT || 3000}`;

  try {
    const response = await fetch(baseUrl + action.path, {
      method: action.method ?? "GET",
      body: JSON.stringify(input),
    });

    if (response.ok) {
      return response.json() as T;
    } else {
      throw new TRPCError({
        message: "Could not run action",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  } catch (error) {
    console.error("Error running action", error);
    throw new TRPCError({
      message: "Could not run action",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
