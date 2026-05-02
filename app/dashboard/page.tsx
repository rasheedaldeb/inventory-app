import SideBar from "@/components/sideBar";
import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/auth";
import { TrendingUp } from "lucide-react";
import ProductsChart from "@/components/ProductsChart";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user.id;
  const [totalProducts, lowStack, allProducts] = await Promise.all([
    prisma.product.count({ where: { userId } }),
    prisma.product.count({
      where: { userId, lowStackAt: { not: null }, quantity: { lte: 5 } },
    }),
    prisma.product.findMany({
      where: { userId },
      select: {
        price: true,
        quantity: true,
        createdAt: true,
      },
    }),
  ]);

  const totalValue = allProducts.reduce(
    (sum, product) => sum + Number(product.price) * Number(product.quantity),
    0,
  );

  const inStackCount = allProducts.filter((p) => Number(p.quantity) > 5).length;
  const lowStackCount = allProducts.filter(
    (p) => Number(p.quantity) <= 5 && Number(p.quantity) >= 1,
  ).length;
  const outOfStackCount = allProducts.filter(
    (p) => Number(p.quantity) === 0,
  ).length;
  const inStackPrecentage =
    totalProducts > 0 ? Math.round((inStackCount / totalProducts) * 100) : 0;
  const lowStackPrecentage =
    totalProducts > 0 ? Math.round((lowStackCount / totalProducts) * 100) : 0;
  const outOfStackPrecentage =
    totalProducts > 0 ? Math.round((outOfStackCount / totalProducts) * 100) : 0;
  const now = new Date();
  const weeklyProductsData = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekStart.setHours(23, 59, 59, 999);
    const weekLabel = `${String(weekStart.getMonth() + 1).padStart(2, "0")}/${String(weekStart.getDate() + 1).padStart(2, "0")}`;
    const weekProducts = allProducts.filter((item) => {
      const produductDate = new Date(item.createdAt);
      return produductDate >= weekStart && produductDate <= weekEnd;
    });
    weeklyProductsData.push({
      week: weekLabel,
      products: weekProducts.length,
    });
  }
  const recentProducts = prisma.product.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  return (
    <div className="min-h-screen bg-gray-50 ">
      <SideBar currentPath="/dashboard" />
      <main className="ml-64 p-8">
        {/* header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome back , here an overview to your inventory
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* key metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Key Metrics
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{totalProducts}</div>
                <div className="text-sm text-gray-600">Total Products</div>
                <div className="flex items-center justify-center mt-1">
                  <span className="text-green-600">+{totalProducts}</span>
                  <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  $ {Number(totalValue).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
                <div className="flex items-center justify-center mt-1">
                  <span className="text-green-600">
                    +{Number(totalValue).toFixed(0)}
                  </span>
                  <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{lowStack}</div>
                <div className="text-sm text-gray-600">Low Stack</div>
                <div className="flex items-center justify-center mt-1">
                  <span className="text-green-600">+{lowStack}</span>
                  <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
                </div>
              </div>
            </div>
          </div>
          {/* inventory over time */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6 ">
              <h2>New products per week</h2>
            </div>
            <div className="h-48 ">
              <ProductsChart data={weeklyProductsData} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* stack levels */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Stack Levels
              </h2>
            </div>
            <div className="space-y-3 ">
              {(await recentProducts).map((item, i) => {
                const stackLevel =
                  item.quantity === 0
                    ? 0
                    : item.quantity <= (item.lowStackAt || 5)
                      ? 1
                      : 2;
                const bgColors = [
                  "bg-red-600",
                  "bg-yellow-600",
                  "bg-green-600",
                ];
                const textColor = [
                  "text-red-600",
                  "text-yellow-600",
                  "text-green-600",
                ];
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${bgColors[stackLevel]}`}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {item.name}
                      </span>
                    </div>
                    <div
                      className={`text-sm font-medium ${textColor[stackLevel]}`}
                    >
                      {item.quantity} units
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Efficiency */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-gray-900">
                Efficiency
              </h2>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-purple-600 "
                  style={{
                    clipPath:
                      "polygon(50% 50% , 50% 0% , 100% 0% , 100% 100% , 0% 100% , 0% 50%)",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center ">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {inStackPrecentage}%
                    </div>
                    <div className="text-sm text-gray-600">In Stock</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-200" />
                  <span>In Stock {inStackPrecentage}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-600" />
                  <span>Low Stock {lowStackPrecentage}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                  <span>Out Of Stock {outOfStackPrecentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
