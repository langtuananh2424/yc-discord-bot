/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `SchematicItem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SchematicItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "imageUrls" TEXT NOT NULL
);
INSERT INTO "new_SchematicItem" ("description", "fileUrl", "id", "imageUrls", "price", "sellerId", "title") SELECT "description", "fileUrl", "id", "imageUrls", "price", "sellerId", "title" FROM "SchematicItem";
DROP TABLE "SchematicItem";
ALTER TABLE "new_SchematicItem" RENAME TO "SchematicItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
