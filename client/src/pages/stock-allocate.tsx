import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sku, Rack } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Boxes, MapPin, Save, Clock } from "lucide-react";

export default function StockAllocate() {
  const { data: skus } = useQuery<Sku[]>({ queryKey: ["/api/skus"] });
  const { data: racks } = useQuery<Rack[]>({ queryKey: ["/api/racks"] });
  const [selectedSkuId, setSelectedSkuId] = useState<number | null>(null);
  const [skuSearch, setSkuSearch] = useState("");
  const [allocations, setAllocations] = useState<Record<number, number>>({});
  const { toast } = useToast();

  const selectedSku = skus?.find(s => s.id === selectedSkuId);
  const filteredSkus = skus?.filter(s => 
    s.name.toLowerCase().includes(skuSearch.toLowerCase()) || 
    s.code.toLowerCase().includes(skuSearch.toLowerCase())
  );

  const totalAllocated = Object.values(allocations).reduce((acc, val) => acc + (val || 0), 0);
  const remaining = (selectedSku?.quantity || 0) - totalAllocated;

  const allocateMutation = useMutation({
    mutationFn: async (_isPartial: boolean) => {
      for (const [rackId, quantity] of Object.entries(allocations)) {
        if (quantity > 0) {
          await apiRequest("POST", "/api/racks/allocate", {
            skuId: selectedSkuId,
            rackId: parseInt(rackId),
            quantity
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/racks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skus"] });
      toast({ title: "Allocation Saved", description: "Stock has been successfully allocated." });
      setAllocations({});
      setSelectedSkuId(null);
    }
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Stock Allocation</h1>
      </div>

      {!selectedSkuId ? (
        <Card>
          <CardHeader>
            <CardTitle>Select SKU to Allocate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search SKU..." 
                className="pl-9"
                value={skuSearch}
                onChange={(e) => setSkuSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkus?.filter(s => s.quantity > 0).map(sku => (
                <div 
                  key={sku.id}
                  onClick={() => setSelectedSkuId(sku.id)}
                  className="p-4 rounded-lg border hover:border-primary cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{sku.code}</Badge>
                    <Badge variant="secondary">{sku.quantity} Units</Badge>
                  </div>
                  <h4 className="font-bold">{sku.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{sku.category}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <Card className="bg-slate-50 border-none shadow-none">
            <CardContent className="pt-6 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Boxes className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedSku?.name}</h2>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{selectedSku?.code}</Badge>
                    <Badge variant="secondary">Normal Handling</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Total to Allocate</p>
                <p className="text-3xl font-black text-primary">{selectedSku?.quantity}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Available Racks */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Available Racks</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rack</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Current SKU</TableHead>
                      <TableHead className="w-32 text-right">Allocate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {racks?.map(rack => (
                      <TableRow key={rack.id}>
                        <TableCell className="font-bold">{rack.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center w-fit gap-1">
                            <MapPin className="w-3 h-3" /> {rack.locationCode}
                          </Badge>
                        </TableCell>
                        <TableCell>{rack.capacity - rack.currentLoad} Units</TableCell>
                        <TableCell className="text-xs text-muted-foreground italic">None</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            className="w-24 ml-auto h-8 text-right font-bold"
                            value={allocations[rack.id] || ""}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const maxAvailable = rack.capacity - rack.currentLoad;
                              const currentOtherAllocations = totalAllocated - (allocations[rack.id] || 0);
                              const maxPossible = Math.min(maxAvailable, (selectedSku?.quantity || 0) - currentOtherAllocations);
                              
                              setAllocations(prev => ({
                                ...prev,
                                [rack.id]: Math.max(0, Math.min(val, maxPossible))
                              }));
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Summary & Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Allocation Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Allocated</span>
                    <span className="font-bold">{totalAllocated}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className={`font-bold ${remaining > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                      {remaining}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium">FIFO: Oldest Stock First</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Button 
                  className="w-full h-11 font-bold" 
                  disabled={totalAllocated === 0 || allocateMutation.isPending}
                  onClick={() => allocateMutation.mutate(false)}
                >
                  <Save className="mr-2 h-4 w-4" /> Save Allocation
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-11"
                  disabled={totalAllocated === 0 || remaining === 0 || allocateMutation.isPending}
                  onClick={() => allocateMutation.mutate(true)}
                >
                  Allocate Remaining Later
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-xs" 
                  onClick={() => {
                    setSelectedSkuId(null);
                    setAllocations({});
                  }}
                >
                  Cancel & Select Different SKU
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
