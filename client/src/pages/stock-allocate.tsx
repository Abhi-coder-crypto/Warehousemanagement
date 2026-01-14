import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStockAllocationSchema, Sku, Rack } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Form, FormControl,FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function StockAllocate() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: skus } = useQuery<Sku[]>({ queryKey: ["/api/skus"] });
  const { data: racks } = useQuery<Rack[]>({ queryKey: ["/api/racks"] });

  const form = useForm({
    resolver: zodResolver(insertStockAllocationSchema),
    defaultValues: {
      skuId: 0,
      rackId: 0,
      quantity: 0
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      await apiRequest("POST", "/api/racks/allocate", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/racks/allocations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/racks"] });
      toast({ title: "Success", description: "Stock allocated successfully" });
      setLocation("/storage/ageing");
    }
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Stock Allocation</h1>

      <Card>
        <CardHeader>
          <CardTitle>Assign SKU to Rack</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="skuId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select SKU</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a SKU" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {skus?.map(sku => (
                          <SelectItem key={sku.id} value={sku.id.toString()}>
                            {sku.code} - {sku.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rackId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Rack</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Rack" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {racks?.map(rack => (
                          <SelectItem key={rack.id} value={rack.id.toString()}>
                            {rack.name} ({rack.locationCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                Allocate Stock
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
