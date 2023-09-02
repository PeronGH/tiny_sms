import "https://deno.land/std@0.201.0/dotenv/load.ts";
import { Hono } from "https://deno.land/x/hono@v3.5.6/mod.ts";
import { addMessage, listMessages } from "./storage.ts";
import { messageSchema } from "./schema.ts";
import { parseCompatMessage } from "./compat.ts";

const ACCESS_KEY = Deno.env.get("ACCESS_KEY")!;
const BEARER_TOKEN_REGEX = /^Bearer (.+)$/;

const app = new Hono();

// middleware for auth
app.use("/messages", async (ctx, next) => {
  const token = ctx.req.header("Authorization")
    ?.match(BEARER_TOKEN_REGEX)
    ?.at(1);

  if (token !== ACCESS_KEY) return ctx.text("Incorrect token", 401);

  return await next();
});

// list messages as `ExtendedMessage[]`
app.get("/messages", async (ctx) => ctx.json(await listMessages()));

// add new message, post a `Message` and get an `ExtendedMessage`
app.post("/messages", async (ctx) => {
  const message = await ctx.req.json().then(messageSchema.safeParse);
  if (!message.success) return ctx.json(message.error, 400);
  return ctx.json(await addMessage(message.data));
});

// add new message, compatible with SMS Forwarder on Android
app.post("/compat/messages", async (ctx) => {
  const message = new URLSearchParams(await ctx.req.text()).get(ACCESS_KEY);
  if (message === null) return ctx.text("Incorrect access key", 401);

  const parsed = parseCompatMessage(message);
  if (!parsed) return ctx.text("Invalid message", 400);

  return ctx.json(await addMessage(parsed));
});

Deno.serve(app.fetch);
