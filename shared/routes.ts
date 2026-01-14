import { z } from 'zod';
import { insertUserSchema, insertSkuSchema, insertOrderSchema, insertRackSchema, users, skus, orders, racks, apiConnectors, orderItems } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  skus: {
    list: {
      method: 'GET' as const,
      path: '/api/skus',
      responses: {
        200: z.array(z.custom<typeof skus.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/skus/:id',
      responses: {
        200: z.custom<typeof skus.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/skus',
      input: insertSkuSchema,
      responses: {
        201: z.custom<typeof skus.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/skus/:id',
      input: insertSkuSchema.partial(),
      responses: {
        200: z.custom<typeof skus.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/skus/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id',
      responses: {
        200: z.custom<typeof orders.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: insertOrderSchema.extend({
        items: z.array(z.object({ skuId: z.number(), quantity: z.number() }))
      }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/orders/:id/status',
      input: z.object({ status: z.string() }),
      responses: {
        200: z.custom<typeof orders.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  racks: {
    list: {
      method: 'GET' as const,
      path: '/api/racks',
      responses: {
        200: z.array(z.custom<typeof racks.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/racks',
      input: insertRackSchema,
      responses: {
        201: z.custom<typeof racks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  connectors: {
    list: {
      method: 'GET' as const,
      path: '/api/connectors',
      responses: {
        200: z.array(z.custom<typeof apiConnectors.$inferSelect>()),
      },
    },
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats',
      responses: {
        200: z.object({
          orders: z.object({ pending: z.number(), inProcess: z.number(), breached: z.number() }),
          inventory: z.object({ totalSkus: z.number(), totalQuantity: z.number() }),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
