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

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981"];

function KPICard({ title, value, subtext, icon: Icon, trend, trendValue, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200 border-border/50 relative overflow-hidden">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black tracking-tighter">{value}</h3>
                {trendValue && (
                  <Badge variant="secondary" className={`text-[10px] font-bold h-5 px-1 ${trend === 'up' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {trendValue}
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">{subtext}</p>
            </div>
            <Icon className="w-5 h-5 text-blue-600 opacity-80" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
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
    { range: '0-30 Days', value: 450, color: '#10b981' },
    { range: '31-60 Days', value: 120, color: '#3b82f6' },
    { range: '61-90 Days', value: 45, color: '#f59e0b' },
    { range: '90+ Days', value: 12, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Operations Control</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Strategic warehouse oversight & performance KPIs.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs font-bold border-slate-200">
          <Download className="w-3 h-3" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          title="Fulfillment"
          value="98.2%"
          trend="up"
          trendValue="+0.4%"
          subtext="Orders vs SLA"
          icon={CheckCircle2}
          delay={0.05}
        />
        <KPICard
          title="Avg Pick Time"
          value="4.2m"
          trend="down"
          trendValue="-12s"
          subtext="Per line item"
          icon={Timer}
          delay={0.1}
        />
        <KPICard
          title="Avg Pack Time"
          value="2.8m"
          trend="up"
          trendValue="+5s"
          subtext="Per shipment"
          icon={Package}
          delay={0.15}
        />
        <KPICard
          title="SLA Breach"
          value={`${stats?.orders.breached}`}
          trend="up"
          trendValue="+2"
          subtext="Critical Attention"
          icon={AlertCircle}
          delay={0.2}
        />
        <KPICard
          title="Utilization"
          value="84%"
          subtext="Rack occupancy"
          icon={PieIcon}
          delay={0.35}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-wider">Hourly Productivity</CardTitle>
              <CardDescription className="text-[10px]">Orders processed per time block</CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
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
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
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
            <CardTitle className="text-sm font-black uppercase tracking-wider">Order Breakdown</CardTitle>
            <CardDescription className="text-[10px]">Current fulfillment status</CardDescription>
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
                  wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-wider">Inventory Ageing</CardTitle>
            <CardDescription className="text-[10px]">Stock volume by time in warehouse</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
            <div className="flex items-end justify-between h-full gap-4">
              {ageingBuckets.map((bucket) => (
                <div key={bucket.range} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-50 border border-slate-100 rounded-lg relative group overflow-hidden h-[140px]">
                    <div 
                      className="absolute bottom-0 w-full rounded-b-lg transition-all duration-500" 
                      style={{ 
                        height: `${(bucket.value / 450) * 100}%`,
                        backgroundColor: bucket.color
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-black text-slate-900 bg-white/95 px-2 py-1 rounded shadow-sm border border-slate-100">
                        {bucket.value}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{bucket.range}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-wider">API Health</CardTitle>
            <CardDescription className="text-[10px]">External integration health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {connectors?.map((connector) => (
                <div key={connector.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-slate-50/40">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${connector.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{connector.name}</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase">Sync: {connector.lastSync ? new Date(connector.lastSync).toLocaleTimeString() : 'Never'}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[9px] font-black h-5 px-1.5 uppercase ${connector.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {connector.status === 'active' ? 'Operational' : 'Failed'}
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
