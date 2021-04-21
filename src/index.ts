import Discord, { Message } from "discord.js";
import dotenv from "dotenv";

import CommandRegistry from "./lib/CommandRegistry";

dotenv.config();

export const basePrefix = (process.env.BOT_PREFIX || ":vaxbot:").trim() + " ";

const client = new Discord.Client({
  fetchAllMembers: true,
});
const commandRegistry = new CommandRegistry("vaxbot");

const rootCommands = {
  ping: "ping",
};

function registerCommands(commands: Record<string, string>) {
  Object.entries(commands).forEach(([command, module]) =>
    commandRegistry.register(command, require(`./commands/${module}`).default)
  );
}

client.on("ready", () => {
  client.generateInvite({ permissions: ["SEND_MESSAGES"] }).then(inviteLink => {
    console.log(`Add me! Add me!\n${inviteLink}`);
  });
  console.log("Setting up commands...");
  registerCommands(rootCommands);
  client.user.setActivity(`${basePrefix}help`, { type: "PLAYING" });
  console.log("Ready to go.");
});

client.on("message", (message: Message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith(basePrefix)) {
    console.log(`${message.author.username}: ${message.content}`);
    const args = message.content.split(/\s+/).slice(1);

    if (args.length === 0) {
      commandRegistry.sendHelp(message.channel);
    } else {
      const [cmd, ...cmdArgs] = args;
      commandRegistry.handle(cmd.toLowerCase(), cmdArgs, message);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
