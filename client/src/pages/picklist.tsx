import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Order, Sku, Rack } from "@shared/schema";
import { Package, Truck, AlertTriangle, Boxes } from "lucide-react";

export default function Picklist() {
  const { data: orders } = useQuery<Order[]>({ queryKey: ["/api/orders"] });
  const { data: skus } = useQuery<Sku[]>({ queryKey: ["/api/skus"] });

  // Mock mapping for picklist display
  const pickingItems = orders?.filter(o => o.status === 'pending' || o.status === 'in-process').flatMap(order => [
    {
      id: order.id,
      orderId: order.orderId,
      skuCode: "SKU-001",
      skuName: "Wireless Mouse",
      quantity: 2,
      location: "Rack A, Zone 1",
      status: "Pending"
    },
    {
      id: order.id,
      orderId: order.orderId,
      skuCode: "SKU-002",
      skuName: "Mechanical Keyboard",
      quantity: 1,
      location: "Rack A, Zone 1",
      status: "Pending"
    }
  ]) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Picklist</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items to Pick</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>SKU Code</TableHead>
                <TableHead>SKU Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pickingItems.map((item, i) => (
                <TableRow key={`${item.orderId}-${i}`}>
                  <TableCell className="font-medium">{item.orderId}</TableCell>
                  <TableCell>{item.skuCode}</TableCell>
                  <TableCell>{item.skuName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex w-fit gap-1">
                      <Boxes className="h-3 w-3" />
                      {item.location}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {item.status}
                    </Badge>
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
