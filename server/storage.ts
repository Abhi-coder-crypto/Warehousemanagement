import { 
  type User, type InsertUser, type Sku, type InsertSku, 
  type Order, type InsertOrder, type Rack, type InsertRack, 
  type ApiConnector, type OrderItem, type InsertOrderItem,
  type Picklist, type InsertPicklist, type PicklistItem, type InsertPicklistItem,
  type StockAllocation, type InsertStockAllocation
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;

  // SKUs
  getSkus(): Promise<Sku[]>;
  getSku(id: number): Promise<Sku | undefined>;
  createSku(sku: InsertSku): Promise<Sku>;
  updateSku(id: number, sku: Partial<InsertSku>): Promise<Sku>;
  deleteSku(id: number): Promise<void>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Racks
  getRacks(): Promise<Rack[]>;
  createRack(rack: InsertRack): Promise<Rack>;
  
  // Stock Allocations
  getStockAllocations(): Promise<(StockAllocation & { skuName: string, skuCode: string, rackName: string })[]>;
  allocateStock(allocation: InsertStockAllocation): Promise<StockAllocation>;

  // Picklists
  getPicklists(): Promise<(Picklist & { pickerName?: string, skuCount: number, totalQty: number })[]>;
  getPicklist(id: number): Promise<Picklist | undefined>;
  getPicklistItems(id: number): Promise<(PicklistItem & { skuName: string, skuCode: string, zone: string, rack: string, bin: string, uom: string, handling: string })[]>;
  createPicklist(picklist: InsertPicklist, items: InsertPicklistItem[]): Promise<Picklist>;
  updatePicklistItem(id: number, updates: Partial<PicklistItem>): Promise<PicklistItem>;
  updatePicklistStatus(id: number, status: string): Promise<Picklist>;

  // Connectors
  getConnectors(): Promise<ApiConnector[]>;

  // Dashboard & Ageing
  getDashboardStats(): Promise<{
    orders: { pending: number; inProcess: number; breached: number };
    inventory: { totalSkus: number; totalQuantity: number };
  }>;
  getStockAgeing(): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skus: Map<number, Sku>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private racks: Map<number, Rack>;
  private stockAllocations: Map<number, StockAllocation>;
  private connectors: Map<number, ApiConnector>;
  private picklists: Map<number, Picklist>;
  private picklistItems: Map<number, PicklistItem>;
  
  private userId: number = 1;
  private skuId: number = 1;
  private orderId: number = 1;
  private orderItemId: number = 1;
  private rackId: number = 1;
  private allocationId: number = 1;
  private connectorId: number = 1;
  private picklistId: number = 1;
  private picklistItemId: number = 1;

  constructor() {
    this.users = new Map();
    this.skus = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.racks = new Map();
    this.stockAllocations = new Map();
    this.connectors = new Map();
    this.picklists = new Map();
    this.picklistItems = new Map();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSkus(): Promise<Sku[]> {
    return Array.from(this.skus.values());
  }

  async getSku(id: number): Promise<Sku | undefined> {
    return this.skus.get(id);
  }

  async createSku(insertSku: InsertSku): Promise<Sku> {
    const id = this.skuId++;
    const sku = { ...insertSku, id };
    this.skus.set(id, sku);
    return sku;
  }

  async updateSku(id: number, updates: Partial<InsertSku>): Promise<Sku> {
    const existing = this.skus.get(id);
    if (!existing) throw new Error("SKU not found");
    const updated = { ...existing, ...updates };
    this.skus.set(id, updated);
    return updated;
  }

  async deleteSku(id: number): Promise<void> {
    this.skus.delete(id);
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderId++;
    const order = { ...insertOrder, id };
    this.orders.set(id, order);

    items.forEach(item => {
      const itemId = this.orderItemId++;
      this.orderItems.set(itemId, { ...item, id: itemId, orderId: id });
    });

    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const existing = this.orders.get(id);
    if (!existing) throw new Error("Order not found");
    const updated = { ...existing, status };
    this.orders.set(id, updated);
    return updated;
  }

  async getRacks(): Promise<Rack[]> {
    return Array.from(this.racks.values());
  }

  async createRack(insertRack: InsertRack): Promise<Rack> {
    const id = this.rackId++;
    const rack = { ...insertRack, id, currentLoad: 0 };
    this.racks.set(id, rack);
    return rack;
  }

  async getStockAllocations(): Promise<(StockAllocation & { skuName: string, skuCode: string, rackName: string })[]> {
    return Array.from(this.stockAllocations.values()).map(alloc => {
      const sku = this.skus.get(alloc.skuId);
      const rack = this.racks.get(alloc.rackId);
      return {
        ...alloc,
        skuName: sku?.name || "Unknown SKU",
        skuCode: sku?.code || "N/A",
        rackName: rack?.name || "Unknown Rack"
      };
    });
  }

  async allocateStock(allocation: InsertStockAllocation): Promise<StockAllocation> {
    const id = this.allocationId++;
    const newAllocation = { ...allocation, id, inboundDate: new Date() };
    this.stockAllocations.set(id, newAllocation);
    
    const rack = this.racks.get(allocation.rackId);
    if (rack) {
      rack.currentLoad += allocation.quantity;
    }
    
    return newAllocation;
  }

  async getPicklists(): Promise<(Picklist & { pickerName?: string, skuCount: number, totalQty: number })[]> {
    return Array.from(this.picklists.values()).map(p => {
      const items = Array.from(this.picklistItems.values()).filter(item => item.picklistId === p.id);
      const picker = p.assignedPickerId ? this.users.get(p.assignedPickerId) : undefined;
      return {
        ...p,
        pickerName: picker?.name,
        skuCount: items.length,
        totalQty: items.reduce((acc, item) => acc + item.requiredQty, 0)
      };
    });
  }

  async getPicklist(id: number): Promise<Picklist | undefined> {
    return this.picklists.get(id);
  }

  async getPicklistItems(id: number): Promise<(PicklistItem & { skuName: string, skuCode: string, zone: string, rack: string, bin: string, uom: string, handling: string })[]> {
    return Array.from(this.picklistItems.values())
      .filter(item => item.picklistId === id)
      .map(item => {
        const sku = this.skus.get(item.skuId);
        const rack = this.racks.get(item.rackId);
        return {
          ...item,
          skuName: sku?.name || "Unknown SKU",
          skuCode: sku?.code || "N/A",
          zone: rack?.locationCode || "Unknown Zone",
          rack: rack?.name || "Unknown Rack",
          bin: "N/A", // Not fully implemented in schema but requested
          uom: "PCS",
          handling: "Normal"
        };
      })
      .sort((a, b) => a.pickSequence - b.pickSequence);
  }

  async createPicklist(insertPicklist: InsertPicklist, items: InsertPicklistItem[]): Promise<Picklist> {
    const id = this.picklistId++;
    const picklist = { ...insertPicklist, id, createdAt: new Date() };
    this.picklists.set(id, picklist);

    items.forEach(item => {
      const itemId = this.picklistItemId++;
      this.picklistItems.set(itemId, { ...item, id: itemId, picklistId: id });
    });

    return picklist;
  }

  async updatePicklistItem(id: number, updates: Partial<PicklistItem>): Promise<PicklistItem> {
    const existing = this.picklistItems.get(id);
    if (!existing) throw new Error("Picklist item not found");
    const updated = { ...existing, ...updates };
    this.picklistItems.set(id, updated);
    return updated;
  }

  async updatePicklistStatus(id: number, status: string): Promise<Picklist> {
    const existing = this.picklists.get(id);
    if (!existing) throw new Error("Picklist not found");
    const updated = { ...existing, status };
    this.picklists.set(id, updated);
    return updated;
  }

  async getConnectors(): Promise<ApiConnector[]> {
    return Array.from(this.connectors.values());
  }

  async getDashboardStats() {
    const orders = Array.from(this.orders.values());
    const skus = Array.from(this.skus.values());
    
    return {
      orders: {
        pending: orders.filter(o => o.status === 'pending').length,
        inProcess: orders.filter(o => o.status === 'in-process').length,
        breached: orders.filter(o => o.status === 'breached').length,
      },
      inventory: {
        totalSkus: skus.length,
        totalQuantity: skus.reduce((acc, s) => acc + s.quantity, 0),
      }
    };
  }

  async getStockAgeing(): Promise<any[]> {
    const allocations = Array.from(this.stockAllocations.values());
    const now = new Date();
    
    return allocations.map(alloc => {
      const sku = this.skus.get(alloc.skuId);
      const rack = this.racks.get(alloc.rackId);
      const ageDays = Math.floor((now.getTime() - (alloc.inboundDate?.getTime() || now.getTime())) / (1000 * 60 * 60 * 24));
      
      let bucket = "0–30";
      if (ageDays > 90) bucket = "90+";
      else if (ageDays > 60) bucket = "61–90";
      else if (ageDays > 30) bucket = "31–60";

      let risk = "Low";
      if (ageDays > 90) risk = "High";
      else if (ageDays > 60) risk = "Medium";

      return {
        skuCode: sku?.code || "N/A",
        skuName: sku?.name || "Unknown SKU",
        category: sku?.category || "N/A",
        warehouse: rack?.warehouse || "Main",
        zone: rack?.locationCode || "N/A",
        rack: rack?.name || "N/A",
        bin: "N/A",
        inboundDate: alloc.inboundDate,
        age: ageDays,
        ageingBucket: bucket,
        availableQty: alloc.quantity,
        reservedQty: alloc.reservedQty,
        inventoryValue: alloc.value,
        riskLevel: risk
      };
    });
  }

  async seedConnector(connector: Omit<ApiConnector, 'id'>) {
    const id = this.connectorId++;
    this.connectors.set(id, { ...connector, id });
  }
}

export const storage = new MemStorage();
