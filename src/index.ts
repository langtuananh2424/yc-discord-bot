import 'dotenv/config';
import { YCClient } from './structures/YCClient';

const client = new YCClient();

(async () => {
    // Load lệnh và sự kiện trước khi khởi động
    await client.loadCommands();
    await client.loadEvents();
    
    client.start(process.env.DISCORD_TOKEN!);
})();