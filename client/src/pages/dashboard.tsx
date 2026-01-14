import { useDashboardStats, useConnectors } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Package, 
  ShoppingCart, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  TrendingUp, 
  Timer, 
  BarChart3, 
  PieChart as PieIcon,
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

// Simplified palette: Primary Blue and secondary Slate
const COLORS = ["#3b82f6", "#94a3b8", "#64748b", "#475569"];

function KPICard({ title, value, subtext, icon: Icon, trend, colorClass, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200 border-border/50">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                {trend && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {trend}
                  </span>
                )}
              </div>
              {subtext && <p className="text-[11px] text-muted-foreground leading-none">{subtext}</p>}
            </div>
            <div className={`p-2.5 rounded-lg ${colorClass}`}>
              <Icon className="w-5 h-5" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
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

  const ageingBuckets = [
    { range: '0-30 Days', value: 450, color: '#3b82f6' },
    { range: '31-60 Days', value: 120, color: '#60a5fa' },
    { range: '61-90 Days', value: 45, color: '#93c5fd' },
    { range: '90+ Days', value: 12, color: '#bfdbfe' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operations Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Strategic warehouse oversight & performance KPIs.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          title="Fulfillment"
          value="98.2%"
          trend="+0.4%"
          subtext="Orders vs SLA"
          icon={CheckCircle2}
          colorClass="bg-slate-50 text-blue-600"
          delay={0.05}
        />
        <KPICard
          title="Avg Pick Time"
          value="4.2m"
          trend="-12s"
          subtext="Per line item"
          icon={Timer}
          colorClass="bg-slate-50 text-blue-600"
          delay={0.1}
        />
        <KPICard
          title="Avg Pack Time"
          value="2.8m"
          trend="+5s"
          subtext="Per shipment"
          icon={Package}
          colorClass="bg-slate-50 text-blue-600"
          delay={0.15}
        />
        <KPICard
          title="SLA Breach"
          value={`${stats?.orders.breached}`}
          trend="+2"
          subtext="Critical Attention"
          icon={AlertCircle}
          colorClass="bg-slate-50 text-blue-600"
          delay={0.2}
        />
        <KPICard
          title="Utilization"
          value="84%"
          subtext="Rack occupancy"
          icon={PieIcon}
          colorClass="bg-slate-50 text-blue-600"
          delay={0.35}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Hourly Productivity</CardTitle>
              <CardDescription className="text-xs">Orders processed per time block</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[10px] text-muted-foreground uppercase">Orders</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyProductivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold">Order Breakdown</CardTitle>
            <CardDescription className="text-xs">Current fulfillment status</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold">Inventory Ageing</CardTitle>
            <CardDescription className="text-xs">Stock volume by time in warehouse</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] pt-4">
            <div className="flex items-end justify-between h-full gap-4">
              {ageingBuckets.map((bucket) => (
                <div key={bucket.range} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-100 rounded-sm relative group overflow-hidden" style={{ height: '140px' }}>
                    <div 
                      className="absolute bottom-0 w-full rounded-sm transition-all duration-500" 
                      style={{ 
                        height: `${(bucket.value / 450) * 100}%`,
                        backgroundColor: bucket.color
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-slate-900 bg-white/90 px-1.5 py-0.5 rounded shadow-sm">
                        {bucket.value}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">{bucket.range}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold">API Connector Status</CardTitle>
            <CardDescription className="text-xs">External integration health</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {connectors?.map((connector) => (
                <div key={connector.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${connector.status === 'active' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{connector.name}</p>
                      <p className="text-[10px] text-muted-foreground">Sync: {connector.lastSync ? new Date(connector.lastSync).toLocaleTimeString() : 'Never'}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] h-5 ${connector.status === 'active' ? 'bg-slate-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {connector.status === 'active' ? 'Operational' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
