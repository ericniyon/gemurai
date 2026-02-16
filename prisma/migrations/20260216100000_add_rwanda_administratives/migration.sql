-- CreateTable
CREATE TABLE "rwanda_provinces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rwanda_provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rwanda_districts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "provinceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rwanda_districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rwanda_sectors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rwanda_sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rwanda_cells" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rwanda_cells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rwanda_villages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rwanda_villages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rwanda_provinces_name_key" ON "rwanda_provinces"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rwanda_provinces_slug_key" ON "rwanda_provinces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "rwanda_districts_provinceId_slug_key" ON "rwanda_districts"("provinceId", "slug");

-- CreateIndex
CREATE INDEX "rwanda_districts_provinceId_idx" ON "rwanda_districts"("provinceId");

-- CreateIndex
CREATE UNIQUE INDEX "rwanda_sectors_districtId_slug_key" ON "rwanda_sectors"("districtId", "slug");

-- CreateIndex
CREATE INDEX "rwanda_sectors_districtId_idx" ON "rwanda_sectors"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "rwanda_cells_sectorId_slug_key" ON "rwanda_cells"("sectorId", "slug");

-- CreateIndex
CREATE INDEX "rwanda_cells_sectorId_idx" ON "rwanda_cells"("sectorId");

-- CreateIndex
CREATE UNIQUE INDEX "rwanda_villages_cellId_slug_key" ON "rwanda_villages"("cellId", "slug");

-- CreateIndex
CREATE INDEX "rwanda_villages_cellId_idx" ON "rwanda_villages"("cellId");

-- AddForeignKey
ALTER TABLE "rwanda_districts" ADD CONSTRAINT "rwanda_districts_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "rwanda_provinces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rwanda_sectors" ADD CONSTRAINT "rwanda_sectors_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "rwanda_districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rwanda_cells" ADD CONSTRAINT "rwanda_cells_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "rwanda_sectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rwanda_villages" ADD CONSTRAINT "rwanda_villages_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "rwanda_cells"("id") ON DELETE CASCADE ON UPDATE CASCADE;
