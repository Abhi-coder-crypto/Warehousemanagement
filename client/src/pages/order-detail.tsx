import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { useParams, useLocation } from "wouter";
import { CheckCircle2, Clock, Package, Truck, FileText, ChevronRight, Boxes } from "lucide-react";
import { format } from "date-fns";

export default function OrderDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: order } = useQuery<Order>({ queryKey: [`/api/orders/${id}`] });

  if (!order) return <div className="p-8 text-center">Loading order...</div>;

  const steps = [
    { label: "Created", date: order.createdAt, icon: FileText, completed: !!order.createdAt },
    { label: "Picked", date: order.pickedAt, icon: Package, completed: !!order.pickedAt },
    { label: "Packed", date: order.packedAt, icon: Boxes, completed: !!order.packedAt },
    { label: "Manifested", date: order.manifestedAt, icon: Truck, completed: !!order.manifestedAt },
    { label: "Dispatched", date: order.dispatchedAt, icon: CheckCircle2, completed: !!order.dispatchedAt },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Order #{order.orderId}</h1>
          <p className="text-muted-foreground">Customer: {order.customer}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setLocation(`/orders/challan/${id}`)}>
            <FileText className="mr-2 h-4 w-4" /> Print Challan
          </Button>
          <Button onClick={() => setLocation("/orders")}>Back to Orders</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-muted">
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex items-center gap-6">
                  <div className={`
                    absolute left-0 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-background
                    ${step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                  `}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-12">
                    <p className={`font-semibold ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {step.date ? format(new Date(step.date), "MMM dd, yyyy HH:mm") : "Pending"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={order.status === 'breached' ? 'destructive' : 'secondary'}>
                {order.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Type</span>
              <span>{order.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Quantity</span>
              <span className="font-bold">{order.totalQuantity}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
