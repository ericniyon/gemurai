import { prisma } from "@/lib/database"
import { logSoromaAudit } from "./audit"

export async function getPassportGenealogy(tenantId: string, passportId: string) {
  const passport = await prisma.soromaPassport.findFirst({
    where: { id: passportId, tenantId },
    include: {
      batch: {
        include: {
          line: true,
          inputs: {
            include: {
              rawMaterialLot: {
                include: {
                  supplier: true,
                  purchaseOrder: {
                    include: { supplier: true },
                  },
                },
              },
            },
          },
          outputs: {
            include: {
              stockLot: {
                include: {
                  warehouse: true,
                },
              },
            },
          },
          stockLots: {
            include: {
              warehouse: true,
            },
          },
        },
      },
      scans: {
        orderBy: { scannedAt: "desc" },
        take: 20,
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      documents: true,
    },
  })

  if (!passport) return null

  const skuCodes = new Set<string>()
  for (const output of passport.batch?.outputs ?? []) {
    skuCodes.add(output.skuCode)
  }
  for (const stockLot of passport.batch?.stockLots ?? []) {
    if (stockLot.skuCode) skuCodes.add(stockLot.skuCode)
  }

  const orders = skuCodes.size
    ? await prisma.soromaOrder.findMany({
        where: {
          tenantId,
          lines: {
            some: {
              skuCode: { in: Array.from(skuCodes) },
            },
          },
        },
        include: {
          buyer: true,
          lines: true,
          shipments: true,
        },
        orderBy: { orderDate: "desc" },
        take: 30,
      })
    : []

  return {
    passport: {
      id: passport.id,
      passportNo: passport.passportNo,
      status: passport.status,
      issuedAt: passport.issuedAt,
      version: passport.version,
      qrCode: passport.qrCode,
    },
    supplierLots: (passport.batch?.inputs ?? []).map((input) => ({
      lotId: input.rawMaterialLotId,
      lotNumber: input.rawMaterialLot.lotNumber,
      commodity: input.rawMaterialLot.commodity,
      quantity: input.rawMaterialLot.quantity,
      supplierName: input.rawMaterialLot.supplier?.name ?? "—",
      purchaseOrderNo: input.rawMaterialLot.purchaseOrder?.poNumber ?? "—",
      receivedAt: input.rawMaterialLot.receivedAt,
    })),
    batch: passport.batch
      ? {
          id: passport.batch.id,
          batchNumber: passport.batch.batchNumber,
          status: passport.batch.status,
          startedAt: passport.batch.startedAt,
          completedAt: passport.batch.completedAt,
          line: passport.batch.line?.name ?? "—",
          outputQty: passport.batch.outputQty,
        }
      : null,
    finishedLots: (passport.batch?.outputs ?? []).map((lot) => ({
      id: lot.id,
      skuCode: lot.skuCode,
      skuName: lot.skuName,
      quantity: lot.quantity,
      stockLotId: lot.stockLotId,
      warehouse: lot.stockLot?.warehouse?.name ?? "—",
      stockStatus: lot.stockLot?.status ?? "—",
    })),
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      buyer: order.buyer.name,
      status: order.status,
      amount: Number(order.amount),
      orderDate: order.orderDate,
      shipments: order.shipments.map((s) => ({
        id: s.id,
        shipmentNumber: s.shipmentNumber,
        status: s.status,
        dispatchAt: s.dispatchAt,
        deliveredAt: s.deliveredAt,
      })),
    })),
    events: passport.events,
    scans: passport.scans,
    documents: passport.documents,
  }
}

export async function verifyPassportScan(params: {
  tenantId: string
  passportNo: string
  location?: string
  userAgent?: string
  ipAddress?: string
  scannedByUserId?: string
}) {
  const passport = await prisma.soromaPassport.findFirst({
    where: {
      tenantId: params.tenantId,
      passportNo: params.passportNo,
    },
    include: {
      batch: true,
    },
  })
  if (!passport) return null

  const scan = await prisma.soromaPassportScan.create({
    data: {
      passportId: passport.id,
      location: params.location,
      verified: passport.status === "ISSUED",
      metadata: {
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        scannedByUserId: params.scannedByUserId,
      },
    },
  })

  await prisma.soromaTraceabilityEvent.create({
    data: {
      tenantId: params.tenantId,
      passportId: passport.id,
      entityType: "SoromaPassport",
      entityId: passport.id,
      eventType: "passport.qr_verified",
      payload: {
        scanId: scan.id,
        location: params.location,
        verified: scan.verified,
      },
    },
  })

  await logSoromaAudit({
    userId: params.scannedByUserId,
    tenantId: params.tenantId,
    workspaceType: "TENANT",
    action: "passport.qr_verified",
    entityType: "SoromaPassport",
    entityId: passport.id,
    afterState: {
      passportNo: passport.passportNo,
      location: params.location,
      verified: scan.verified,
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  })

  return {
    passport: {
      id: passport.id,
      passportNo: passport.passportNo,
      status: passport.status,
      batchNumber: passport.batch?.batchNumber ?? null,
      issuedAt: passport.issuedAt,
      qrCode: passport.qrCode,
    },
    scan,
  }
}
