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

const MOCK_ALLOCATIONS: AllocationWithDetails[] = [
  { id: 1, skuId: 101, rackId: 1, quantity: 50, inboundDate: "2023-11-15T10:00:00Z", skuName: "Wireless Headphones", skuCode: "WH-001", rackName: "Rack A-1" },
  { id: 2, skuId: 102, rackId: 2, quantity: 30, inboundDate: "2024-01-05T14:30:00Z", skuName: "Gaming Mouse", skuCode: "GM-002", rackName: "Rack B-2" },
  { id: 3, skuId: 103, rackId: 3, quantity: 100, inboundDate: "2023-10-20T09:15:00Z", skuName: "Mechanical Keyboard", skuCode: "MK-003", rackName: "Rack C-3" },
  { id: 4, skuId: 104, rackId: 4, quantity: 20, inboundDate: "2024-01-10T16:45:00Z", skuName: "USB-C Hub", skuCode: "UH-004", rackName: "Rack D-4" },
];

export default function StockAgeing() {
  const { data: serverAllocations } = useQuery<AllocationWithDetails[]>({ 
    queryKey: ["/api/racks/allocations"] 
  });

  const allocations = serverAllocations && serverAllocations.length > 0 ? serverAllocations : MOCK_ALLOCATIONS;

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
