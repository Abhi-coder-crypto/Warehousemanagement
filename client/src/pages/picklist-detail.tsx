import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, MapPin, AlertCircle, CheckCircle2, Play, Pause, Square, Printer, Download } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PicklistDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: picklist } = useQuery<any>({ queryKey: [`/api/picklists/${id}`] });
  const { data: items, isLoading } = useQuery<any[]>({ queryKey: [`/api/picklists/${id}/items`] });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await apiRequest("PATCH", `/api/picklists/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/picklists/${id}`] });
      toast({ title: "Status Updated", description: "Picklist status has been updated successfully." });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: number, updates: any }) => {
      await apiRequest("PATCH", `/api/picklist-items/${itemId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/picklists/${id}/items`] });
    }
  });

  if (!picklist) return <div className="p-8 text-center">Loading picklist...</div>;

  const totalRequired = items?.reduce((acc, i) => acc + i.requiredQty, 0) || 0;
  const totalPicked = items?.reduce((acc, i) => acc + i.pickedQty, 0) || 0;
  const progress = totalRequired > 0 ? (totalPicked / totalRequired) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">PK-{id?.padStart(4, '0')}</h1>
            <Badge variant={picklist.priority === "High" ? "destructive" : "secondary"}>
              {picklist.priority} Priority
            </Badge>
            <Badge variant="outline">{picklist.status}</Badge>
          </div>
          <p className="text-muted-foreground">{picklist.warehouse} • {items?.length} SKUs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <div className="h-8 w-px bg-border mx-2" />
          {picklist.status === "Not Started" && (
            <Button size="sm" onClick={() => updateStatusMutation.mutate("In Progress")}>
              <Play className="mr-2 h-4 w-4" /> Start Picking
            </Button>
          )}
          {picklist.status === "In Progress" && (
            <>
              <Button variant="outline" size="sm" onClick={() => updateStatusMutation.mutate("Paused")}>
                <Pause className="mr-2 h-4 w-4" /> Pause
              </Button>
              <Button size="sm" onClick={() => updateStatusMutation.mutate("Completed")}>
                <Square className="mr-2 h-4 w-4" /> Complete
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{totalPicked} / {totalRequired} Units</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <TableHeader className="sticky top-0 bg-background z-10 border-b">
          <TableRow>
            <TableHead className="w-16">Seq</TableHead>
            <TableHead>Location Details</TableHead>
            <TableHead>SKU Information</TableHead>
            <TableHead>Qty (Req/Picked)</TableHead>
            <TableHead>UOM</TableHead>
            <TableHead>Handling</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">Loading items...</TableCell>
                </TableRow>
              ) : items?.map((item) => (
                <TableRow key={item.id} className={item.status === "Short" ? "bg-destructive/5" : ""}>
                  <TableCell className="font-mono text-xs">{item.pickSequence}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-bold flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {item.zone}
                      </span>
                      <span>Rack: {item.rack} / Bin: {item.bin}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.skuCode}</span>
                      <span className="text-xs text-muted-foreground">{item.skuName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{item.requiredQty}</span>
                      <span className="text-muted-foreground">/</span>
                      <Input 
                        type="number" 
                        className="w-16 h-8 text-sm" 
                        value={item.pickedQty}
                        onChange={(e) => updateItemMutation.mutate({ 
                          itemId: item.id, 
                          updates: { pickedQty: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{item.uom}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {item.handling}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      item.status === "Picked" ? "secondary" :
                      item.status === "Short" ? "destructive" :
                      "outline"
                    }>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select 
                      value={item.shortPickReason || "none"} 
                      onValueChange={(val) => updateItemMutation.mutate({ 
                        itemId: item.id, 
                        updates: { 
                          shortPickReason: val === "none" ? null : val,
                          status: val === "none" ? "Pending" : "Short"
                        }
                      })}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="Short Reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Clear</SelectItem>
                        <SelectItem value="Damaged">Damaged</SelectItem>
                        <SelectItem value="Missing">Missing</SelectItem>
                        <SelectItem value="Not Found">Not Found</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
