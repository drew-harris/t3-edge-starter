import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { type NextRequest } from "next/server";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

export const config = {
  runtime: "edge",
  regions: ["iad1"], // only execute this function on iad1
};

// // export API handler
// export default createNextApiHandler({
//   router: appRouter,
//   createContext: createTRPCContext,
//   onError:
//     env.NODE_ENV === "development"
//       ? ({ path, error }) => {
//           console.error(
//             `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
//           );
//         }
//       : undefined,
// });

export default async function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: async () => await createTRPCContext(req),
  });
}
