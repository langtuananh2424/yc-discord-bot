import { ButtonInteraction, TextChannel, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageFlags, ForumChannel } from 'discord.js';
import { getGuildConfig } from './guildConfigHelper';
import * as discordTranscripts from 'discord-html-transcripts';
import { OverwriteType } from 'discord.js';
import { prisma } from './database'; 

export const marketFileCache = new Map<string, any>();

// ==========================================
// 1. XỬ LÝ KHI NGƯỜI DÙNG NỘP FORM ĐĂNG BÀI
// ==========================================
export async function handleMarketPostModal(interaction: any) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    
    const config = getGuildConfig(interaction.guildId!);
    const cacheData = marketFileCache.get(interaction.user.id);
    
    if (!cacheData) return interaction.editReply('❌ Lỗi: Không tìm thấy file đính kèm. Hãy dùng lại lệnh `/yc-market-post`.');

    const desc = interaction.fields.getTextInputValue('desc');
    const rawPrice = interaction.fields.getTextInputValue('price');
    const bankName = interaction.fields.getTextInputValue('bank_name');
    const bankInfo = interaction.fields.getTextInputValue('bank_info');
    const bankOwner = interaction.fields.getTextInputValue('bank_owner');

    let formattedPrice = rawPrice;
    if (/^\d+$/.test(rawPrice)) formattedPrice = parseInt(rawPrice).toLocaleString('vi-VN') + ' VNĐ';
    else if (!rawPrice.toLowerCase().includes('vnđ') && !rawPrice.toLowerCase().includes('vnd')) formattedPrice += ' VNĐ';

    const postId = `YC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const archiveChannel = interaction.guild!.channels.cache.get(config.marketArchiveChannelId!) as TextChannel;
    const marketChannel = interaction.guild!.channels.cache.get(config.marketChannelId!);

    try {
        const member = interaction.guild!.members.cache.get(interaction.user.id);
        const sellerName = member?.displayName || interaction.user.username;

        const backupMsg = await archiveChannel.send({
            content: `📦 **[BACKUP SCHEMATIC - STK]**\n- Mã: **${postId}**\n- Tiêu đề: **${cacheData.title}**\n- Người bán: **${sellerName}** (<@${interaction.user.id}>)`,
            files: [cacheData.schematic]
        });

        const permanentFileUrl = backupMsg.attachments.first()?.url || '';

        await prisma.realMoneyMarketItem.create({
            data: {
                id: postId,
                sellerId: interaction.user.id,
                title: cacheData.title,
                price: formattedPrice,
                bankName: bankName,
                bankInfo: bankInfo,
                bankOwner: bankOwner,
                fileUrl: permanentFileUrl
            }
        });

        const extraImageUrls = [cacheData.image2, cacheData.image3, cacheData.image4].filter(img => img).map(img => img.url);

        const publicEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle(cacheData.title)
            .setDescription(desc)
            .addFields(
                { name: '💰 Giá Bán', value: `**${formattedPrice}**`, inline: true },
                { name: '👤 Người Đăng', value: `${interaction.user}`, inline: true }
            )
            .setImage(cacheData.image.url)
            .setFooter({ text: `Mã bài viết: ${postId} | YC Studio Marketplace` })
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`market_buy_${postId}_${interaction.user.id}`).setLabel('🛒 Mua Ngay').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`market_delpost_${postId}_${interaction.user.id}`).setLabel('🗑️ Xóa Bài').setStyle(ButtonStyle.Danger)
        );

        const messagePayload = { embeds: [publicEmbed], components: [row], files: extraImageUrls };

        if (marketChannel?.type === ChannelType.GuildForum) {
            await (marketChannel as ForumChannel).threads.create({ 
                // ĐÃ SỬA: Thêm (Mã postId) vào tiêu đề để Bot có thể tìm và xóa sau này
                name: `[BÁN] ${cacheData.title} (${postId})`, 
                message: messagePayload 
            });
        } else if (marketChannel?.type === ChannelType.GuildText) {
            await (marketChannel as TextChannel).send({ 
                content: `**[BÁN] ${cacheData.title} (${postId})**`, 
                ...messagePayload 
            });
        }

        marketFileCache.delete(interaction.user.id);
        await interaction.editReply(`✅ Đã đăng bán công trình thành công! Mã: **${postId}**.`);

    } catch (error) {
        console.error('Lỗi khi đăng modal market:', error);
        await interaction.editReply('❌ Lỗi xử lý bài đăng.');
    }
}

// ==========================================
// 2. XỬ LÝ KHI BẤM NÚT "MUA NGAY"
// ==========================================
export async function handleMarketBuy(interaction: ButtonInteraction, postId: string, sellerId: string) {
    if (interaction.user.id === sellerId) {
        return interaction.reply({ content: '❌ Bạn không thể tự mua công trình của chính mình!', flags: MessageFlags.Ephemeral });
    }

    const config = getGuildConfig(interaction.guildId!);
    const guild = interaction.guild!;
    const categoryId = config.marketCategoryId;
    const supervisorRoleId = config.marketSupervisorRoleId;

    if (!categoryId || !supervisorRoleId || !config.marketArchiveChannelId) {
        return interaction.reply({ content: '❌ Lỗi hệ thống: Admin chưa thiết lập đủ các kênh Market!', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
        const itemData = await prisma.realMoneyMarketItem.findUnique({ where: { id: postId } });
        if (!itemData) {
            return interaction.editReply('❌ Mặt hàng này không tồn tại trong hệ thống hoặc đã bị gỡ bỏ!');
        }

        const channel = await guild.channels.create({
            name: `gd-${postId.toLowerCase()}`,
            type: ChannelType.GuildText,
            parent: categoryId,
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: sellerId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: supervisorRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        const embed = new EmbedBuilder()
            .setTitle(`🤝 GIAO DỊCH TRUNG GIAN ESCROW: ${postId}`)
            .setColor(0x3498DB)
            .setDescription(`Chào mừng Khách hàng ${interaction.user} và Người bán <@${sellerId}>.\nTrade Mod <@&${supervisorRoleId}> sẽ làm trung gian giữ tiền cho giao dịch này.\n\n` +
            `💸 **KHÁCH HÀNG VUI LÒNG CHUYỂN KHOẢN CHO TRADE MOD:**\n` +
            `- **Ngân hàng:** \`${config.marketMmBankName}\`\n` +
            `- **STK:** \`${config.marketMmBankInfo}\`\n` +
            `- **Chủ TK:** \`${config.marketMmBankOwner}\`\n` +
            `- Nội dung CK: \`${config.marketMmTransferContent} ${postId}\`\n\n` +
            `🏦 **THÔNG TIN CỦA NGƯỜI BÁN (Để Trade Mod giải ngân sau):**\n` +
            `- Ngân hàng: \`${itemData.bankName}\` | STK: \`${itemData.bankInfo}\` | Chủ TK: \`${itemData.bankOwner}\`\n\n` +
            `⚠️ **QUY TRÌNH AN TOÀN:**\n` +
            `1. **Khách hàng** chuyển khoản cho Trade Mod và gửi Ảnh Bill (Biên lai) lên kênh này.\n` +
            `2. **Trade Mod** kiểm tra tiền vào tài khoản và bấm "Đã XN".\n` +
            `3. Cả 3 bên bấm Xác Nhận -> Hệ thống tự động giao File cho khách.\n` +
            `4. Trade Mod tiến hành giải ngân lại cho Người bán.`)
            .setFooter({ text: 'Giao dịch qua Bot để đảm bảo an toàn 100%!' });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`market_confirm_buyer_${postId}_${sellerId}_${interaction.user.id}`).setLabel('Khách: Chưa XN').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`market_confirm_seller_${postId}_${sellerId}_${interaction.user.id}`).setLabel('Người Bán: Chưa XN').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`market_confirm_admin_${postId}_${sellerId}_${interaction.user.id}`).setLabel('Giám Sát: Chưa XN').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ 
            content: `${interaction.user} <@${sellerId}> <@&${supervisorRoleId}>`,
            embeds: [embed], 
            components: [row] 
        });

        await interaction.editReply(`✅ Đã tạo phòng giao dịch an toàn tại ${channel}!`);

    } catch (error) {
        console.error(error);
        await interaction.editReply('❌ Có lỗi khi tạo kênh giao dịch.');
    }
}

// ==========================================
// 3. XỬ LÝ KHI BẤM 1 TRONG 3 NÚT XÁC NHẬN
// ==========================================
export async function handleMarketConfirm(interaction: ButtonInteraction) {
    const parts = interaction.customId.split('_');
    const roleType = parts[2]; 
    const postId = parts[3];
    const sellerId = parts[4];
    const buyerId = parts[5];

    const config = getGuildConfig(interaction.guildId!);

    if (roleType === 'buyer' && interaction.user.id !== buyerId) {
        return interaction.reply({ content: '❌ Chỉ NGƯỜI MUA mới được bấm nút này!', flags: MessageFlags.Ephemeral });
    }
    if (roleType === 'seller' && interaction.user.id !== sellerId) {
        return interaction.reply({ content: '❌ Chỉ NGƯỜI BÁN mới được bấm nút này!', flags: MessageFlags.Ephemeral });
    }
    if (roleType === 'admin') {
        const member = interaction.guild!.members.cache.get(interaction.user.id);
        if (!member?.roles.cache.has(config.marketSupervisorRoleId!) && !member?.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ Chỉ GIÁM SÁT VIÊN mới được bấm nút này!', flags: MessageFlags.Ephemeral });
        }
    }

    const message = interaction.message;
    const oldRow = message.components[0] as any;
    const isAlreadyDone = oldRow.components.every((comp: any) => comp.disabled === true);
    if (isAlreadyDone) {
        return interaction.reply({ content: '⚠️ Giao dịch này đã được xác nhận xong rồi!', flags: MessageFlags.Ephemeral });
    }

    const newButtons = oldRow.components.map((comp: any) => { 
        const btn = ButtonBuilder.from(comp);
        if (comp.customId === interaction.customId) {
            btn.setLabel(`${roleType === 'buyer' ? 'Khách' : roleType === 'seller' ? 'Người Bán' : 'Giám Sát'}: Đã XN ✅`);
            btn.setStyle(ButtonStyle.Success);
            btn.setDisabled(true); 
        }
        return btn;
    });

    const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(newButtons);
    await interaction.update({ components: [newRow] });

    // KHI CẢ 3 ĐÃ BẤM XÁC NHẬN ✅
    const isAllConfirmed = newButtons.every((btn: any) => btn.data.disabled === true);

    if (isAllConfirmed) {
        const channel = interaction.channel as TextChannel;
        await channel.send('🎉 **TẤT CẢ ĐÃ XÁC NHẬN! Hệ thống đang xuất kho công trình...**');

        const itemData = await prisma.realMoneyMarketItem.findUnique({ where: { id: postId } });
        
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('market_close').setLabel('Đóng Giao Dịch').setEmoji('🔒').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('market_transcript').setLabel('Lưu Giao Dịch').setEmoji('📑').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('market_delete').setLabel('Xóa Giao Dịch').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
        );

        if (itemData && itemData.fileUrl) {
            const schematicUrl = itemData.fileUrl;

            const deliveryEmbed = new EmbedBuilder()
                .setTitle('🎁 GIAO HÀNG THÀNH CÔNG')
                .setColor(0x2ECC71)
                .setDescription(`Cảm ơn bạn đã giao dịch tại YC Studio.\n\nTệp Schematic của bạn đã được đính kèm (hoặc [Tải trực tiếp tại đây](${schematicUrl})).\n\n**📖 Hướng dẫn sử dụng:**\n1. Tải file về máy.\n2. Bỏ vào thư mục \`plugins/WorldEdit/schematics\`.\n3. Vào game dùng lệnh \`//schem load <tên file>\` và \`//paste\`.\n\n*Giao dịch đã hoàn tất, ban quản trị có thể đóng kênh này.*`);

            await channel.send({ content: `<@${buyerId}> Đây là hàng của bạn!`, embeds: [deliveryEmbed], components: [actionRow], files: [schematicUrl] });

            try {
                const buyer = await interaction.client.users.fetch(buyerId);
                const dmEmbed = new EmbedBuilder()
                    .setTitle(`📦 Đơn hàng từ YC Studio: ${itemData.title}`)
                    .setDescription(`Cảm ơn bạn đã giao dịch thành công!\n\n📥 **[BẤM VÀO ĐÂY ĐỂ TẢI FILE SCHEMATIC](${schematicUrl})**`)
                    .setColor(0xF1C40F);
                await buyer.send({ embeds: [dmEmbed] });
            } catch (err) {
                await channel.send(`⚠️ Khách hàng đang tắt DM nên hệ thống không thể gửi file dự phòng vào tin nhắn riêng.`);
            }

            // Xóa dữ liệu Database
            await prisma.realMoneyMarketItem.delete({ where: { id: postId } }).catch(() => {});

        } else {
            await channel.send({ content: `⚠️ Lỗi: Không tìm thấy file Schematic trong kho. Giám sát viên vui lòng kiểm tra lại!`, components: [actionRow] });
        }

        // ĐÃ SỬA: Xóa bài đăng ở Kênh Chợ (Hỗ trợ cả Forum và Text channel)
        try {
            const marketChannel = interaction.guild!.channels.cache.get(config.marketChannelId!);
            if (marketChannel?.type === ChannelType.GuildForum) {
                const forum = marketChannel as ForumChannel;
                const threads = await forum.threads.fetchActive();
                // Vì lúc đăng bài ta đã thêm (Mã postId) vào tên, nên giờ chắc chắn tìm được
                const targetThread = threads.threads.find(t => t.name.includes(postId));
                if (targetThread) await targetThread.delete();
            } else if (marketChannel?.type === ChannelType.GuildText) {
                const textChannel = marketChannel as TextChannel;
                const msgs = await textChannel.messages.fetch({ limit: 100 });
                const targetMsg = msgs.find(m => m.content.includes(postId));
                if (targetMsg) await targetMsg.delete();
            }
        } catch (err) {
            console.error('Lỗi khi xóa post market:', err);
        }
    }
}

// ==========================================
// 4. XỬ LÝ NÚT XÓA BÀI ĐĂNG (MỚI THÊM)
// ==========================================
export async function handleMarketDeletePost(interaction: ButtonInteraction, postId: string, sellerId: string) {
    const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
    
    // Chỉ Người đăng bài hoặc Admin mới được phép xóa
    if (interaction.user.id !== sellerId && !isAdmin) {
        return interaction.reply({ content: '❌ Bạn không có quyền xóa bài đăng này!', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
        // 1. Xóa dữ liệu trong Database
        await prisma.realMoneyMarketItem.delete({ where: { id: postId } }).catch(() => {});

        // 2. Xóa Thread (Nếu là Forum) hoặc Xóa Message (Nếu là kênh Text)
        if (interaction.channel?.isThread()) {
            await interaction.editReply('✅ Đã xóa bài đăng!');
            await interaction.channel.delete();
        } else if (interaction.message) {
            await interaction.message.delete();
            await interaction.editReply('✅ Đã xóa bài đăng!');
        }
    } catch (err) {
        console.error('Lỗi khi xóa bài đăng thủ công:', err);
        await interaction.editReply('❌ Có lỗi xảy ra khi xóa bài.');
    }
}

// ==========================================
// 5. XỬ LÝ CÁC NÚT ĐÓNG, LƯU, XÓA TICKET
// ==========================================
export async function handleMarketTicketControls(interaction: ButtonInteraction) {
    const channel = interaction.channel as TextChannel;
    const config = getGuildConfig(interaction.guildId!);
    const customId = interaction.customId;

    const member = interaction.guild!.members.cache.get(interaction.user.id);
    if (!member?.roles.cache.has(config.marketSupervisorRoleId!) && !member?.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ Chỉ Giám Sát Viên mới được dùng các tính năng này!', flags: MessageFlags.Ephemeral });
    }

    try {
        if (customId === 'market_close') {
            await interaction.reply('🔒 Kênh đang được đóng... (Người mua và người bán sẽ không thể nhìn thấy kênh này nữa)');
            channel.permissionOverwrites.cache.forEach(async (overwrite) => {
                if (overwrite.type === OverwriteType.Member && overwrite.id !== interaction.client.user.id) {
                    await overwrite.delete();
                }
            });
            await channel.send('✅ Kênh đã đóng thành công. Bây giờ bạn có thể Lưu Lịch Sử hoặc Xóa kênh.');
        }

        if (customId === 'market_transcript') {
            await interaction.deferReply();
            if (!config.marketLogChannelId) return interaction.editReply('❌ Lỗi: Chưa setup Kênh lưu lịch sử HTML.');

            const logChannel = interaction.guild!.channels.cache.get(config.marketLogChannelId) as TextChannel;
            if (!logChannel) return interaction.editReply('❌ Không tìm thấy kênh lưu trữ!');

            const attachment = await discordTranscripts.createTranscript(channel, {
                limit: -1, filename: `${channel.name}-transcript.html`, saveImages: true, poweredBy: false
            });

            const embed = new EmbedBuilder()
                .setTitle('📑 LƯU TRỮ GIAO DỊCH')
                .setColor(0x2B2D31)
                .addFields(
                    { name: 'Kênh', value: `${channel.name}`, inline: true },
                    { name: 'Lưu bởi', value: `${interaction.user}`, inline: true }
                ).setTimestamp();

            await logChannel.send({ embeds: [embed], files: [attachment] });
            await interaction.editReply(`✅ Đã lưu lịch sử giao dịch sang kênh <#${logChannel.id}>!`);
        }

        if (customId === 'market_delete') {
            await interaction.reply('🗑️ Kênh sẽ bị xóa trong 5 giây nữa...');
            setTimeout(() => { channel.delete().catch(err => console.error(err)); }, 5000);
        }
    } catch (error) {
        console.error('Lỗi Market Control:', error);
        await interaction.reply({ content: '❌ Có lỗi xảy ra khi thực hiện hành động này.', flags: MessageFlags.Ephemeral });
    }
}