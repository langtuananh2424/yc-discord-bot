import { Events, Interaction } from 'discord.js';
import { IEvent } from '../interfaces/Event';
import { YCClient } from '../structures/YCClient';

const InteractionCreateEvent: IEvent = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const client = interaction.client as YCClient;
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'Đã có lỗi xảy ra khi thực hiện lệnh này!', 
                ephemeral: true 
            });
        }
    }
};

export default InteractionCreateEvent;