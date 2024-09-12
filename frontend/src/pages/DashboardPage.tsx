import React, { useState, useEffect, lazy } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchDashboardData } from "@/services/api";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import { DashboardData } from "@/types";
import {
  TrendingUpIcon,
  ShoppingCartIcon,
  ClockIcon,
  Wallet,
} from "lucide-react";
import Loader from "@/components/Layout/Loader";
import { formatHour } from "@/utils/formatters";
import ErrorBoundary from "@/components/Layout/ErrorBoundary";

const Layout = lazy(() => import("@/components/Layout/Layout"));
// const TopDishesSlider = lazy(
//   () => import("@/components/Dashboard/TopDishesSlider")
// );

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#6f42c1",
];

const timeRangeHeadings : { day: string, week: string, month: string, year: string } = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
  year: "Yearly",
};

const RestaurantDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>("week");
  const heading = timeRangeHeadings[timeRange as keyof typeof timeRangeHeadings];
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData(timeRange);
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error("Error loading dashboard data:", err);
      }
    };
    loadDashboardData();
  }, [timeRange]);

  if (error) {
    return (
      <Layout>
        <div className="p-4 text-red-500">{error}</div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  const {
    total_income = 0,
    popular_time_slots = [],
    total_orders = 0,
    avg_order_value = 0,
    daily_sales = [],
    top_dishes = [],
    category_sales = [],
    total_income_trend,
    total_orders_trend,
    avg_order_value_trend,
  } = dashboardData;

  const formattedPopularTimeSlots = popular_time_slots.map((slot) => ({
    ...slot,
    formattedHour: formatHour(slot.hour),
  }));

  return (
    <Layout>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h1 className="text-3xl font-bold mb-2 sm:mb-0">Dashboard</h1>
          <Select onValueChange={setTimeRange} defaultValue={timeRange}>
            <SelectTrigger className="w-full sm:w-[180px] outline-none ring-offset-0">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardCard
            title="Total Income"
            value={`QAR ${total_income.toLocaleString()}`}
            icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
            trend={total_income_trend}
          />
          <DashboardCard
            title="Peak Hour"
            value={formatHour(popular_time_slots[0]?.hour)}
            icon={<ClockIcon className="h-4 w-4 text-muted-foreground" />}
          />
          <DashboardCard
            title="Total Orders"
            value={total_orders}
            icon={
              <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
            }
            trend={total_orders_trend}
          />
          <DashboardCard
            title="Average Order Value"
            value={`QAR ${avg_order_value.toFixed(2)}`}
            icon={<TrendingUpIcon className="h-4 w-4 text-muted-foreground" />}
            trend={avg_order_value_trend}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ErrorBoundary fallback={<div>Error loading chart</div>}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">
                  {`${heading} Sales`}
                </h3>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={daily_sales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="total_sales"
                      stroke="#8884d8"
                      name="Total Sales (QAR)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="order_count"
                      stroke="#82ca9d"
                      name="Order Count"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </ErrorBoundary>

          <ErrorBoundary fallback={<div>Error loading chart</div>}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Top Dishes</h3>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={top_dishes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dish__name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </ErrorBoundary>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ErrorBoundary fallback={<div>Error loading chart</div>}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Sales by Category</h3>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={category_sales}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#6f42c1"
                      dataKey="value"
                      label={({ dish__category__name, percent }) =>
                        `${dish__category__name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {category_sales.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </ErrorBoundary>

          <ErrorBoundary fallback={<div>Error loading chart</div>}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Popular Time Slots</h3>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart outerRadius={90} data={formattedPopularTimeSlots}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="formattedHour" />
                    <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
                    <Radar
                      name="Order Count"
                      dataKey="order_count"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </ErrorBoundary>
        </div>
      </div>
      {/* <h2 className="text-3xl font-bold mt-5 mb-4">Main Dishes</h2>
      <Suspense fallback={<Loader />}>
        <TopDishesSlider topDishes={top_dishes} />
      </Suspense> */}
    </Layout>
  );
};

export default RestaurantDashboard;
