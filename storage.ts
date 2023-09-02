import type { ExtendedMessage, Message } from "./schema.ts";

const kv = await Deno.openKv();

export async function addMessage(message: Message): Promise<ExtendedMessage> {
  const timestamp = message.timestamp ?? Date.now();
  const uuid = crypto.randomUUID();
  const key = [
    "messages",
    timestamp,
    uuid,
  ];

  await kv.set(key, message);
  return {
    ...message,
    timestamp,
    uuid,
  };
}

export async function listMessages(): Promise<ExtendedMessage[]> {
  const messages: ExtendedMessage[] = [];

  for await (const entry of kv.list<Message>({ prefix: ["messages"] })) {
    const [, timestamp, uuid] = entry.key;
    messages.push({
      ...entry.value,
      timestamp: timestamp as number,
      uuid: uuid as string,
    });
  }

  return messages;
}
