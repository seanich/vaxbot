import Discord from "discord.js";
import { padLeft } from "./utils";

export interface CommandHandler {
  (args: string[], message: Discord.Message): void;
}

export interface CommandDescriptor {
  handler: CommandHandler;
  description?: string;
}

export default class CommandRegistry {
  name: string = null;
  commands: {
    [command: string]: CommandDescriptor;
  } = {};

  constructor(name: string = "Command") {
    this.name = name;
    this.register("help", {
      handler: (args, message) => this.sendHelp(message.channel),
      description: "Print this help message.",
    });
  }

  register(command: string, descriptor: CommandDescriptor) {
    this.commands[command] = descriptor;
  }

  unregister(command: string) {
    delete this.commands[command];
  }

  handle(command: string, args: string[], message: Discord.Message) {
    const commandDesc = this.commands[command];
    if (!commandDesc) return this.defaultHandler(args, message);
    commandDesc.handler(args, message);
  }

  sendHelp(
    channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel
  ) {
    const commandWidth =
      Math.max(...Object.keys(this.commands).map(key => key.length)) + 2;
    const embed = new Discord.MessageEmbed()
      .setTitle(`${this.name} commands`)
      .setColor("#0000FF");

    embed.setDescription(
      Object.entries(this.commands).reduce((ret, [command, desc]) => {
        ret += `\`${padLeft(command, commandWidth)}:\` ${desc.description}\n`;
        return ret;
      }, "")
    );
    channel.send(embed);
  }

  private defaultHandler(args: string[], message: Discord.Message) {
    message.reply("That command doesn't exist");
  }
}
