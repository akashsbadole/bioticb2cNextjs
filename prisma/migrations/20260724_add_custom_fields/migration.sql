-- CreateTable
CREATE TABLE "CustomFieldDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT,
    "entityType" TEXT NOT NULL DEFAULT 'product',
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "options" TEXT NOT NULL DEFAULT '[]',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomFieldDefinition_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CustomFieldDefinition_storeId_entityType_idx" ON "CustomFieldDefinition"("storeId", "entityType");

-- CreateIndex
CREATE INDEX "CustomFieldDefinition_entityType_idx" ON "CustomFieldDefinition"("entityType");

-- CreateTable
CREATE TABLE "CustomFieldValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "definitionId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL DEFAULT 'product',
    "storeId" TEXT,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomFieldValue_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "CustomFieldDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CustomFieldValue_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldValue_definitionId_entityId_entityType_key" ON "CustomFieldValue"("definitionId", "entityId", "entityType");

-- CreateIndex
CREATE INDEX "CustomFieldValue_entityId_entityType_idx" ON "CustomFieldValue"("entityId", "entityType");

-- CreateIndex
CREATE INDEX "CustomFieldValue_storeId_idx" ON "CustomFieldValue"("storeId");
