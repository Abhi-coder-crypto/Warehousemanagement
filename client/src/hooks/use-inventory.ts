import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertSku } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useSkus() {
  return useQuery({
    queryKey: [api.skus.list.path],
    queryFn: async () => {
      const res = await fetch(api.skus.list.path);
      if (!res.ok) throw new Error("Failed to fetch SKUs");
      return api.skus.list.responses[200].parse(await res.json());
    },
  });
}

export function useSku(id: number) {
  return useQuery({
    queryKey: [api.skus.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.skus.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch SKU");
      return api.skus.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateSku() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertSku) => {
      const res = await fetch(api.skus.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.skus.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create SKU");
      }
      return api.skus.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.skus.list.path] });
      toast({ title: "Success", description: "SKU created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteSku() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.skus.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete SKU");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.skus.list.path] });
      toast({ title: "Success", description: "SKU deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
