import { useOrder, useUpdateOrderStatus } from "@/hooks/use-orders";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Truck, Package, ClipboardCheck, Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const TIMELINE_STEPS = [
  { id: 'pending', label: 'Order Received', icon: Clock },
  { id: 'in-process', label: 'Picking', icon: ClipboardCheck },
  { id: 'packed', label: 'Packed', icon: Package },
  { id: 'manifested', label: 'Manifested', icon: Check },
  { id: 'dispatched', label: 'Dispatched', icon: Truck },
];

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const id = Number(params?.id);
  const { data: order, isLoading } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();

  if (isLoading || !order) return <div className="p-8">Loading order details...</div>;

  const currentStepIndex = TIMELINE_STEPS.findIndex(step => 
    step.id === order.status || 
    (order.status === 'completed' && step.id === 'dispatched')
  );

  const handleAdvanceStatus = () => {
    const nextStatus = TIMELINE_STEPS[currentStepIndex + 1]?.id;
    if (nextStatus) {
      updateStatus.mutate({ id, status: nextStatus });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{order.orderId}</h1>
            <Badge className="capitalize text-base px-3 py-1">{order.status.replace("-", " ")}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">Customer: {order.customer} • Created on {new Date(order.createdAt!).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto">
          {currentStepIndex < TIMELINE_STEPS.length - 1 && (
            <Button onClick={handleAdvanceStatus} disabled={updateStatus.isPending} className="bg-primary">
              Advance to {TIMELINE_STEPS[currentStepIndex + 1].label}
            </Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 z-0" />
        <div className="relative z-10 flex justify-between">
          {TIMELINE_STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-4">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                  ${isCompleted 
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "bg-background border-muted text-muted-foreground"
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Assorted Items</p>
                    <p className="text-sm text-muted-foreground">Total Quantity: {order.totalQuantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">x{order.totalQuantity}</p>
                </div>
              </div>
              {/* In a real app, we'd fetch actual order items relation here */}
              <p className="text-sm text-muted-foreground italic text-center py-4">Detailed line items would appear here.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p>{order.customer}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p>{order.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Order ID</p>
              <p className="font-mono">{order.orderId}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
