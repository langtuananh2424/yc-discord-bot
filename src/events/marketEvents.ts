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
        // 1. KHI NGƯỜI DÙNG NỘP FORM CHIA SẺ
        // ==========================================
        if (interaction.isModalSubmit() && interaction.customId === 'modal_schematic_sell') {
            await interaction.deferReply({ ephemeral: true });

            const serverConfig = getGuildConfig(interaction.guildId!);

            if (!serverConfig.schematicMarketChannelId || !serverConfig.schematicStorageChannelId) {
                await interaction.editReply('❌ Admin chưa setup kênh Chợ và Kho Schematic! Vui lòng dùng lệnh `/setup-market` trước.');
                return;
            }

            // LẤY TITLE VÀ DESC TỪ FORM
            const title = interaction.fields.getTextInputValue('title');
            const desc = interaction.fields.getTextInputValue('desc');

            const cacheData = schematicCache.get(interaction.user.id);
            if (!cacheData) { 
                await interaction.editReply('❌ Mất dữ liệu File! Vui lòng gõ lại lệnh `/post-schematic`.'); 
                return; 
            }

            // BACKUP FILE SANG KÊNH BÍ MẬT ĐỂ LẤY LINK VĨNH VIỄN
            const storageChannel = await interaction.client.channels.fetch(serverConfig.schematicStorageChannelId) as TextChannel;
            
            const filesToUpload = [
                { attachment: cacheData.fileUrl, name: cacheData.fileName },
                ...cacheData.images.map((img: any) => ({ attachment: img.url, name: img.name }))
            ];

            const backupMessage = await storageChannel.send({
                content: `📦 Backup File từ <@${interaction.user.id}> - ${title}`,
                files: filesToUpload
            });

            const permanentFileUrl = backupMessage.attachments.find((a: any) => a.name === cacheData.fileName)?.url || cacheData.fileUrl;
            const permanentImageUrls = backupMessage.attachments.filter((a: any) => a.name !== cacheData.fileName).map((a: any) => a.url);

            // LƯU VÀO DATABASE ĐỂ QUẢN LÝ VIỆC XÓA BÀI SAU NÀY
            const newListing = await prisma.schematicItem.create({
                data: {
                    sellerId: interaction.user.id,
                    title: title,
                    description: desc,
                    fileUrl: permanentFileUrl,
                    imageUrls: JSON.stringify(permanentImageUrls)
                }
            });

            schematicCache.delete(interaction.user.id);

            // ĐĂNG BÀI LÊN KÊNH CHIA SẺ
            const marketChannel = await interaction.client.channels.fetch(serverConfig.schematicMarketChannelId);
            
            const embed = new EmbedBuilder()
                .setTitle(`🎁 ${title}`)
                .setDescription(`**Mô tả:** ${desc}\n\n**👤 Người chia sẻ:** <@${interaction.user.id}>`)
                .setColor(0x2ECC71)
                .setImage(permanentImageUrls[0] || null)
                .setFooter({ text: `Mã ID: ${newListing.id}` });

            // NÚT LINK TẢI TRỰC TIẾP VÀ NÚT XÓA BÀI
            const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setLabel(`Tải xuống miễn phí`).setStyle(ButtonStyle.Link).setURL(permanentFileUrl).setEmoji('📥'),
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
        // 2. KHI NGƯỜI DÙNG BẤM NÚT "XÓA BÀI"
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