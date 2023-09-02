import "https://deno.land/std@0.201.0/dotenv/load.ts";
import { Hono } from "https://deno.land/x/hono@v3.5.6/mod.ts";
import { listMessages } from "./storage.ts";
import { messageSchema } from "./schema.ts";

const app = new Hono();

app.get("/messages", async (ctx) => ctx.json(await listMessages()));
app.post("/messages", async (ctx) => {
  const message = await ctx.req.json().then(messageSchema.safeParse);
  if (!message.success) return ctx.json(message.error, 400);

  return ctx.json(message.data);
});

Deno.serve(app.fetch);
