import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ICommand } from '../../interfaces/Command';

const PingCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Kiểm tra độ trễ của YC Bot'),
    
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply(`Pong! Độ trễ là ${interaction.client.ws.ping}ms.`);
    }
};

export default PingCommand;