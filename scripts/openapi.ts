import * as z from "zod/v4";

import { createDocument } from "zod-openapi";
import { writeFile } from "node:fs/promises";
import {
  createApiKeyResponseSchema,
  createApiKeySchema,
} from "@/app/api/v1/api-keys/schema";

const standardErrorSchema = z.object({
  error: z.string(),
});

const document = createDocument({
  openapi: "3.1.0",
  info: {
    title: "Starterkit open api docs",
    version: "1.0.0",
  },
  paths: {
    "/v1/api-keys/": {
      post: {
        requestBody: {
          content: {
            "application/json": { schema: createApiKeySchema },
          },
        },
        responses: {
          "200": {
            description: "200 OK",
            content: {
              "application/json": { schema: createApiKeyResponseSchema },
            },
          },
          "400": {
            description: "400 Bad Request",
            content: {
              "application/json": { schema: standardErrorSchema },
            },
          },
        },
      },
    },
  },
});

writeFile("public/openapi.v1.json", JSON.stringify(document, null, 2));
