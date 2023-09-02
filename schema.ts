import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";

export const messageSchema = z.object({
  sender: z.string(),
  recipient: z.string(),
  timestamp: z.number().optional(),
  content: z.string(),
});

export type Message = z.infer<typeof messageSchema>;

export type ExtendedMessage = Required<Message> & {
  uuid: string;
};
