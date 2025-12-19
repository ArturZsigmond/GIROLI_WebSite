import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();

    // Get product click statistics
    const productClicks = await prisma.productClick.groupBy({
      by: ["productId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Get product details for clicks
    const productIds = productClicks.map((pc) => pc.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p.title]));

    const productClickStats = productClicks.map((pc) => ({
      productId: pc.productId,
      productTitle: productMap.get(pc.productId) || "Unknown Product",
      clickCount: pc._count.id,
    }));

    // Get site visit statistics by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allVisits = await prisma.siteVisit.findMany({
      where: {
        visitedAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        visitedAt: "asc",
      },
    });

    // Filter out admin visits
    const filteredVisits = allVisits.filter(
      (visit) => !visit.path.startsWith("/admin") && !visit.path.startsWith("/admin-login")
    );

    // Group visits by date
    const visitsByDate = new Map<string, number>();
    filteredVisits.forEach((visit) => {
      const date = visit.visitedAt.toISOString().split("T")[0];
      visitsByDate.set(date, (visitsByDate.get(date) || 0) + 1);
    });

    // Fill in missing dates with 0
    const visitStats = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      visitStats.push({
        date: dateStr,
        count: visitsByDate.get(dateStr) || 0,
      });
    }

    // Get total statistics (excluding admin pages)
    const totalProductClicks = await prisma.productClick.count();
    const allSiteVisits = await prisma.siteVisit.findMany({
      select: { path: true },
    });
    const totalSiteVisits = allSiteVisits.filter(
      (visit) => !visit.path.startsWith("/admin") && !visit.path.startsWith("/admin-login")
    ).length;
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({
      where: {
        status: {
          in: ["PENDING", "IN_PRODUCTION", "IN_TRANSIT"],
        },
      },
    });

    // Get product order statistics (most ordered products)
    const allOrderItems = await prisma.orderItem.findMany({
      include: {
        order: {
          select: {
            status: true,
          },
        },
      },
    });

    // Count products by total quantity ordered (only completed orders)
    const productOrderCounts = new Map<string, { quantity: number; orders: number }>();
    
    allOrderItems.forEach((item) => {
      // Only count completed orders
      if (item.order.status === "COMPLETED") {
        const existing = productOrderCounts.get(item.productId) || { quantity: 0, orders: 0 };
        productOrderCounts.set(item.productId, {
          quantity: existing.quantity + item.quantity,
          orders: existing.orders + 1,
        });
      }
    });

    // Get product details for ordered products
    const orderedProductIds = Array.from(productOrderCounts.keys());
    const orderedProducts = await prisma.product.findMany({
      where: {
        id: {
          in: orderedProductIds,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const orderedProductMap = new Map(orderedProducts.map((p) => [p.id, p.title]));

    // Create ordered products stats
    const productOrderStats = Array.from(productOrderCounts.entries())
      .map(([productId, stats]) => ({
        productId,
        productTitle: orderedProductMap.get(productId) || "Produs șters",
        totalQuantity: stats.quantity,
        orderCount: stats.orders,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity);

    return NextResponse.json({
      productClicks: productClickStats,
      productOrders: productOrderStats,
      siteVisits: visitStats,
      totals: {
        productClicks: totalProductClicks,
        siteVisits: totalSiteVisits,
        orders: totalOrders,
        pendingOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

