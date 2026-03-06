import { ButtonInteraction, GuildMember, MessageFlags } from 'discord.js';

/**
 * Xử lý khi người dùng nhấn nút nhận Role (Verify)
 * @param interaction Sự kiện nhấn nút
 * @param roleId ID của Role cần cấp
 */
export async function handleVerifyRole(interaction: ButtonInteraction, roleId: string) {
    // Ép kiểu interaction.member về GuildMember để có thể gọi hàm .roles.add()
    const member = interaction.member as GuildMember;

    if (!member) {
        await interaction.reply({ 
            content: '❌ Lỗi hệ thống: Không thể xác định thông tin của bạn.', 
            flags: MessageFlags.Ephemeral 
        });
        return;
    }

    try {
        // Kiểm tra xem người dùng đã có role này từ trước chưa
        if (member.roles.cache.has(roleId)) {
            await interaction.reply({ 
                content: '⚠️ Bạn đã xác nhận và có Role này từ trước rồi nhé!', 
                flags: MessageFlags.Ephemeral 
            });
            return;
        }

        // Thực hiện cấp Role
        await member.roles.add(roleId);
        
        // Trả lời ẩn (ephemeral) để chỉ người bấm mới nhìn thấy
        await interaction.reply({ 
            content: `🎉 Chúc mừng! Bạn đã nhận được role <@&${roleId}>. Chúc bạn có thời gian vui vẻ tại Server!`, 
            flags: MessageFlags.Ephemeral 
        });

    } catch (error) {
        console.error('Lỗi khi cấp role verify:', error);
        await interaction.reply({ 
            content: '❌ Bot không thể cấp Role. Vui lòng báo cho Admin (Lưu ý: Role của Bot phải được xếp cao hơn Role cần cấp trong Cài đặt Server).', 
            flags: MessageFlags.Ephemeral 
        });
    }
}