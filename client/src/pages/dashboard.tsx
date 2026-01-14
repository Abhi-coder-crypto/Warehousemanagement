import { useDashboardStats, useConnectors } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, ShoppingCart, AlertCircle, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const COLORS = ["#f59e0b", "#3b82f6", "#ef4444", "#22c55e"];

function StatsCard({ title, value, subtext, icon: Icon, colorClass, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
              {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-xl bg-opacity-10 ${colorClass}`}>
              <Icon className={`w-6 h-6 ${colorClass.replace("bg-", "text-").replace("/10", "")}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: connectors } = useConnectors();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  const orderData = [
    { name: "Pending", value: stats?.orders.pending || 0 },
    { name: "In Process", value: stats?.orders.inProcess || 0 },
    { name: "Breached", value: stats?.orders.breached || 0 },
  ];

  const hasOrders = orderData.some(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Real-time warehouse performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Pending Orders"
          value={stats?.orders.pending}
          subtext="Requires immediate action"
          icon={Clock}
          colorClass="bg-amber-500/10 text-amber-500"
          delay={0.1}
        />
        <StatsCard
          title="In Process"
          value={stats?.orders.inProcess}
          subtext="Currently being picked/packed"
          icon={RefreshCw}
          colorClass="bg-blue-500/10 text-blue-500"
          delay={0.2}
        />
        <StatsCard
          title="Breached SLAs"
          value={stats?.orders.breached}
          subtext="Overdue orders"
          icon={AlertCircle}
          colorClass="bg-red-500/10 text-red-500"
          delay={0.3}
        />
        <StatsCard
          title="Total SKUs"
          value={stats?.inventory.totalSkus}
          subtext={`${stats?.inventory.totalQuantity} items in stock`}
          icon={Package}
          colorClass="bg-emerald-500/10 text-emerald-500"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Inventory Distribution</CardTitle>
            <CardDescription>Stock levels across top categories</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             {/* Placeholder for bar chart - using mock data since API only gives aggregates */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Electronics', stock: 120 },
                { name: 'Apparel', stock: 250 },
                { name: 'Home', stock: 85 },
                { name: 'Toys', stock: 190 },
                { name: 'Books', stock: 320 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="stock" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Current workload breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] relative">
            {hasOrders ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No active orders</div>
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-2xl font-bold">{stats?.orders.pending! + stats?.orders.inProcess! + stats?.orders.breached!}</span>
                <p className="text-xs text-muted-foreground uppercase">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {connectors?.map((connector) => (
          <Card key={connector.id} className="border-l-4 border-l-primary">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{connector.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Last synced: {connector.lastSync ? new Date(connector.lastSync).toLocaleTimeString() : 'Never'}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 
                ${connector.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${connector.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {connector.status === 'active' ? 'Connected' : 'Error'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
