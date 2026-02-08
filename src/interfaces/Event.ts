import { ClientEvents } from "discord.js";

export interface IEvent {
    // Tên của sự kiện
    name: keyof ClientEvents;

    // Chế độ chạy (1 lần hay nhiều lần)
    once?: boolean;

    // Hàm thực thi logic
    execute(...args: any[]): Promise<void> | void;
}