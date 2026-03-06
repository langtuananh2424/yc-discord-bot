import { ButtonInteraction, TextChannel, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageFlags, ForumChannel } from 'discord.js';
import { getGuildConfig } from './guildConfigHelper';
import * as discordTranscripts from 'discord-html-transcripts';
import { OverwriteType } from 'discord.js';

export const marketFileCache = new Map<string, any>();

// -HÀM XỬ LÝ KHI NGƯỜI DÙNG NỘP FORM ĐĂNG BÀI
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

        await archiveChannel.send({
            content: `📦 **[BACKUP SCHEMATIC]**\n- Mã: **${postId}**\n- Tiêu đề: **${cacheData.title}**\n- Người bán: **${sellerName}** (<@${interaction.user.id}>)\n- Ngân hàng: ${bankName}\n- STK: ${bankInfo}\n- Chủ TK: ${bankOwner}`,
            files: [cacheData.schematic]
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
            .setFooter({ text: 'YC Studio Marketplace' })
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`market_buy_${postId}_${interaction.user.id}`).setLabel('🛒 Mua Ngay').setStyle(ButtonStyle.Success)
        );

        const messagePayload = { embeds: [publicEmbed], components: [row], files: extraImageUrls };

        if (marketChannel?.type === ChannelType.GuildForum) {
            await (marketChannel as ForumChannel).threads.create({ 
                name: `[BÁN] ${cacheData.title} - Giá: ${formattedPrice}`, 
                message: messagePayload 
            });
        } else if (marketChannel?.type === ChannelType.GuildText) {
            await (marketChannel as TextChannel).send({ 
                content: `**[BÁN] ${cacheData.title} (${postId})**`, 
                ...messagePayload 
            });
        }

        // Xóa bộ nhớ tạm cho nhẹ máy
        marketFileCache.delete(interaction.user.id);
        await interaction.editReply(`✅ Đã đăng bán công trình thành công! Mã: **${postId}**.`);

    } catch (error) {
        console.error('Lỗi khi đăng modal market:', error);
        await interaction.editReply('❌ Lỗi xử lý bài đăng.');
    }
}

// HÀM XỬ LÝ KHI BẤM NÚT "MUA NGAY"
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
        // Tạo kênh giao dịch
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

        // Tìm thông tin Ngân hàng từ kênh Archive
        const archiveChannel = guild.channels.cache.get(config.marketArchiveChannelId) as TextChannel;
        let bankName = 'Không có', bankInfo = 'Không có', bankOwner = 'Không có';
        
        if (archiveChannel) {
            const msgs = await archiveChannel.messages.fetch({ limit: 100 });
            const backupMsg = msgs.find((m: any) => m.content.includes(`Mã: **${postId}**`));
            
            if (backupMsg) {
                const lines = backupMsg.content.split('\n');
                bankName = lines.find((l: string) => l.startsWith('- Ngân hàng:'))?.replace('- Ngân hàng:', '').trim() || 'Không có';
                bankInfo = lines.find((l: string) => l.startsWith('- STK:'))?.replace('- STK:', '').trim() || 'Không có';
                bankOwner = lines.find((l: string) => l.startsWith('- Chủ TK:'))?.replace('- Chủ TK:', '').trim() || 'Không có'; 
            }
        }

        // Tạo giao diện trong kênh Ticket
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
            `- Ngân hàng: \`${bankName}\` | STK: \`${bankInfo}\` | Chủ TK: \`${bankOwner}\`\n\n` +
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

// HÀM XỬ LÝ KHI BẤM 1 TRONG 3 NÚT XÁC NHẬN
export async function handleMarketConfirm(interaction: ButtonInteraction) {
    const parts = interaction.customId.split('_');
    const roleType = parts[2]; // buyer, seller, admin
    const postId = parts[3];
    const sellerId = parts[4];
    const buyerId = parts[5];

    const config = getGuildConfig(interaction.guildId!);

    // Kiểm tra chéo: Không cho phép người này bấm nút của người kia
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

    // Đổi màu nút vừa bấm thành Xanh (Success) và Khóa (Disable) nó lại
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
            btn.setDisabled(true); // Khóa nút không cho bấm lại
        }
        return btn;
    });

    const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(newButtons);
    await interaction.update({ components: [newRow] });

    // KIỂM TRA: Xem cả 3 nút đã bị khóa (đã xanh hết) chưa?
    const isAllConfirmed = newButtons.every((btn: any) => btn.data.disabled === true);

    if (isAllConfirmed) {
        const channel = interaction.channel as TextChannel;
        await channel.send('🎉 **TẤT CẢ ĐÃ XÁC NHẬN! Hệ thống đang xuất kho công trình...**');

        // Lấy file Schematic từ Archive
        const archiveChannel = interaction.guild!.channels.cache.get(config.marketArchiveChannelId!) as TextChannel;
        let schematicUrl = '';
        let backupMsgToTrash: any = null;
        if (archiveChannel) {
            const msgs = await archiveChannel.messages.fetch({ limit: 100 });
            const backupMsg = msgs.find(m => m.content.includes(`Mã: **${postId}**`));
            if (backupMsg) {
                schematicUrl = backupMsg.attachments.first()?.url || '';
                backupMsgToTrash = backupMsg;
            }
        }

        // Gửi file và Hướng dẫn + Nút Đóng Ticket
        const deliveryEmbed = new EmbedBuilder()
            .setTitle('🎁 GIAO HÀNG THÀNH CÔNG')
            .setColor(0x2ECC71)
            .setDescription(`Cảm ơn bạn đã giao dịch tại YC Studio.\n\nTệp Schematic của bạn đã được đính kèm (hoặc [Tải trực tiếp tại đây](${schematicUrl})).\n\n**📖 Hướng dẫn sử dụng:**\n1. Tải file về máy.\n2. Bỏ vào thư mục \`plugins/WorldEdit/schematics\`.\n3. Vào game dùng lệnh \`//schem load <tên file>\` và \`//paste\`.\n\n*Giao dịch đã hoàn tất, ban quản trị có thể đóng kênh này.*`);

        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('market_close').setLabel('Đóng Giao Dịch').setEmoji('🔒').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('market_transcript').setLabel('Lưu Giao Dịch').setEmoji('📑').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('market_delete').setLabel('Xóa Giao Dịch').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
        );

        if (schematicUrl) {
            await channel.send({ content: `<@${buyerId}> Đây là hàng của bạn!`, embeds: [deliveryEmbed], components: [actionRow], files: [schematicUrl] });

            if (backupMsgToTrash) {
                try {
                    await backupMsgToTrash.delete();
                } catch (err) {
                    console.error('Lỗi khi xóa file backup schematic:', err);
                }
            }
        } else {
            await channel.send({ content: `⚠️ Lỗi: Không tìm thấy file Schematic trong kho. Giám sát viên vui lòng kiểm tra lại!`, components: [actionRow] });
        }

        // Xóa bài đăng ở Kênh Diễn Đàn
        try {
            const marketChannel = interaction.guild!.channels.cache.get(config.marketChannelId!);
            if (marketChannel?.type === ChannelType.GuildForum) {
                const forum = marketChannel as ForumChannel;
                const threads = await forum.threads.fetchActive();
                const targetThread = threads.threads.find(t => t.name.includes(postId));
                if (targetThread) await targetThread.delete('Đã bán thành công');
            }
        } catch (err) {
            console.error('Lỗi khi xóa post market:', err);
        }
    }
}

export async function handleMarketTicketControls(interaction: ButtonInteraction) {
    const channel = interaction.channel as TextChannel;
    const config = getGuildConfig(interaction.guildId!);
    const customId = interaction.customId;

    // Chỉ cho phép Giám sát viên hoặc Admin bấm các nút này
    const member = interaction.guild!.members.cache.get(interaction.user.id);
    if (!member?.roles.cache.has(config.marketSupervisorRoleId!) && !member?.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ Chỉ Giám Sát Viên mới được dùng các tính năng này!', flags: MessageFlags.Ephemeral });
    }

    try {
        if (customId === 'market_close') {
            await interaction.reply('🔒 Kênh đang được đóng... (Người mua và người bán sẽ không thể nhìn thấy kênh này nữa)');
            
            // Xóa quyền ViewChannel của các cá nhân (Buyer và Seller), chỉ giữ lại Role Supervisor và Bot
            channel.permissionOverwrites.cache.forEach(async (overwrite) => {
                if (overwrite.type === OverwriteType.Member && overwrite.id !== interaction.client.user.id) {
                    await overwrite.delete();
                }
            });
            await channel.send('✅ Kênh đã đóng thành công. Bây giờ bạn có thể Lưu Lịch Sử hoặc Xóa kênh.');
        }

        if (customId === 'market_transcript') {
            await interaction.deferReply();
            
            if (!config.marketLogChannelId) {
                return interaction.editReply('❌ Lỗi: Chưa setup Kênh lưu lịch sử HTML (marketLogChannelId).');
            }

            const logChannel = interaction.guild!.channels.cache.get(config.marketLogChannelId) as TextChannel;
            if (!logChannel) return interaction.editReply('❌ Không tìm thấy kênh lưu trữ!');

            // Khởi tạo Transcript HTML
            const attachment = await discordTranscripts.createTranscript(channel, {
                limit: -1, // Lấy toàn bộ tin nhắn
                filename: `${channel.name}-transcript.html`,
                saveImages: true, 
                poweredBy: false
            });

            const embed = new EmbedBuilder()
                .setTitle('📑 LƯU TRỮ GIAO DỊCH')
                .setColor(0x2B2D31)
                .addFields(
                    { name: 'Kênh', value: `${channel.name}`, inline: true },
                    { name: 'Lưu bởi', value: `${interaction.user}`, inline: true }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embed], files: [attachment] });
            await interaction.editReply(`✅ Đã lưu lịch sử giao dịch sang kênh ${logChannel}!`);
        }

        if (customId === 'market_delete') {
            await interaction.reply('🗑️ Kênh sẽ bị xóa trong 5 giây nữa...');
            setTimeout(() => {
                channel.delete().catch(err => console.error('Lỗi khi xóa kênh GD:', err));
            }, 5000);
        }
    } catch (error) {
        console.error('Lỗi Market Control:', error);
        await interaction.reply({ content: '❌ Có lỗi xảy ra khi thực hiện hành động này.', flags: MessageFlags.Ephemeral });
    }
}