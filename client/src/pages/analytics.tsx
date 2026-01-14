import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Package, 
  ArrowUpRight,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Monochromatic Blue palette
const COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

const productivityData = [
  { day: 'Mon', fulfillment: 94, efficiency: 88 },
  { day: 'Tue', fulfillment: 97, efficiency: 92 },
  { day: 'Wed', fulfillment: 91, efficiency: 85 },
  { day: 'Thu', fulfillment: 98, efficiency: 95 },
  { day: 'Fri', fulfillment: 95, efficiency: 90 },
  { day: 'Sat', fulfillment: 88, efficiency: 82 },
  { day: 'Sun', fulfillment: 92, efficiency: 87 },
];

const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Apparel', value: 300 },
  { name: 'Home & Kitchen', value: 300 },
  { name: 'Toys', value: 200 },
  { name: 'Books', value: 278 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Advanced Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Deep dive into warehouse operational efficiency.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-slate-50 text-blue-700 border-blue-200">
            System Live
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Storage ROI</p>
              <h3 className="text-xl font-bold">12.4%</h3>
              <p className="text-[10px] text-blue-600 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3 h-3" /> +2.1%
              </p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Labor Efficiency</p>
              <h3 className="text-xl font-bold">94.2%</h3>
              <p className="text-[10px] text-blue-600 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3 h-3" /> +0.8%
              </p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stock Turnover</p>
              <h3 className="text-xl font-bold">4.8x</h3>
              <p className="text-[10px] text-slate-600 flex items-center gap-0.5 font-bold">
                <Activity className="w-3 h-3" /> Stable
              </p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Order Density</p>
              <h3 className="text-xl font-bold">8.2/hr</h3>
              <p className="text-[10px] text-blue-600 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3 h-3" /> +1.4
              </p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-blue-600">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold">Performance Trends</CardTitle>
            <CardDescription className="text-xs">Fulfillment vs Labor Efficiency over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData}>
                <defs>
                  <linearGradient id="colorFul" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="fulfillment" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFul)" strokeWidth={2} />
                <Area type="monotone" dataKey="efficiency" stroke="#94a3b8" fillOpacity={1} fill="url(#colorEff)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold">Volume by Category</CardTitle>
            <CardDescription className="text-xs">Inventory throughput distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold">Space Utilization Heatmap</CardTitle>
          <CardDescription className="text-xs">Utilization intensity by warehouse zone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {Array.from({ length: 16 }).map((_, i) => {
              const value = Math.floor(Math.random() * 100);
              return (
                <div 
                  key={i} 
                  className="aspect-square rounded flex items-center justify-center text-[10px] font-bold transition-all hover:scale-105 cursor-help"
                  style={{ 
                    backgroundColor: '#3b82f6',
                    opacity: 0.1 + (value / 100) * 0.9,
                    color: value > 50 ? 'white' : 'black'
                  }}
                  title={`Zone ${String.fromCharCode(65 + i)}: ${value}% Utilized`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-medium">
              <div className="w-2.5 h-2.5 rounded bg-[#3b82f6] opacity-20" /> Low (0-50%)
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-medium">
              <div className="w-2.5 h-2.5 rounded bg-[#3b82f6] opacity-60" /> Medium (50-80%)
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-medium">
              <div className="w-2.5 h-2.5 rounded bg-[#3b82f6]" /> High (80%+)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
