import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import SKUCreate from "@/pages/sku-create";
import SKUEdit from "@/pages/sku-edit";
import StorageView from "@/pages/storage-view";
import Orders from "@/pages/orders";
import OrderCreate from "@/pages/order-create";
import OrderDetail from "@/pages/order-detail";
import Picklist from "@/pages/picklist";
import ChallanView from "@/pages/challan-view";
import Storage from "@/pages/storage";
import StorageCreate from "@/pages/storage-create";
import StockAllocate from "@/pages/stock-allocate";
import StockAgeing from "@/pages/stock-ageing";
import Users from "@/pages/users";
import Permissions from "@/pages/permissions";
import Login from "@/pages/login";
import Layout from "@/components/layout";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        <Layout><Dashboard /></Layout>
      </Route>
      
      {/* Inventory */}
      <Route path="/inventory">
        <Layout><Inventory /></Layout>
      </Route>
      <Route path="/inventory/create">
        <Layout><SKUCreate /></Layout>
      </Route>
      <Route path="/inventory/edit/:id">
        <Layout><SKUEdit /></Layout>
      </Route>
      <Route path="/inventory/storage">
        <Layout><StorageView /></Layout>
      </Route>

      {/* Orders */}
      <Route path="/orders">
        <Layout><Orders /></Layout>
      </Route>
      <Route path="/orders/create">
        <Layout><OrderCreate /></Layout>
      </Route>
      <Route path="/orders/picklist">
        <Layout><Picklist /></Layout>
      </Route>
      <Route path="/orders/challan/:id">
        <Layout><ChallanView /></Layout>
      </Route>
      <Route path="/orders/:id">
        <Layout><OrderDetail /></Layout>
      </Route>

      {/* Storage */}
      <Route path="/storage">
        <Layout><Storage /></Layout>
      </Route>
      <Route path="/storage/create">
        <Layout><StorageCreate /></Layout>
      </Route>
      <Route path="/storage/allocate">
        <Layout><StockAllocate /></Layout>
      </Route>
      <Route path="/storage/ageing">
        <Layout><StockAgeing /></Layout>
      </Route>

      {/* Admin */}
      <Route path="/users">
        <Layout><Users /></Layout>
      </Route>
      <Route path="/permissions">
        <Layout><Permissions /></Layout>
      </Route>

      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
