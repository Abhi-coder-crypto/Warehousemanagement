import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Rack } from "@shared/schema";
import { useLocation } from "wouter";
import { Plus, MapPin } from "lucide-react";

export default function Storage() {
  const [, setLocation] = useLocation();
  const { data: racks } = useQuery<Rack[]>({ queryKey: ["/api/racks"] });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Storage Racks</h1>
        <Button onClick={() => setLocation("/storage/create")}>
          <Plus className="mr-2 h-4 w-4" /> Create Rack
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {racks?.map((rack) => {
          const occupancy = Math.round((rack.currentLoad / rack.capacity) * 100);
          return (
            <Card key={rack.id} className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {rack.name}
                </CardTitle>
                <Badge variant="outline" className="flex gap-1">
                  <MapPin className="h-3 w-3" /> {rack.locationCode}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-medium">{occupancy}%</span>
                  </div>
                  <Progress value={occupancy} className="h-2" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-bold">{rack.currentLoad} / {rack.capacity} Units</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rack Inventory List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rack Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Current Load</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {racks?.map((rack) => {
                const occupancy = (rack.currentLoad / rack.capacity) * 100;
                return (
                  <TableRow key={rack.id}>
                    <TableCell className="font-medium">{rack.name}</TableCell>
                    <TableCell>{rack.locationCode}</TableCell>
                    <TableCell>{rack.capacity}</TableCell>
                    <TableCell>{rack.currentLoad}</TableCell>
                    <TableCell>
                      <Badge variant={occupancy > 90 ? "destructive" : occupancy > 70 ? "warning" : "success"}>
                        {occupancy > 90 ? "Critical" : occupancy > 70 ? "High" : "Optimal"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
