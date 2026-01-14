import { useQuery } from "@tanstack/react-query";
import { Sku } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function StorageView() {
  const { data: skus } = useQuery<Sku[]>({ queryKey: ["/api/skus"] });

  // Mock grid of bins
  const zones = ["Zone A", "Zone B", "Zone C"];
  const racksPerZone = 4;
  const binsPerRack = 6;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Inventory Storage View</h1>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-8">
          {zones.map(zone => (
            <div key={zone} className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">{zone}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: racksPerZone }).map((_, rIdx) => (
                  <Card key={rIdx}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Rack {rIdx + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2 p-3">
                      {Array.from({ length: binsPerRack }).map((_, bIdx) => {
                        const binId = `${zone[5]}${rIdx + 1}-${bIdx + 1}`;
                        const sku = skus?.find(s => s.location === binId);
                        
                        return (
                          <Tooltip key={bIdx}>
                            <TooltipTrigger asChild>
                              <div className={`
                                h-16 rounded border-2 border-dashed flex flex-col items-center justify-center transition-colors
                                ${sku ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground hover:bg-muted/50"}
                              `}>
                                <span className="text-[10px] font-bold">{binId}</span>
                                {sku && <Badge variant="secondary" className="scale-75 px-1 h-4">{sku.code}</Badge>}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-bold">{binId}</p>
                              {sku ? (
                                <>
                                  <p className="text-xs">{sku.name}</p>
                                  <p className="text-xs font-bold text-primary">Qty: {sku.quantity}</p>
                                </>
                              ) : (
                                <p className="text-xs">Empty Bin</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
