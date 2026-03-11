import { EMOJIS } from './emojis';

// Danh sách các vật phẩm có thể đào được và tỷ lệ rơi của chúng
export const MINING_ITEMS = [
    { id: 'cobblestone', name: 'Đá Cuội', emoji: EMOJIS.COBBLESTONE, weight: 50 },
    { id: 'coal', name: 'Than Đá', emoji: EMOJIS.COAL, weight: 25 },
    { id: 'iron_ingot', name: 'Quặng Sắt', emoji: EMOJIS.IRON_INGOT, weight: 15 },
    { id: 'gold_ingot', name: 'Quặng Vàng', emoji: EMOJIS.GOLD_INGOT, weight: 8 },
    { id: 'redstone', name: 'Đá Đỏ', emoji: EMOJIS.REDSTONE, weight: 8 },
    { id: 'lapislazuli', name: 'Ngọc Lưu Ly', emoji: EMOJIS.LAPISLAZULI, weight: 8 },
    { id: 'diamond', name: 'Kim Cương', emoji: EMOJIS.DIAMOND, weight: 1.5 },
    { id: 'emarald', name: 'Ngọc Lục Bảo', emoji: EMOJIS.EMARALD, weight: 1 },
    { id: 'netherite', name: 'Netherite', emoji: EMOJIS.NETHERITE, weight: 0.5 },
    { id: 'tnt', name: 'Khối TNT', emoji: EMOJIS.TNT, weight: 0.5 }
];

// Hàm quay Gacha dựa trên Trọng số (Weight)
export const getRandomMiningItem = () => {
    const totalWeight = MINING_ITEMS.reduce((sum, item) => sum + item.weight, 0);
    const random = Math.random() * totalWeight;
    
    let cumulativeWeight = 0;
    for (const item of MINING_ITEMS) {
        cumulativeWeight += item.weight;
        if (random <= cumulativeWeight) {
            return item;
        }
    }
    return MINING_ITEMS[0]; // Backup (Tránh lỗi)
};