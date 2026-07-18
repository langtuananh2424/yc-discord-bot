-- CreateTable
CREATE TABLE "RealMoneyMarketItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankInfo" TEXT NOT NULL,
    "bankOwner" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
