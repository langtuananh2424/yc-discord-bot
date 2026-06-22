// 1. Bảng giá GỐC của các vật phẩm
export const BASE_PRICES: Record<string, number> = {
    'cobblestone': 0.1,  
    'coal': 0.5,         
    'redstone': 1.0,     
    'lapislazuli': 1.5,  
    'iron_ore': 2.0,     
    'gold_ore': 5.0,     
    'emarald': 10.0,     
    'diamond': 20.0,     
    'netherite': 50.0,   
    'tnt': 5.0           
};

// 2. Thuật toán tạo số ngẫu nhiên cố định theo từng ngày (Không bị đổi khi Bot khởi động lại)
function seededRandom(seed: number) {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

// 3. Hàm tính toán giá của ngày hôm nay
export const getDailyPrice = (itemId: string): { price: number, trend: string, multiplier: number } => {
    const basePrice = BASE_PRICES[itemId] || 0.1;
    
    // Lấy ngày hiện tại (YYYY-MM-DD)
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    // Băm Ngày + Tên Vật Phẩm thành một con số hạt giống (seed)
    let seed = 0;
    const seedString = dateString + itemId;
    for (let i = 0; i < seedString.length; i++) {
        seed += seedString.charCodeAt(i);
    }
    
    // Lấy số ngẫu nhiên từ 0.0 -> 1.0 cho ngày hôm nay
    const rand = seededRandom(seed);
    
    // Hệ số giá dao động từ 0.7x (-30%) đến 1.5x (+50%)
    const multiplier = 0.7 + (rand * 0.8); 
    
    let currentPrice = basePrice * multiplier;
    
    // Làm tròn 1 chữ số thập phân và đảm bảo không bao giờ rớt xuống dưới 0.1
    currentPrice = Math.round(currentPrice * 10) / 10;
    if (currentPrice < 0.1) currentPrice = 0.1;

    // Hiệu ứng Mũi tên Chứng khoán
    let trend = '➖'; // Đứng giá
    if (multiplier >= 1.3) trend = '🚀';      // Tăng cực mạnh
    else if (multiplier > 1.05) trend = '📈'; // Tăng nhẹ
    else if (multiplier < 0.8) trend = '📉';  // Giảm mạnh
    else if (multiplier <= 0.95) trend = '🔻';// Giảm nhẹ

    return { price: currentPrice, trend, multiplier };
};