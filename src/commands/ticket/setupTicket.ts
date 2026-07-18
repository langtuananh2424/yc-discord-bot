import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel, ChannelType} from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { saveGuildConfig } from '../../utils/guildConfigHelper';

const SetupTicketCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-setup-help-ticket')
        .setDescription('Thiết lập kênh đặt nút bấm tạo Ticket')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Kênh sẽ hiển thị nút bấm')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addChannelOption(option => 
            option.setName('category')
                .setDescription('Danh mục sẽ chứa các kênh Ticket mới')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('support-role')
                .setDescription('Role nhân viên hỗ trợ')
                .setRequired(true))
        .addChannelOption(option => 
            option.setName('ticket-log')
                .setDescription('Kênh ẩn dùng để lưu trữ file lịch sử Ticket')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels),

    async execute(interaction: ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel('channel') as TextChannel;
        const category = interaction.options.getChannel('category');
        const role = interaction.options.getRole('support-role');
        const logChannel = interaction.options.getChannel('ticket-log');
        const isSuccess = saveGuildConfig(interaction.guildId!, { ticketLogChannelId: logChannel?.id });
        
        const embed = new EmbedBuilder()
            .setTitle('🎫 Hệ Thống Hỗ Trợ YC')
            .setDescription('Nhấn vào nút bên dưới để tạo Ticket. Nhân viên của chúng tôi sẽ hỗ trợ bạn sớm nhất có thể!')
            .setColor(0x5865F2)
            .setFooter({ text: 'YC Community Support' });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`create_ticket_${category?.id}_${role?.id}_${logChannel?.id}`)
                .setLabel('Tạo Ticket')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Primary)
        );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ Đã thiết lập Ticket thành công!', ephemeral: true });
    }
};

export default SetupTicketCommand;