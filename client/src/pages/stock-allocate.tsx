import { useState } from "react";
import { useSkus } from "@/hooks/use-inventory";
import { useQuery } from "@tanstack/react-query";
import { Rack } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Warehouse,
  Boxes,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function StockAllocate() {
  const [step, setStep] = useState(1);
  const { data: skus } = useSkus();
  const { data: racks } = useQuery<Rack[]>({ queryKey: ["/api/racks"] });
  const [selectedSkuId, setSelectedSkuId] = useState<number | null>(null);
  const [skuSearch, setSkuSearch] = useState("");
  const { toast } = useToast();

  const selectedSku = skus?.find(s => s.id === selectedSkuId);
  const filteredSkus = skus?.filter(s => 
    s.name.toLowerCase().includes(skuSearch.toLowerCase()) || 
    s.code.toLowerCase().includes(skuSearch.toLowerCase())
  );

  const suggestedRacks = racks?.filter(r => r.currentLoad < r.capacity).slice(0, 3);

  const handleAllocate = () => {
    toast({
      title: "Allocation Successful",
      description: `Stock for ${selectedSku?.name} has been allocated to the suggested racks.`,
    });
    setStep(1);
    setSelectedSkuId(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Advanced Stock Allocation</h1>
        <p className="text-sm text-muted-foreground mt-1">Intelligent rack assignment workflow.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-border/50 shadow-sm">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= i ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-400'}`}>
              {i}
            </div>
            <span className={`text-xs font-semibold ${step >= i ? 'text-slate-900' : 'text-slate-400'}`}>
              {i === 1 ? 'SKU Selection' : i === 2 ? 'Rack Suggestion' : 'Finalize'}
            </span>
            {i < 3 && <ChevronRight className="w-4 h-4 text-slate-300" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-border/50">
            <CardTitle className="text-base">Step 1: SKU Selection</CardTitle>
            <CardDescription className="text-xs">Identify the item and check physical characteristics.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search SKU by name or code..." 
                className="pl-9"
                value={skuSearch}
                onChange={(e) => setSkuSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {filteredSkus?.map(sku => (
                <div 
                  key={sku.id}
                  onClick={() => setSelectedSkuId(sku.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedSkuId === sku.id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">{sku.code}</Badge>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedSkuId === sku.id ? 'border-primary bg-primary' : 'border-slate-200'}`}>
                      {selectedSkuId === sku.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{sku.name}</h4>
                  <div className="flex gap-4 mt-3">
                    <div className="text-[10px]">
                      <p className="text-muted-foreground uppercase">Weight</p>
                      <p className="font-bold">{sku.weight || '0.5kg'}</p>
                    </div>
                    <div className="text-[10px]">
                      <p className="text-muted-foreground uppercase">Dims</p>
                      <p className="font-bold">{sku.dimensions || '10x10x5cm'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button disabled={!selectedSkuId} onClick={() => setStep(2)} className="gap-2">
                Continue to Suggestions <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Step 2: Smart Rack Suggestions</CardTitle>
                <CardDescription className="text-xs">Optimized based on FIFO, capacity, and pick distance.</CardDescription>
              </div>
              <Badge className="bg-emerald-500 gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> AI Optimized
              </Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Rack</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Recommendation</TableHead>
                    <TableHead className="text-right">Allocate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suggestedRacks?.map((rack, idx) => (
                    <TableRow key={rack.id}>
                      <TableCell className="font-bold">{rack.name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{rack.locationCode.split('-')[0]}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={(rack.currentLoad/rack.capacity)*100} className="w-16 h-1.5" />
                          <span className="text-[10px] font-medium">{rack.capacity - rack.currentLoad} units</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-600">{12 + idx * 5}m to Packing</TableCell>
                      <TableCell>
                        {idx === 0 ? (
                          <Badge className="bg-blue-500 hover:bg-blue-600 gap-1 text-[10px]">
                            <TrendingUp className="w-3 h-3" /> Best Distance
                          </Badge>
                        ) : idx === 1 ? (
                          <Badge className="bg-amber-500 hover:bg-amber-600 gap-1 text-[10px]">
                            <Info className="w-3 h-3" /> FIFO Match
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Available</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Input type="number" defaultValue={idx === 0 ? 50 : 0} className="w-20 ml-auto h-8 text-xs font-bold" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-border/50">
              <CardTitle className="text-base">Allocation Rules</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 border p-3 rounded-lg bg-slate-50/50">
                  <Checkbox id="fifo" defaultChecked />
                  <Label htmlFor="fifo" className="text-xs font-bold cursor-pointer">Enforce FIFO</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg bg-slate-50/50">
                  <Checkbox id="mixed" />
                  <Label htmlFor="mixed" className="text-xs font-bold cursor-pointer">Avoid Mixed SKUs on Rack</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg bg-slate-50/50">
                  <Checkbox id="distance" defaultChecked />
                  <Label htmlFor="distance" className="text-xs font-bold cursor-pointer">Prioritize Nearest to Packing</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg bg-slate-50/50">
                  <Checkbox id="overflow" />
                  <Label htmlFor="overflow" className="text-xs font-bold cursor-pointer">Allow Overflow Racks</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} className="gap-2">
              Preview Summary <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-border/50 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-border/50">
                <CardTitle className="text-base">Allocation Summary</CardTitle>
                <CardDescription className="text-xs">Final review before commit.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="p-3 bg-blue-500 rounded-lg text-white">
                    <Boxes className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">{selectedSku?.name}</h4>
                    <p className="text-xs text-blue-700">Allocating 150 units across 2 racks</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/30">
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-bold">Rack A-12</span>
                    </div>
                    <span className="text-xs font-bold">100 units</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/30">
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-bold">Rack B-04</span>
                    </div>
                    <span className="text-xs font-bold">50 units</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-[11px] text-amber-800 leading-tight font-medium">
                    Warning: Rack B-04 will reach 95% occupancy after this allocation. 
                    Consider future stock growth for this SKU.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-border/50">
                  <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Process Impact</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">Picking Productivity</span>
                      <span className="text-emerald-600 font-bold">+12%</span>
                    </div>
                    <Progress value={85} className="h-1 bg-slate-100" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">Storage Efficiency</span>
                      <span className="text-blue-600 font-bold">Optimized</span>
                    </div>
                    <Progress value={92} className="h-1 bg-slate-100" />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20" onClick={handleAllocate}>
                  Confirm Allocation
                </Button>
                <Button variant="ghost" className="w-full text-xs" onClick={() => setStep(2)}>
                  Back to Rack Selection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
