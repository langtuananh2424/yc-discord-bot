import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    TextChannel,
    ChannelType,
    AttachmentBuilder,
    MessageFlags
} from 'discord.js';
import { ICommand } from '../../interfaces/Command';
import { ASSETS } from '../../constants/assets'
const SetupVerifyCommand: ICommand = {
    data: new SlashCommandBuilder()
        .setName('yc-setup-verify')
        .setDescription('Thiết lập hệ thống nút bấm xác nhận luật server')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Kênh sẽ hiển thị nút bấm')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('Role sẽ cấp khi người dùng bấm xác nhận')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction: ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel('channel') as TextChannel;
        const role = interaction.options.getRole('role');
        
        const gif_file = new AttachmentBuilder(ASSETS.VERIFY_GIFS);

        const embed = new EmbedBuilder()
            .setTitle('📜 Xác nhận Luật Server')
            .setDescription('Chào mừng bạn đến với **YC Studio**!\n\nĐể đảm bảo một môi trường lành mạnh, vui lòng đọc kỹ các quy định của server. Nếu bạn đã hiểu và đồng ý, hãy nhấn nút **"✅ Đồng ý & Nhận Role"** bên dưới để mở khóa các kênh chat nhé!')
            .setColor(0x2ecc71)
            .setImage('attachment://welcome-gif-3.gif')
            .setFooter({ text: 'YC Studio System' });

        // Nhúng ID của Role vào customId: verify_role_123456789
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`verify_role_${role?.id}`)
                .setLabel('Đồng ý & Nhận Role')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success)
        );

        await channel.send({ embeds: [embed], components: [row], files: [gif_file] });
        await interaction.reply({ 
                    content: `✅ Đã thiết lập hệ thống xác nhận thành công tại ${channel}!`, 
                    flags: MessageFlags.Ephemeral 
                });    
        }
};

export default SetupVerifyCommand;