import {ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';

export interface ICommand {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | any;
    excute(interaction: ChatInputCommandInteraction): Promise<void>;
}