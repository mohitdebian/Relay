import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  workspace_name: z.string().min(2, 'Workspace name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const googleAuthSchema = z.object({
  id_token: z.string().min(1, 'Google ID token is required'),
});

// Workspace Schemas
export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

// API Schemas
export const createApiSchema = z.object({
  workspace_id: z.number().int().positive('Valid workspace ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  upstream_url: z.string().url('Must be a valid URL'),
  environment: z.enum(['development', 'staging', 'production']).optional(),
  rate_limit_enabled: z.boolean().optional(),
  rate_limit_max: z.number().int().positive().optional(),
  rate_limit_window: z.number().int().positive().optional(),
});

export const updateApiSchema = createApiSchema
  .partial()
  .omit({ workspace_id: true })
  .extend({
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  });

// API Key Schemas
export const createApiKeySchema = z.object({
  name: z.string().min(2, 'Key name must be at least 2 characters'),
  environment: z.enum(['development', 'staging', 'production']).optional(),
});

// Webhook Schemas
export const createWebhookSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  events: z.array(z.string()).min(1, 'At least one event must be selected'),
});

// Invitation Schemas
export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'owner', 'Developer', 'viewer']),
});
