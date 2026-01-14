import { useDashboardStats, useConnectors } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Package, 
  ShoppingCart, 
  AlertCircle, 
  CheckCircle2, 
  Box,
  ClipboardList,
  Download
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981"];

function KPICard({ title, value, subtext, icon: Icon, colorClass, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200 border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colorClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
              <p className="text-[10px] text-muted-foreground font-medium">{subtext}</p>
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
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const orderStatusData = [
    { name: "Pending", value: stats?.orders.pending || 0 },
    { name: "In Process", value: stats?.orders.inProcess || 0 },
    { name: "Breached", value: stats?.orders.breached || 0 },
    { name: "Completed", value: 142 },
  ];

  const hourlyProductivity = [
    { hour: '08:00', orders: 12 },
    { hour: '10:00', orders: 34 },
    { hour: '12:00', orders: 28 },
    { hour: '14:00', orders: 45 },
    { hour: '16:00', orders: 38 },
    { hour: '18:00', orders: 15 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Quick summary of your warehouse operations today.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 h-9 text-xs font-semibold border-slate-200 shadow-sm">
          <Download className="w-4 h-4" /> Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total SKUs"
          value={stats?.inventory.totalSkus || 0}
          subtext="Unique items in stock"
          icon={Package}
          colorClass="bg-blue-50 text-blue-600"
          delay={0.05}
        />
        <KPICard
          title="Total Inventory"
          value={stats?.inventory.totalQuantity.toLocaleString() || 0}
          subtext="Total units on hand"
          icon={Box}
          colorClass="bg-emerald-50 text-emerald-600"
          delay={0.1}
        />
        <KPICard
          title="Pending Orders"
          value={stats?.orders.pending || 0}
          subtext="Awaiting fulfillment"
          icon={ClipboardList}
          colorClass="bg-amber-50 text-amber-600"
          delay={0.15}
        />
        <KPICard
          title="Critical Alerts"
          value={stats?.orders.breached || 0}
          subtext="SLA breaches detected"
          icon={AlertCircle}
          colorClass="bg-red-50 text-red-600"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold">Activity Log</CardTitle>
              <CardDescription className="text-xs">Hourly order processing volume</CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Orders</span>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyProductivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }} 
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Order Status</CardTitle>
            <CardDescription className="text-xs">Breakdown of current orders</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={40} 
                  iconType="circle" 
                  iconSize={6}
                  wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">API Integration Status</CardTitle>
          <CardDescription className="text-xs">Connectivity health with external platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors?.map((connector) => (
              <div key={connector.id} className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${connector.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{connector.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Last Sync: {connector.lastSync ? new Date(connector.lastSync).toLocaleTimeString() : 'Never'}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={`text-[10px] font-bold ${connector.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {connector.status === 'active' ? 'Active' : 'Offline'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
