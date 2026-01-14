import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRackSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StorageCreate() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm({
    resolver: zodResolver(insertRackSchema),
    defaultValues: {
      name: "",
      locationCode: "",
      capacity: 0
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      await apiRequest("POST", "/api/racks", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/racks"] });
      toast({ title: "Success", description: "Storage rack created successfully" });
      setLocation("/storage");
    }
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Storage Rack</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Rack Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rack Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Rack A" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Code</FormLabel>
                    <FormControl><Input placeholder="e.g. Zone 1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Capacity (Units)</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setLocation("/storage")}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={mutation.isPending}>Create Rack</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
