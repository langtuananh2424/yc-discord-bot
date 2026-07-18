import { Interaction, MessageFlags } from 'discord.js';
import { errorLogger, ErrorContext } from './errorLogger';
import { YCClient } from '../structures/YCClient';

/**
 * Wrapper cho command execution với error handling toàn diện
 * Giúp bắt và xử lý lỗi một cách nhất quán
 */
export async function executeCommandSafely(
    interaction: Interaction,
    executeCommand: () => Promise<void>
): Promise<void> {
    if (!interaction.isChatInputCommand()) {
        return executeCommand();
    }

    const context: ErrorContext = {
        userId: interaction.user.id,
        commandName: interaction.commandName,
        guildId: interaction.guildId || undefined,
        interaction: interaction
    };

    try {
        // Ghi log khi command được thực thi
        await errorLogger.info(
            `Executing command: ${interaction.commandName}`,
            context
        );

        await executeCommand();
    } catch (error) {
        // Ghi log lỗi
        await errorLogger.error(error as Error, context, true);

        // Gửi phản hồi cho user
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        const userMessage = `❌ Đã có lỗi xảy ra!\n\`\`\`${errorMessage.substring(0, 100)}\`\`\``;

        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: userMessage,
                    flags: MessageFlags.Ephemeral
                });
            } else if (interaction.deferred) {
                await interaction.editReply({ content: userMessage });
            }
        } catch (replyError) {
            console.error('❌ Không thể gửi error message:', replyError);
        }
    }
}

/**
 * Wrapper cho interaction handler (buttons, modals, etc.)
 */
export async function executeInteractionSafely(
    interaction: Interaction,
    handlerName: string,
    executeHandler: () => Promise<any>
): Promise<void> {
    const context: ErrorContext = {
        userId: interaction.user.id,
        commandName: handlerName,
        guildId: interaction.guildId || undefined
    };

    try {
        await errorLogger.info(
            `Executing handler: ${handlerName}`,
            context
        );

        await executeHandler();
    } catch (error) {
        await errorLogger.error(error as Error, context, true);

        // Thử trả lời nếu còn có thể
        try {
            // Type guard để check nếu là BaseInteraction
            if ('replied' in interaction && 'deferred' in interaction && 'reply' in interaction && 'editReply' in interaction) {
                const baseInteraction = interaction as any;
                if (!baseInteraction.replied && !baseInteraction.deferred) {
                    await baseInteraction.reply({
                        content: '❌ Đã có lỗi xảy ra khi xử lý yêu cầu!',
                        flags: MessageFlags.Ephemeral
                    });
                } else if (baseInteraction.deferred) {
                    await baseInteraction.editReply({
                        content: '❌ Đã có lỗi xảy ra khi xử lý yêu cầu!'
                    });
                }
            }
        } catch (replyError) {
            await errorLogger.error(replyError as Error, {
                ...context,
                commandName: `${handlerName}_reply_error`
            }, false);
        }
    }
}

/**
 * Wrapper cho event handler
 */
export async function executeEventSafely(
    eventName: string,
    executeEvent: () => Promise<void>,
    guildId?: string
): Promise<void> {
    const context: ErrorContext = {
        commandName: `[EVENT] ${eventName}`,
        guildId: guildId
    };

    try {
        await executeEvent();
    } catch (error) {
        await errorLogger.error(error as Error, context, true);
    }
}

/**
 * Wrapper cho database operation
 */
export async function executeDatabaseSafely<T>(
    operationName: string,
    executeOperation: () => Promise<T>,
    context?: ErrorContext
): Promise<T | null> {
    const fullContext = {
        commandName: `[DATABASE] ${operationName}`,
        ...context
    };

    try {
        return await executeOperation();
    } catch (error) {
        await errorLogger.error(error as Error, fullContext, true);
        return null;
    }
}
