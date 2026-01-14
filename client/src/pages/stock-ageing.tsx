import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays, format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface AllocationWithDetails {
  id: number;
  skuId: number;
  rackId: number;
  quantity: number;
  inboundDate: string;
  skuName: string;
  skuCode: string;
  rackName: string;
}

export default function StockAgeing() {
  const { data: allocations } = useQuery<AllocationWithDetails[]>({ 
    queryKey: ["/api/racks/allocations"] 
  });

  const calculateAge = (date: string) => {
    return differenceInDays(new Date(), new Date(date));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Stock Ageing Report</h1>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Ageing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU Code</TableHead>
                <TableHead>SKU Name</TableHead>
                <TableHead>Rack</TableHead>
                <TableHead>Inbound Date</TableHead>
                <TableHead>Age (Days)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations?.map((alloc) => {
                const age = calculateAge(alloc.inboundDate);
                return (
                  <TableRow key={alloc.id}>
                    <TableCell className="font-medium">{alloc.skuCode}</TableCell>
                    <TableCell>{alloc.skuName}</TableCell>
                    <TableCell>{alloc.rackName}</TableCell>
                    <TableCell>{format(new Date(alloc.inboundDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{age} days</TableCell>
                    <TableCell>
                      <Badge variant={age > 30 ? "destructive" : "secondary"}>
                        {age > 30 ? "Old Stock" : "Fresh"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!allocations || allocations.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No allocated stock data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
