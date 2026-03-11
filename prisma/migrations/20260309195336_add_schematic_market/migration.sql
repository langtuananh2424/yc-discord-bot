-- CreateTable
CREATE TABLE "SchematicItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "imageUrls" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL
);
