import {ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';

export interface ICommand {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | any;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}