import 'dotenv/config';
import { YCClient } from './structures/YCClient';
import { Events, Interaction } from 'discord.js';

const client = new YCClient();

// Xử lý sự kiện khi nhận được Slash Command
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Có lỗi xảy ra khi thực thi lệnh!', ephemeral: true });
    }
});

// Khởi động bot
(async () => {
    await client.loadCommands();
    client.start(process.env.DISCORD_TOKEN!);
})();