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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Search, Filter, Edit2, Grid3X3, Download } from "lucide-react";
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage products, stock levels, and locations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 h-9 text-xs font-semibold border-slate-200" onClick={() => {
            const csvContent = "data:text/csv;charset=utf-8," + 
              "SKU Code,Name,Category,Location,Status,Quantity\n" +
              filteredSkus?.map(s => `${s.code},${s.name},${s.category},${s.location},${s.status},${s.quantity}`).join("\n");
            window.open(encodeURI(csvContent));
          }}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="outline" className="h-9 text-xs font-semibold border-slate-200" onClick={() => setLocation("/inventory/storage")}>
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
            className="pl-9 h-9 border-border/50 bg-background/50 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 h-9 text-xs font-bold uppercase border-slate-200">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest">SKU Code</TableHead>
              <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest">Name</TableHead>
              <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest">Category</TableHead>
              <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest">Location</TableHead>
              <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
              <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest text-right">Quantity</TableHead>
              <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-xs font-bold uppercase text-muted-foreground">Loading inventory...</TableCell></TableRow>
            ) : filteredSkus?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-xs font-bold uppercase text-muted-foreground">No items found.</TableCell></TableRow>
            ) : (
              filteredSkus?.map((sku) => (
                <TableRow key={sku.id} className="hover:bg-slate-50/30 transition-colors border-b border-border/40">
                  <TableCell className="py-4 font-mono text-xs font-bold text-blue-700">{sku.code}</TableCell>
                  <TableCell className="py-4 text-sm font-semibold text-slate-900">{sku.name}</TableCell>
                  <TableCell className="py-4 text-xs font-medium text-slate-600 uppercase">{sku.category}</TableCell>
                  <TableCell className="py-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Grid3X3 className="w-3 h-3 text-slate-400" />
                      <span className="font-bold uppercase">{sku.location || "Unassigned"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={`text-[9px] font-bold uppercase h-5 ${sku.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                      {sku.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <span className={`text-sm font-bold ${sku.quantity < 10 ? "text-red-600" : "text-slate-900"}`}>
                      {sku.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => setLocation(`/inventory/edit/${sku.id}`)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this SKU?')) {
                            deleteSku.mutate(sku.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
      handlingType: "Normal",
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
        <Button className="h-9 text-xs font-semibold gap-2">
          <Plus className="w-4 h-4" /> Add SKU
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
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">SKU Code</FormLabel>
                    <FormControl><Input placeholder="E.g., SKU-001" {...field} className="h-9" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Category</FormLabel>
                    <FormControl><Input placeholder="E.g., Electronics" {...field} className="h-9" /></FormControl>
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
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Product Name</FormLabel>
                  <FormControl><Input placeholder="E.g., Wireless Mouse" {...field} className="h-9" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Dimensions</FormLabel>
                    <FormControl><Input placeholder="E.g., 10x10x10cm" {...field} className="h-9" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Weight</FormLabel>
                    <FormControl><Input placeholder="E.g., 0.5kg" {...field} className="h-9" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="handlingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Handling Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 border-slate-200">
                          <SelectValue placeholder="Handling Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Fragile">Fragile</SelectItem>
                        <SelectItem value="Heavy">Heavy</SelectItem>
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
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Initial Qty</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end pt-4 gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9 text-xs">Cancel</Button>
              <Button type="submit" disabled={createSku.isPending} className="h-9 text-xs font-bold uppercase">
                {createSku.isPending ? "Creating..." : "Create SKU"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
