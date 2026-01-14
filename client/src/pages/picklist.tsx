import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Plus, Filter } from "lucide-react";
import { Link } from "wouter";

export default function Picklist() {
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: picklists, isLoading } = useQuery<any[]>({
    queryKey: ["/api/picklists"],
  });

  const filteredPicklists = picklists?.filter(p => {
    const matchesPriority = priorityFilter === "all" || p.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesSearch = p.id.toString().includes(searchTerm);
    return matchesPriority && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Picklists</h1>
          <p className="text-muted-foreground">Manage and track warehouse picking operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Summary
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Picklist
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Picklist ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
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
                <SelectTrigger className="w-[150px]">
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Picklist ID</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Total SKUs</TableHead>
                <TableHead>Total Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Picker</TableHead>
                <TableHead>Created Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Loading picklists...
                  </TableCell>
                </TableRow>
              ) : filteredPicklists?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No picklists found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPicklists?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono font-medium">PK-{p.id.toString().padStart(4, '0')}</TableCell>
                    <TableCell>
                      <Badge variant={p.priority === "High" ? "destructive" : p.priority === "Medium" ? "default" : "secondary"}>
                        {p.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.warehouse}</TableCell>
                    <TableCell>{p.skuCount}</TableCell>
                    <TableCell>{p.totalQty}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        p.status === "Completed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
                        p.status === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" :
                        ""
                      }>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.pickerName || "Unassigned"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(p.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/orders/picklist/${p.id}`}>
                        <Button variant="ghost" size="sm">View Details</Button>
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
