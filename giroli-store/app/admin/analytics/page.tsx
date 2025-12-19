"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProductClickStat {
  productId: string;
  productTitle: string;
  clickCount: number;
}

interface ProductOrderStat {
  productId: string;
  productTitle: string;
  totalQuantity: number;
  orderCount: number;
}

interface SiteVisitStat {
  date: string;
  count: number;
}

interface AnalyticsData {
  productClicks: ProductClickStat[];
  productOrders: ProductOrderStat[];
  siteVisits: SiteVisitStat[];
  totals: {
    productClicks: number;
    siteVisits: number;
    orders: number;
    pendingOrders: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/analytics/stats");
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/admin-login");
            return;
          }
          throw new Error("Failed to load analytics");
        }
        const analyticsData = await res.json();
        setData(analyticsData);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [router]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Se încarcă...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Nu există date disponibile.</p>
      </div>
    );
  }

  const maxClicks = Math.max(
    ...data.productClicks.map((pc) => pc.clickCount),
    1
  );
  const maxVisits = Math.max(...data.siteVisits.map((sv) => sv.count), 1);

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-800">Analiză Utilizatori</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-700">Total Click-uri Produse</p>
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.25 8.718l3.486-1.75M14.25 8.718l-3.486-1.75M7.188 2.24l-1.75 3.486M18.75 2.24l1.75 3.486M12 2.25v.887M12 21.75v-.887m0 0l-3.433-3.431M12 21.75l3.433-3.431" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-blue-900">
            {data.totals.productClicks.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-700">Total Vizite Site</p>
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-green-900">
            {data.totals.siteVisits.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-700">Total Comenzi</p>
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-purple-900">
            {data.totals.orders.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-yellow-700">Comenzi în Așteptare</p>
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-yellow-900">
            {data.totals.pendingOrders.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Product Clicks Ranking */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md mb-6">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800">Clasament Produse - Click-uri</h2>
        </div>
        {data.productClicks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nu există date de click-uri.</p>
        ) : (
          <div className="space-y-4">
            {data.productClicks.slice(0, 10).map((pc, index) => {
              const getRankIcon = (rank: number) => {
                if (rank === 0) return "🥇";
                if (rank === 1) return "🥈";
                if (rank === 2) return "🥉";
                return `#${rank + 1}`;
              };
              return (
                <div key={pc.productId} className="group flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 text-center">
                    <span className="text-lg font-bold text-gray-600">
                      {getRankIcon(index)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                        {pc.productTitle}
                      </span>
                      <span className="text-sm font-bold text-gray-900 bg-blue-100 px-3 py-1 rounded-full ml-2">
                        {pc.clickCount.toLocaleString()} click-uri
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{
                          width: `${(pc.clickCount / maxClicks) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Orders Ranking */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md mb-6">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800">Clasament Produse - Comenzi Finalizate</h2>
        </div>
        {data.productOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nu există produse comandate încă.</p>
        ) : (
          <div className="space-y-4">
            {data.productOrders.slice(0, 10).map((po, index) => {
              const getRankIcon = (rank: number) => {
                if (rank === 0) return "🥇";
                if (rank === 1) return "🥈";
                if (rank === 2) return "🥉";
                return `#${rank + 1}`;
              };
              const maxQuantity = Math.max(...data.productOrders.map((p) => p.totalQuantity), 1);
              return (
                <div key={po.productId} className="group flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 text-center">
                    <span className="text-lg font-bold text-gray-600">
                      {getRankIcon(index)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                      <span className="text-sm font-medium text-gray-800 truncate group-hover:text-purple-700 transition-colors">
                        {po.productTitle}
                      </span>
                      <div className="flex gap-2">
                        <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                          {po.totalQuantity} bucăți
                        </span>
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {po.orderCount} comenzi
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{
                          width: `${(po.totalQuantity / maxQuantity) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Site Visits Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800">
            Vizite Site (Ultimele 30 de Zile)
          </h2>
        </div>
        {data.siteVisits.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nu există date de vizite.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1 sm:gap-2 min-h-[250px] pb-6 bg-gray-50 rounded-lg p-4">
              {data.siteVisits.map((sv, index) => {
                const date = new Date(sv.date);
                const dayLabel = date.getDate();
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const barHeight = sv.count > 0 ? Math.max((sv.count / maxVisits) * 200, 8) : 0;
                return (
                  <div
                    key={sv.date}
                    className="flex flex-col items-center flex-1 min-w-[20px] group"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-green-600 to-green-500 rounded-t-lg transition-all duration-300 hover:from-green-700 hover:to-green-600 relative shadow-sm hover:shadow-md"
                      style={{
                        height: `${barHeight}px`,
                        minHeight: sv.count > 0 ? "8px" : "0",
                      }}
                      title={`${sv.date}: ${sv.count} vizite`}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-lg">
                        <div className="font-semibold">{sv.count} vizite</div>
                        <div className="text-xs text-gray-300 mt-0.5">
                          {new Date(sv.date).toLocaleDateString("ro-RO", {
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isWeekend ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-4 px-2">
              <span className="font-medium">
                {new Date(data.siteVisits[0]?.date).toLocaleDateString("ro-RO", {
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="font-medium">
                {new Date(
                  data.siteVisits[data.siteVisits.length - 1]?.date
                ).toLocaleDateString("ro-RO", {
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

