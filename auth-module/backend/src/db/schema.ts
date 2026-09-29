import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['user', 'admin']);

export const users = pgTable('users', {
  id:              uuid('id').defaultRandom().primaryKey(),
  email:           varchar('email', { length: 255 }).notNull().unique(),
  password:        text('password').notNull(),
  name:            varchar('name', { length: 100 }).notNull(),
  role:            roleEnum('role').default('user').notNull(),
  emailVerified:   boolean('email_verified').default(false).notNull(),
  createdAt:       timestamp('created_at').defaultNow().notNull(),
  updatedAt:       timestamp('updated_at').defaultNow().notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id:           uuid('id').defaultRandom().primaryKey(),
  userId:       uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token:        text('token').notNull().unique(),
  expiresAt:    timestamp('expires_at').notNull(),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  id:           uuid('id').defaultRandom().primaryKey(),
  userId:       uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token:        text('token').notNull().unique(),
  type:         varchar('type', { length: 20 }).notNull().default('email_verification'),
  expiresAt:    timestamp('expires_at').notNull(),
  usedAt:       timestamp('used_at'),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id:           uuid('id').defaultRandom().primaryKey(),
  userId:       uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token:        text('token').notNull().unique(),
  expiresAt:    timestamp('expires_at').notNull(),
  usedAt:       timestamp('used_at'),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
});

export type User               = typeof users.$inferSelect;
export type NewUser            = typeof users.$inferInsert;
export type RefreshToken       = typeof refreshTokens.$inferSelect;
export type VerificationToken  = typeof verificationTokens.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
