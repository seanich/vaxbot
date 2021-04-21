import { GuildMember } from "discord.js";

import { basePrefix } from "..";
import { CommandHandler } from "../lib/CommandRegistry";

const description = `DM users with the specified postal codes in their server nickname. Example: \`${basePrefix}ping A1A,Z9R <message>\``;

const POSTAL_CODES_REGEX = /^[a-z][0-9][a-z](,[a-z][0-9][a-z])*$/i;

function parsePostalCodes(codes: string) {
  if (!POSTAL_CODES_REGEX.test(codes)) {
    throw new Error(`Invalid postal codes format: "${codes}"`);
  }

  return codes.split(",").map(code => code.toUpperCase());
}

const handler: CommandHandler = async (args, message) => {
  const [postalCodesArg = null] = args;

  if (!postalCodesArg) {
    message.reply("Postal codes are required.");
    return;
  }

  let postalCodes: string[];
  try {
    postalCodes = parsePostalCodes(postalCodesArg);
  } catch (e) {
    message.reply(`Error: ${e}`);
    return;
  }

  const messageStartIndex =
    message.content.indexOf(postalCodesArg) + postalCodesArg.length;
  const messageContent = message.content.slice(messageStartIndex).trim();

  if (!messageContent.length) {
    message.reply("You must include a message to send.");
    return;
  }

  console.log(
    `Filtering through ${message.guild.memberCount} guild members...`
  );
  // Go through all the guild's members and match them to postal code(s).
  // We can't do this search via the API since it only supports matching at the start of nicknames 🙃.
  const postalCodeMatchers = postalCodes.map(pc => ({
    postalCode: pc,
    matcher: new RegExp(`\\(${pc}\\)`, "i"),
  }));
  const membersToPing: { member: GuildMember; postalCodes: string[] }[] = [];
  const members = await message.guild.members.fetch({ force: true });
  members.forEach(member => {
    if (member.user.bot || !member.nickname) return;

    const codeMatches = postalCodeMatchers.filter(({ matcher }) =>
      matcher.test(member.nickname)
    );

    if (!codeMatches.length) return;

    membersToPing.push({
      member,
      postalCodes: codeMatches.map(({ postalCode }) => postalCode),
    });
  });

  console.log(`Sending DM to ${membersToPing.length} users.`);

  await Promise.all(
    membersToPing.map(async ({ member, postalCodes }) => {
      const dmChannel = await member.user.createDM();
      dmChannel.send(
        `**Vaccine update for ${postalCodes.join(", ")}:**\n${messageContent}`
      );
    })
  );
};

export default {
  description,
  handler,
};
