import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Filter, TrendingDown, Package, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function StockAgeing() {
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [bucketFilter, setBucketFilter] = useState("all");

  const { data: ageingData, isLoading } = useQuery<any[]>({
    queryKey: ["/api/stock/ageing"],
  });

  const filteredData = ageingData?.filter(item => {
    const matchesWarehouse = warehouseFilter === "all" || item.warehouse === warehouseFilter;
    const matchesRisk = riskFilter === "all" || item.riskLevel === riskFilter;
    const matchesBucket = bucketFilter === "all" || item.ageingBucket === bucketFilter;
    return matchesWarehouse && matchesRisk && matchesBucket;
  });

  const stats = {
    totalQty: ageingData?.reduce((acc, item) => acc + item.availableQty, 0) || 0,
    totalValue: ageingData?.reduce((acc, item) => acc + item.inventoryValue, 0) || 0,
    deadStock: ageingData?.filter(item => item.age > 90).reduce((acc, item) => acc + item.availableQty, 0) || 0,
    agedPercent: ageingData ? (ageingData.filter(item => item.age > 90).length / ageingData.length * 100).toFixed(1) : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stock Ageing</h1>
          <p className="text-sm text-muted-foreground mt-1">Inventory health and risk assessment across zones.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Aged Qty</p>
              <h3 className="text-2xl font-bold tracking-tight">{stats.totalQty}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Aged Value</p>
              <h3 className="text-2xl font-bold tracking-tight">₹{(stats.totalValue / 100).toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dead Stock Qty</p>
              <h3 className="text-2xl font-bold tracking-tight text-red-600">{stats.deadStock}</h3>
            </div>
            <div className="p-2.5 bg-red-50 rounded-lg text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">% Over 90 Days</p>
              <h3 className="text-2xl font-bold tracking-tight">{stats.agedPercent}%</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/30">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <CardTitle className="text-base font-bold">Inventory Records</CardTitle>
            <div className="flex gap-2">
              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger className="w-[150px] h-8 text-xs">
                  <SelectValue placeholder="Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  <SelectItem value="Main">Main Warehouse</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[150px] h-8 text-xs">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="High">High Risk</SelectItem>
                  <SelectItem value="Medium">Medium Risk</SelectItem>
                  <SelectItem value="Low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
              <Select value={bucketFilter} onValueChange={setBucketFilter}>
                <SelectTrigger className="w-[150px] h-8 text-xs">
                  <SelectValue placeholder="Ageing Bucket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buckets</SelectItem>
                  <SelectItem value="0–30">0-30 Days</SelectItem>
                  <SelectItem value="31–60">31-60 Days</SelectItem>
                  <SelectItem value="61–90">61-90 Days</SelectItem>
                  <SelectItem value="90+">90+ Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b border-border/50">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">SKU Details</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Category</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Location</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Inbound Date</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Age (Days)</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Bucket</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Qty (Avail/Res)</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Value</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                    Loading ageing report...
                  </TableCell>
                </TableRow>
              ) : filteredData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                    No records found matching current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData?.map((item, idx) => (
                  <TableRow key={idx} className="border-b border-border/40 hover:bg-slate-50/30 transition-colors">
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{item.skuCode}</span>
                        <span className="text-[10px] text-muted-foreground">{item.skuName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{item.category}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-[10px]">
                        <span className="font-medium text-slate-900">{item.warehouse}</span>
                        <span className="text-muted-foreground">{item.zone} / {item.rack}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px] text-slate-500">
                      {item.inboundDate ? format(new Date(item.inboundDate), "MMM dd, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-700">{item.age}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] h-5 px-1.5 font-medium ${
                        item.age > 90 ? "bg-red-50 text-red-700 border-red-200" :
                        item.age > 60 ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {item.ageingBucket} Days
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="font-bold text-slate-900">{item.availableQty}</span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span className="text-slate-500">{item.reservedQty}</span>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-slate-900">
                      ₹{(item.inventoryValue / 100).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="default"
                        className={`text-[10px] h-5 px-1.5 font-bold ${
                          item.riskLevel === "High" ? "bg-red-500 hover:bg-red-600" :
                          item.riskLevel === "Medium" ? "bg-amber-500 hover:bg-amber-600" :
                          "bg-emerald-500 hover:bg-emerald-600"
                        }`}
                      >
                        {item.riskLevel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
