import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Permissions() {
  const { toast } = useToast();
  const { data: users } = useQuery<User[]>({ queryKey: ["/api/users"] });

  const mutation = useMutation({
    mutationFn: async ({ userId, permissions }: { userId: number, permissions: any }) => {
      // In this mock setup, we'd have an update user endpoint
      // For now, let's assume it works
      await apiRequest("PATCH", `/api/users/${userId}/permissions`, permissions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Updated", description: "Permissions saved" });
    }
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Permissions Management</h1>

      <div className="grid gap-6">
        {users?.map(user => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle>{user.name} ({user.role})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Edit</Label>
                  <p className="text-sm text-muted-foreground">Allow user to modify existing orders</p>
                </div>
                <Switch 
                  checked={user.permissions.orderEdit}
                  onCheckedChange={(checked) => mutation.mutate({ 
                    userId: user.id, 
                    permissions: { ...user.permissions, orderEdit: checked } 
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Inventory Edit</Label>
                  <p className="text-sm text-muted-foreground">Allow user to add/edit SKUs and stock</p>
                </div>
                <Switch 
                  checked={user.permissions.inventoryEdit}
                  onCheckedChange={(checked) => mutation.mutate({ 
                    userId: user.id, 
                    permissions: { ...user.permissions, inventoryEdit: checked } 
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Creation</Label>
                  <p className="text-sm text-muted-foreground">Allow user to manage other accounts</p>
                </div>
                <Switch 
                  checked={user.permissions.userCreation}
                  onCheckedChange={(checked) => mutation.mutate({ 
                    userId: user.id, 
                    permissions: { ...user.permissions, userCreation: checked } 
                  })}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
