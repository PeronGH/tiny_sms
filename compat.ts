import { Message } from "./schema.ts";

const COMPAT_MESSAGE_REGEX =
  /^From: (.+)\nTo: (.+)\nAt: (\d+\/\d+\/\d+ \d+:\d+)\n\n([\s\S]+)$/;

/** parse message of the following template:
 * ```
 * From: %pni%
 * To: %sn%
 * At: %Y/%M/%d %H:%m
 *
 * %mb%
 * ```
 */
export function parseCompatMessage(message: string): Message | null {
  const match = message.match(COMPAT_MESSAGE_REGEX);

  if (!match) return match;

  const [, from, to, at, body] = match;

  const timestamp = new Date(at).getTime();

  return {
    sender: from,
    recipient: to,
    timestamp,
    content: body,
  };
}

Deno.test("parseCompatMessage", () => {
  const message = `From: +8612345678901
To: +8612345678902
At: 2023/01/01 00:00

Hello,
world!
`;

  const parsed = parseCompatMessage(message);

  console.log(parsed);
});
