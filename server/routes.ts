import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // USERS
  app.get(api.users.list.path, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.post(api.users.create.path, async (req, res) => {
    const input = api.users.create.input.parse(req.body);
    const user = await storage.createUser(input);
    res.status(201).json(user);
  });

  // SKUS
  app.get(api.skus.list.path, async (req, res) => {
    const skus = await storage.getSkus();
    res.json(skus);
  });

  app.get(api.skus.get.path, async (req, res) => {
    const sku = await storage.getSku(Number(req.params.id));
    if (!sku) return res.status(404).json({ message: "SKU not found" });
    res.json(sku);
  });

  app.post(api.skus.create.path, async (req, res) => {
    const input = api.skus.create.input.parse(req.body);
    const sku = await storage.createSku(input);
    res.status(201).json(sku);
  });

  app.put(api.skus.update.path, async (req, res) => {
    const input = api.skus.update.input.parse(req.body);
    const sku = await storage.updateSku(Number(req.params.id), input);
    res.json(sku);
  });

  app.delete(api.skus.delete.path, async (req, res) => {
    await storage.deleteSku(Number(req.params.id));
    res.status(204).send();
  });

  // ORDERS
  app.get(api.orders.list.path, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.get(api.orders.get.path, async (req, res) => {
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.post(api.orders.create.path, async (req, res) => {
    const { items, ...orderData } = api.orders.create.input.parse(req.body);
    const order = await storage.createOrder(orderData, items);
    res.status(201).json(order);
  });

  app.patch(api.orders.updateStatus.path, async (req, res) => {
    const { status } = api.orders.updateStatus.input.parse(req.body);
    const order = await storage.updateOrderStatus(Number(req.params.id), status);
    res.json(order);
  });

  // RACKS
  app.get(api.racks.list.path, async (req, res) => {
    const racks = await storage.getRacks();
    res.json(racks);
  });

  app.post(api.racks.create.path, async (req, res) => {
    const input = api.racks.create.input.parse(req.body);
    const rack = await storage.createRack(input);
    res.status(201).json(rack);
  });

  // CONNECTORS
  app.get(api.connectors.list.path, async (req, res) => {
    const connectors = await storage.getConnectors();
    res.json(connectors);
  });

  // DASHBOARD
  app.get(api.dashboard.stats.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Seed Data
  if ((await storage.getUsers()).length === 0) {
    await seedData();
  }

  return httpServer;
}

async function seedData() {
  await storage.createUser({
    username: "admin",
    password: "password",
    name: "Admin User",
    role: "admin",
    permissions: { orderEdit: true, inventoryEdit: true, userCreation: true }
  });

  await storage.createSku({ code: "SKU-001", name: "Wireless Mouse", category: "Electronics", quantity: 150, dimensions: "10x5x2", weight: "0.2kg", status: "active", location: "A1-01" });
  await storage.createSku({ code: "SKU-002", name: "Mechanical Keyboard", category: "Electronics", quantity: 50, dimensions: "40x15x5", weight: "1.2kg", status: "active", location: "A1-02" });
  await storage.createSku({ code: "SKU-003", name: "Office Chair", category: "Furniture", quantity: 10, dimensions: "100x50x50", weight: "15kg", status: "active", location: "B2-01" });
  await storage.createSku({ code: "SKU-004", name: "Monitor 27-inch", category: "Electronics", quantity: 0, dimensions: "60x40x10", weight: "5kg", status: "inactive", location: "A1-03" });

  await storage.createOrder({ orderId: "ORD-001", customer: "John Doe", type: "Manual", status: "pending", totalQuantity: 2 }, [{ skuId: 1, quantity: 1 }, { skuId: 2, quantity: 1 }]);
  await storage.createOrder({ orderId: "ORD-002", customer: "Jane Smith", type: "Integrated", status: "in-process", totalQuantity: 1 }, [{ skuId: 3, quantity: 1 }]);
  await storage.createOrder({ orderId: "ORD-003", customer: "Acme Corp", type: "Integrated", status: "breached", totalQuantity: 5 }, [{ skuId: 1, quantity: 5 }]);
  
  await storage.createRack({ name: "Rack A", locationCode: "Zone 1", capacity: 1000 });
  await storage.createRack({ name: "Rack B", locationCode: "Zone 2", capacity: 500 });

  await storage.seedConnector({ name: "Shopify", status: "active", lastSync: new Date() });
  await storage.seedConnector({ name: "Amazon", status: "active", lastSync: new Date() });
  await storage.seedConnector({ name: "WooCommerce", status: "broken", lastSync: new Date() });
}
