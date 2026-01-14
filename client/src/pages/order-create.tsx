import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sku } from "@shared/schema";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function OrderCreate() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: skus } = useQuery<Sku[]>({ queryKey: ["/api/skus"] });
  const [selectedItems, setSelectedItems] = useState<{ skuId: number, quantity: number }[]>([]);

  const form = useForm({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: "",
      type: "Manual",
      status: "pending",
      totalQuantity: 0
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      await apiRequest("POST", "/api/orders", { ...values, items: selectedItems });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Success", description: "Order created successfully" });
      setLocation("/orders");
    }
  });

  const addItem = () => {
    setSelectedItems([...selectedItems, { skuId: 0, quantity: 1 }]);
  };

  const removeItem = (idx: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: number) => {
    const newItems = [...selectedItems];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setSelectedItems(newItems);
    
    const total = newItems.reduce((acc, item) => acc + item.quantity, 0);
    form.setValue("totalQuantity", total);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Manual Order</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Order Basics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order ID</FormLabel>
                      <FormControl><Input {...field} readOnly /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl><Input placeholder="Client Name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Type</span>
                  <Badge>Manual</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-muted-foreground">Total Quantity</span>
                  <span className="text-2xl font-bold">{form.watch("totalQuantity")}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>SKU Selection</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2">
                  <div className="flex-1 space-y-2">
                    <Label>SKU</Label>
                    <Select onValueChange={(v) => updateItem(idx, "skuId", parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select SKU" />
                      </SelectTrigger>
                      <SelectContent>
                        {skus?.map(sku => (
                          <SelectItem key={sku.id} value={sku.id.toString()}>{sku.code} - {sku.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value))} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {selectedItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No items added. Click "Add Item" to start.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setLocation("/orders")}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending || selectedItems.length === 0}>Create Order</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      {children}
    </span>
  );
}
