-- CreateTable
CREATE TABLE "stock_orders" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_orders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
