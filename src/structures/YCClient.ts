import {Client, Collection, GatewayIntentBits} from 'discord.js';
import { ICommand } from '../interfaces/Command';
import { IEvent } from '../interfaces/Event';
import * as fs from 'fs';
import * as path from 'path';

export class YCClient extends Client {
    public commands: Collection<string, ICommand> = new Collection();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers
            ]
        });
    }

    public async loadCommands() {
        const foldersPath = path.join(__dirname, '../commands');
        const commandFolders = fs.readdirSync(foldersPath);

        for(const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

            for(const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command: ICommand = (await import(filePath)).default;

                if('data' in command && 'execute' in command) {
                    this.commands.set(command.data.name, command);
                }
            }
        }
        
        console.log(`Successfully loaded ${this.commands.size} commands.`);
    }

    public async loadEvents() {
        const eventsPath = path.join(__dirname, '../events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

        for(const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event: IEvent = (await import(filePath)).default;

            if (event.once) {
                // Đăng ký sự kiện chạy 1 lần
                this.once(event.name, (...args) => event.execute(...args));
            } else {
                // Đăng ký sự kiện chạy nhiều lần
                this.on(event.name, (...args) => event.execute(...args));
            }
        }
        console.log(`Successfully loaded ${eventFiles.length} events.`);
    }

    public start(token: string) {
        this.login(token);
    }
}