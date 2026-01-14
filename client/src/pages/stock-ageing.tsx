import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Ageing</h1>
          <p className="text-muted-foreground">Inventory health and risk assessment</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">Total Aged Qty</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalQty}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">Total Aged Value</span>
            </div>
            <div className="text-2xl font-bold">${(stats.totalValue / 100).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Dead Stock Qty</span>
            </div>
            <div className="text-2xl font-bold text-destructive">{stats.deadStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">% Over 90 Days</span>
            </div>
            <div className="text-2xl font-bold">{stats.agedPercent}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2 flex-1">
              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  <SelectItem value="Main">Main Warehouse</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[180px]">
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
                <SelectTrigger className="w-[180px]">
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Inbound Date</TableHead>
                <TableHead>Age (Days)</TableHead>
                <TableHead>Bucket</TableHead>
                <TableHead>Qty (Avail/Res)</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Loading ageing report...
                  </TableCell>
                </TableRow>
              ) : filteredData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData?.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.skuCode}</span>
                        <span className="text-xs text-muted-foreground">{item.skuName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>{item.warehouse}</span>
                        <span className="text-muted-foreground">{item.zone} / {item.rack}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.inboundDate ? format(new Date(item.inboundDate), "MMM dd, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell>{item.age}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.ageingBucket}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.availableQty} / <span className="text-muted-foreground">{item.reservedQty}</span>
                    </TableCell>
                    <TableCell>${(item.inventoryValue / 100).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        item.riskLevel === "High" ? "destructive" :
                        item.riskLevel === "Medium" ? "default" :
                        "secondary"
                      }>
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
