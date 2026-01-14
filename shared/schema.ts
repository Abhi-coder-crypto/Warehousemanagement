import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Roles & Permissions
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("viewer"), // admin, warehouse_staff, viewer
  name: text("name").notNull(),
  permissions: jsonb("permissions").$type<{
    orderEdit: boolean;
    inventoryEdit: boolean;
    userCreation: boolean;
  }>().notNull(),
});

// Inventory (SKUs)
export const skus = pgTable("skus", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  dimensions: text("dimensions"),
  weight: text("weight"),
  status: text("status").notNull().default("active"), // active, inactive
  location: text("location"), // Simple location string for display
});

// Racks / Storage
export const racks = pgTable("racks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Rack A"
  locationCode: text("location_code").notNull(), // e.g., "Zone 1"
  capacity: integer("capacity").notNull(),
  currentLoad: integer("current_load").notNull().default(0),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(), // Display ID e.g., ORD-001
  customer: text("customer").notNull(),
  type: text("type").notNull(), // Manual, Integrated
  status: text("status").notNull().default("pending"), // pending, in-process, breached, completed
  totalQuantity: integer("total_quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  pickedAt: timestamp("picked_at"),
  packedAt: timestamp("packed_at"),
  manifestedAt: timestamp("manifested_at"),
  dispatchedAt: timestamp("dispatched_at"),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  skuId: integer("sku_id").notNull(),
  quantity: integer("quantity").notNull(),
});

// API Connectors Status (Mock)
export const apiConnectors = pgTable("api_connectors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., Shopify, Amazon
  status: text("status").notNull(), // active, broken
  lastSync: timestamp("last_sync"),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertSkuSchema = createInsertSchema(skus).omit({ id: true });
export const insertRackSchema = createInsertSchema(racks).omit({ id: true, currentLoad: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, pickedAt: true, packedAt: true, manifestedAt: true, dispatchedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertConnectorSchema = createInsertSchema(apiConnectors).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Sku = typeof skus.$inferSelect;
export type InsertSku = z.infer<typeof insertSkuSchema>;
export type Rack = typeof racks.$inferSelect;
export type InsertRack = z.infer<typeof insertRackSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type ApiConnector = typeof apiConnectors.$inferSelect;
