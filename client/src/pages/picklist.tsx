import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Plus, Filter, X, Check, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Picklist() {
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const { data: picklists, isLoading } = useQuery<any[]>({
    queryKey: ["/api/picklists"],
  });

  const { data: orders } = useQuery<any[]>({
    queryKey: ["/api/orders"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/picklists", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/picklists"] });
      setShowForm(false);
      toast({ title: "Picklist created successfully" });
    },
  });

  const form = useForm({
    defaultValues: {
      orderId: "",
      priority: "Medium",
      warehouse: "Main Warehouse",
    }
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({
      orderIds: [parseInt(data.orderId)],
      priority: data.priority,
      warehouse: data.warehouse,
      items: [] // In a real app, this would be populated based on the order
    });
  };

  const filteredPicklists = picklists?.filter(p => {
    const matchesPriority = priorityFilter === "all" || p.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesSearch = p.id.toString().includes(searchTerm);
    return matchesPriority && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Picklists</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and track warehouse picking operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-9 text-xs font-semibold border-slate-200 shadow-sm">
            <Download className="w-4 h-4" /> Export Summary
          </Button>
          {!showForm && (
            <Button size="sm" className="gap-2 h-9 text-xs font-semibold" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" /> Create Picklist
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <Card className="border-border/50 shadow-md">
          <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">New Picklist</CardTitle>
                <CardDescription className="text-xs">Create a new picklist for pending orders</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Select Order</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-slate-200">
                            <SelectValue placeholder="Choose an order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {orders?.filter(o => o.status === 'pending').map(order => (
                            <SelectItem key={order.id} value={order.id.toString()}>
                              {order.orderId} - {order.customer}
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-slate-200">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="warehouse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Warehouse</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-slate-200">
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Main Warehouse">Main Warehouse</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-border/50">
                  <Button variant="outline" type="button" onClick={() => setShowForm(false)} className="h-10 px-6">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="h-10 px-8 gap-2">
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Generate Picklist
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/40">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Picklist ID..."
                className="pl-8 h-9 border-slate-200 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] h-9 text-[10px] font-bold uppercase border-slate-200">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 text-[10px] font-bold uppercase border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b border-border/50">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Picklist ID</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Priority</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Warehouse</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Total SKUs</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Total Qty</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Assigned Picker</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-xs font-bold uppercase">
                    Loading picklists...
                  </TableCell>
                </TableRow>
              ) : filteredPicklists?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-xs font-bold uppercase">
                    No picklists found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPicklists?.map((p) => (
                  <TableRow key={p.id} className="border-b border-border/40 hover:bg-slate-50/30 transition-colors">
                    <TableCell className="font-mono text-sm font-bold text-slate-900 py-4">PK-{p.id.toString().padStart(4, '0')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] font-bold h-5 px-1.5 uppercase ${p.priority === "High" ? "bg-red-50 text-red-700 border-red-100" : p.priority === "Medium" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-50 text-slate-600 border-slate-100"}`}>
                        {p.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[11px] font-semibold text-slate-600 uppercase">{p.warehouse}</TableCell>
                    <TableCell className="text-sm font-bold text-slate-900">{p.skuCount}</TableCell>
                    <TableCell className="text-sm font-bold text-slate-900">{p.totalQty}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold h-5 px-1.5 uppercase ${
                        p.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        p.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-medium">{p.pickerName || "Unassigned"}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/orders/picklist/${p.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50">View Details</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
