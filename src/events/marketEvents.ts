import { Interaction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel, ChannelType, ThreadAutoArchiveDuration, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { IEvent } from '../interfaces/Event';
import { prisma } from '../utils/database';
import { schematicCache } from '../utils/tempCache';
import { getGuildConfig } from '../utils/guildConfigHelper';

// Hàm phụ trợ: Kiểm tra xem file có phải là hình ảnh không
const isImage = (name: string) => /\.(png|jpg|jpeg|gif|webp)$/i.test(name);

const MarketEvents: IEvent = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction: Interaction) {
        
        // ==========================================
        // 1. KHI NGƯỜI DÙNG NỘP FORM CHIA SẺ
        // ==========================================
        if (interaction.isModalSubmit() && interaction.customId === 'modal_schematic_sell') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const serverConfig = getGuildConfig(interaction.guildId!);

            if (!serverConfig.schematicMarketChannelId || !serverConfig.schematicStorageChannelId) {
                await interaction.editReply('❌ Admin chưa setup kênh Chợ và Kho Schematic! Vui lòng dùng lệnh `/setup-market` trước.');
                return;
            }

            const title = interaction.fields.getTextInputValue('title');
            const desc = interaction.fields.getTextInputValue('desc');

            const cacheData = schematicCache.get(interaction.user.id);
            if (!cacheData) { 
                await interaction.editReply('❌ Mất dữ liệu File! Vui lòng gõ lại lệnh `/post-schematic`.'); 
                return; 
            }

            const storageChannel = await interaction.client.channels.fetch(serverConfig.schematicStorageChannelId) as TextChannel;
            
            const filesToUpload = [
                { attachment: cacheData.fileUrl, name: cacheData.fileName },
                ...cacheData.images.map((img: any) => ({ attachment: img.url, name: img.name }))
            ];

            const backupMessage = await storageChannel.send({
                content: `📦 Backup File từ <@${interaction.user.id}> - ${title}`,
                files: filesToUpload
            });

            // THUẬT TOÁN MỚI: Phân loại chính xác Ảnh và File dựa vào đuôi mở rộng
            const permanentImageUrls = backupMessage.attachments.filter(a => isImage(a.name)).map(a => a.url);
            const permanentFileUrl = backupMessage.attachments.find(a => !isImage(a.name))?.url || cacheData.fileUrl;

            const newListing = await prisma.schematicItem.create({
                data: {
                    sellerId: interaction.user.id,
                    title: title,
                    description: desc,
                    fileUrl: permanentFileUrl,
                    imageUrls: JSON.stringify(permanentImageUrls),
                    backupMsgId: backupMessage.id
                }
            });

            schematicCache.delete(interaction.user.id);

            const marketChannel = await interaction.client.channels.fetch(serverConfig.schematicMarketChannelId);
            
            const embed = new EmbedBuilder()
                .setTitle(`🎁 ${title}`)
                .setDescription(`**Mô tả:** ${desc}\n\n**👤 Người chia sẻ:** <@${interaction.user.id}>`)
                .setColor(0x2ECC71)
                // Gán đúng link Ảnh vào đây
                .setImage(permanentImageUrls[0] || null)
                .setFooter({ text: `Mã ID: ${newListing.id}` });

            const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId(`dl_schem_${newListing.id}`).setLabel(`Tải xuống miễn phí`).setStyle(ButtonStyle.Primary).setEmoji('📥'),
                new ButtonBuilder().setCustomId(`del_schem_${newListing.id}`).setLabel('Xóa bài').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
            );

            if (marketChannel?.type === ChannelType.GuildText) {
                await (marketChannel as TextChannel).send({ embeds: [embed], components: [buttons] });
            } else if (marketChannel?.type === ChannelType.GuildForum) {
                await (marketChannel as any).threads.create({
                    name: `🎁 ${title}`,
                    autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
                    message: { embeds: [embed], components: [buttons] }
                });
            }

            await interaction.editReply(`✅ Chia sẻ thành công! File của bạn đã được đăng lên cộng đồng.`);
            return;
        }

        // ==========================================
        // 2. KHI NGƯỜI DÙNG BẤM NÚT "TẢI XUỐNG"
        // ==========================================
        if (interaction.isButton() && interaction.customId.startsWith('dl_schem_')) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            
            const listingId = interaction.customId.replace('dl_schem_', '');
            const listing = await prisma.schematicItem.findUnique({ where: { id: listingId } });

            if (!listing) {
                await interaction.editReply('❌ Bài viết không tồn tại hoặc đã bị xóa!');
                return;
            }

            if (!listing.backupMsgId) {
                await interaction.editReply(`❌ Bài viết này được đăng từ hệ thống cũ nên link đã quá hạn. Vui lòng nhờ <@${listing.sellerId}> đăng lại nhé!`);
                return;
            }

            try {
                const serverConfig = getGuildConfig(interaction.guildId!);
                const storageChannel = await interaction.client.channels.fetch(serverConfig.schematicStorageChannelId!) as TextChannel;
                
                const backupMsg = await storageChannel.messages.fetch(listing.backupMsgId);
                // Tìm đúng file không phải là ảnh để làm link tải
                const freshUrl = backupMsg.attachments.find(a => !isImage(a.name))?.url || listing.fileUrl;

                await interaction.editReply({
                    content: `✅ **Lấy file thành công!** Link tải của bạn đây (Link này sẽ tồn tại trong 24h):\n\n📥 **[BẤM VÀO ĐÂY ĐỂ TẢI XUỐNG](${freshUrl})**`
                });
            } catch (error) {
                console.error('Lỗi khi lấy file Schematic:', error);
                await interaction.editReply('❌ Đã có lỗi khi lấy file. Có thể file gốc trong kênh Kho đã bị xóa mất!');
            }
            return;
        }

        // ==========================================
        // 3. KHI NGƯỜI DÙNG BẤM NÚT "XÓA BÀI"
        // ==========================================
        if (interaction.isButton() && interaction.customId.startsWith('del_schem_')) {
            try {
                const listingId = interaction.customId.replace('del_schem_', '');
                const listing = await prisma.schematicItem.findUnique({ where: { id: listingId } });

                if (!listing) {
                    await interaction.reply({ content: '❌ Bài viết này đã bị xóa rồi!', flags: MessageFlags.Ephemeral });
                    // Dọn dẹp rác nếu có
                    if (interaction.channel?.isThread()) await interaction.channel.delete().catch(() => {});
                    else await interaction.message?.delete().catch(() => {});
                    return;
                }

                const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
                if (listing.sellerId !== interaction.user.id && !isAdmin) {
                    await interaction.reply({ content: '❌ Bạn không có quyền xóa bài của người khác!', flags: MessageFlags.Ephemeral });
                    return;
                }

                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                await prisma.schematicItem.delete({ where: { id: listingId } }).catch(() => {});

                if (interaction.channel?.isThread()) {
                    await interaction.editReply('✅ Đã xóa bài viết thành công!');
                    await interaction.channel.delete().catch(() => {}); 
                } else if (interaction.message) {
                    await interaction.message.delete().catch(() => {}); 
                    await interaction.editReply('✅ Đã xóa bài viết thành công!');
                }
            } catch (err) {
                console.error('Lỗi khi xóa bài:', err);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: '❌ Đã có lỗi xảy ra khi xóa bài!', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.editReply('❌ Đã có lỗi xảy ra khi xóa bài!');
                }
            }
            return;
        }
    }
};

export default MarketEvents;