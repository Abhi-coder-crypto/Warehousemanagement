import { useSkus, useCreateSku, useDeleteSku } from "@/hooks/use-inventory";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSkuSchema, type InsertSku } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2, Search, Filter, Edit2, Grid3X3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function Inventory() {
  const { data: skus, isLoading } = useSkus();
  const deleteSku = useDeleteSku();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  const filteredSkus = skus?.filter((sku) =>
    sku.name.toLowerCase().includes(search.toLowerCase()) ||
    sku.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-2">Manage products, stock levels, and locations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => {
            const csvContent = "data:text/csv;charset=utf-8," + 
              "SKU Code,Name,Category,Location,Status,Quantity\n" +
              filteredSkus?.map(s => `${s.code},${s.name},${s.category},${s.location},${s.status},${s.quantity}`).join("\n");
            window.open(encodeURI(csvContent));
          }}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => setLocation("/inventory/storage")}>
            <Grid3X3 className="w-4 h-4 mr-2" /> Storage View
          </Button>
          <CreateSkuDialog open={open} onOpenChange={setOpen} />
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by SKU name or code..."
            className="pl-9 border-border/50 bg-background/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>SKU Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading inventory...</TableCell></TableRow>
            ) : filteredSkus?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No items found.</TableCell></TableRow>
            ) : (
              filteredSkus?.map((sku) => (
                <TableRow key={sku.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-mono font-medium">{sku.code}</TableCell>
                  <TableCell className="font-medium">{sku.name}</TableCell>
                  <TableCell>{sku.category}</TableCell>
                  <TableCell>{sku.location || "Unassigned"}</TableCell>
                  <TableCell>
                    <Badge variant={sku.status === 'active' ? 'default' : 'secondary'} className={sku.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                      {sku.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={sku.quantity < 10 ? "text-destructive font-bold" : "text-foreground"}>
                      {sku.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => setLocation(`/inventory/edit/${sku.id}`)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this SKU?')) {
                            deleteSku.mutate(sku.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreateSkuDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createSku = useCreateSku();
  const form = useForm<InsertSku>({
    resolver: zodResolver(insertSkuSchema),
    defaultValues: {
      code: "",
      name: "",
      category: "",
      quantity: 0,
      status: "active",
      location: "",
      dimensions: "",
      weight: "",
    },
  });

  const onSubmit = (data: InsertSku) => {
    createSku.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
          <Plus className="w-4 h-4 mr-2" /> Add SKU
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New SKU</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU Code</FormLabel>
                    <FormControl><Input placeholder="E.g., SKU-001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input placeholder="E.g., Electronics" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl><Input placeholder="E.g., Wireless Mouse" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl><Input placeholder="E.g., A-12" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createSku.isPending}>
                {createSku.isPending ? "Creating..." : "Create SKU"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
