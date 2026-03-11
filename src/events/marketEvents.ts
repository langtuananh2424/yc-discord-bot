import { Interaction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel, ChannelType, ThreadAutoArchiveDuration, PermissionFlagsBits } from 'discord.js';
import { IEvent } from '../interfaces/Event';
import { prisma } from '../utils/database';
import { schematicCache } from '../utils/tempCache';
import { getGuildConfig } from '../utils/guildConfigHelper';

const MarketEvents: IEvent = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction: Interaction) {
        
        // ==========================================
        // 1. KHI NGƯỜI BÁN NỘP FORM ĐĂNG BÀI
        // ==========================================
        if (interaction.isModalSubmit() && interaction.customId === 'modal_schematic_sell') {
            await interaction.deferReply({ ephemeral: true });

            const serverConfig = getGuildConfig(interaction.guildId!);

            if (!serverConfig.schematicMarketChannelId || !serverConfig.schematicStorageChannelId) {
                await interaction.editReply('❌ Admin chưa setup kênh Chợ và Kho Schematic! Vui lòng dùng lệnh `/setup-market` trước.');
                return;
            }

            const desc = interaction.fields.getTextInputValue('desc');
            const price = parseFloat(interaction.fields.getTextInputValue('price'));

            if (isNaN(price) || price <= 0) { await interaction.editReply('❌ Giá bán phải lớn hơn 0!'); return; }

            const cacheData = schematicCache.get(interaction.user.id);
            if (!cacheData) { await interaction.editReply('❌ Mất dữ liệu File! Vui lòng gõ lại lệnh `/post-schematic`.'); return; }

            // BACKUP FILE SANG KÊNH BÍ MẬT
            const storageChannel = await interaction.client.channels.fetch(serverConfig.schematicStorageChannelId) as TextChannel;
            
            const filesToUpload = [
                { attachment: cacheData.fileUrl, name: cacheData.fileName },
                ...cacheData.images.map((img: any) => ({ attachment: img.url, name: img.name }))
            ];

            const backupMessage = await storageChannel.send({
                content: `📦 Backup File từ <@${interaction.user.id}> - ${cacheData.title}`,
                files: filesToUpload
            });

            const permanentFileUrl = backupMessage.attachments.find(a => a.name === cacheData.fileName)?.url || cacheData.fileUrl;
            const permanentImageUrls = backupMessage.attachments.filter(a => a.name !== cacheData.fileName).map(a => a.url);

            // LƯU VÀO DATABASE (Đã xóa expiresAt)
            const newListing = await prisma.schematicItem.create({
                data: {
                    sellerId: interaction.user.id,
                    title: cacheData.title,
                    description: desc,
                    price: price,
                    fileUrl: permanentFileUrl,
                    imageUrls: JSON.stringify(permanentImageUrls)
                }
            });

            schematicCache.delete(interaction.user.id);

            // ĐĂNG BÀI LÊN CHỢ
            const marketChannel = await interaction.client.channels.fetch(serverConfig.schematicMarketChannelId);
            
            const embed = new EmbedBuilder()
                .setTitle(`🛒 ${cacheData.title}`)
                .setDescription(`**Mô tả:** ${desc}\n\n**💵 Giá bán:** \`${price}\` YC Coin\n**👤 Người bán:** <@${interaction.user.id}>`)
                .setColor(0x3498DB)
                .setImage(permanentImageUrls[0] || null)
                .setFooter({ text: `Mã ID: ${newListing.id}` }); // Giữ lại Footer chứa ID để sau dùng lệnh xóa

            const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId(`buy_schem_${newListing.id}`).setLabel(`Mua ngay (${price} YC)`).setStyle(ButtonStyle.Success).setEmoji('🛒'),
                new ButtonBuilder().setCustomId(`del_schem_${newListing.id}`).setLabel('Xóa bài').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
            );

            if (marketChannel?.type === ChannelType.GuildText) {
                await marketChannel.send({ embeds: [embed], components: [buttons] });
            } else if (marketChannel?.type === ChannelType.GuildForum) {
                await (marketChannel as any).threads.create({
                    name: `🛒 ${cacheData.title}`,
                    autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays, // Thread sẽ tự ẩn sau 3 ngày nếu không ai chat, nhưng bài viết trong Database vẫn sống mãi mãi.
                    message: { embeds: [embed], components: [buttons] }
                });
            }

            await interaction.editReply(`✅ Đăng bài thành công lên Chợ! Bài viết của bạn sẽ tồn tại vĩnh viễn (Miễn phí hoàn toàn).`);
            return;
        }

        // ==========================================
        // 2. KHI NGƯỜI MUA BẤM NÚT "MUA NGAY"
        // ==========================================
        if (interaction.isButton() && interaction.customId.startsWith('buy_schem_')) {
            await interaction.deferReply({ ephemeral: true });

            const listingId = interaction.customId.replace('buy_schem_', '');
            const listing = await prisma.schematicItem.findUnique({ where: { id: listingId } });

            // Đã xóa check Hết hạn ở đây
            if (!listing) { await interaction.editReply('❌ Bài viết không tồn tại hoặc đã bị gỡ!'); return; }
            if (listing.sellerId === interaction.user.id) { await interaction.editReply('❌ Bạn không thể tự mua đồ của chính mình!'); return; }

            let buyerDb = await prisma.user.findUnique({ where: { id: interaction.user.id } });
            if (!buyerDb || buyerDb.coins < listing.price) {
                await interaction.editReply(`❌ Tài khoản của bạn không đủ tiền! (Cần ${listing.price} YC)`); return;
            }

            await prisma.user.update({ where: { id: interaction.user.id }, data: { coins: { decrement: listing.price } } });
            await prisma.user.update({ where: { id: listing.sellerId }, data: { coins: { increment: listing.price } } });

            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle(`📦 Giao hàng: ${listing.title}`)
                    .setDescription(`Cảm ơn bạn đã mua hàng! Dưới đây là link tải Schematic của bạn:\n\n📥 **[TẢI XUỐNG SCHEMATIC BẤM VÀO ĐÂY](${listing.fileUrl})**`)
                    .setColor(0x2ECC71);

                await interaction.user.send({ embeds: [dmEmbed] });
                await interaction.editReply('✅ Mua thành công! File đã được gửi vào Tin nhắn riêng (DM) của bạn.');
            } catch (error) {
                await interaction.editReply(`✅ Mua thành công! Nhưng bạn đang CHẶN tin nhắn riêng. Tải file tại đây: [Tải File](${listing.fileUrl})`);
            }
            return;
        }

        // ==========================================
        // 3. KHI NGƯỜI DÙNG BẤM NÚT "XÓA BÀI"
        // ==========================================
        if (interaction.isButton() && interaction.customId.startsWith('del_schem_')) {
            const listingId = interaction.customId.replace('del_schem_', '');
            const listing = await prisma.schematicItem.findUnique({ where: { id: listingId } });

            if (!listing) {
                await interaction.reply({ content: '❌ Bài viết này đã bị xóa rồi!', ephemeral: true });
                if (interaction.channel?.isThread()) await interaction.channel.delete().catch(() => {});
                else await interaction.message?.delete().catch(() => {});
                return;
            }

            const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
            if (listing.sellerId !== interaction.user.id && !isAdmin) {
                await interaction.reply({ content: '❌ Bạn không có quyền xóa bài của người khác!', ephemeral: true });
                return;
            }

            await interaction.deferReply({ ephemeral: true });

            await prisma.schematicItem.delete({ where: { id: listingId } }).catch(() => {});

            if (interaction.channel?.isThread()) {
                await interaction.editReply('✅ Đã xóa bài viết thành công!');
                await interaction.channel.delete().catch(() => {}); 
            } else if (interaction.message) {
                await interaction.message.delete().catch(() => {}); 
                await interaction.editReply('✅ Đã xóa bài viết thành công!');
            }
            return;
        }
    }
};

export default MarketEvents;