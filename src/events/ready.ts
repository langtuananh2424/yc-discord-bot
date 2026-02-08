import { Client, Events } from 'discord.js';
import { IEvent } from '../interfaces/Event';

const ReadyEvent: IEvent = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
        console.log(`YC Bot đã sẵn sàng! Đăng nhập dưới tên: ${client.user?.tag}`);
    }
}