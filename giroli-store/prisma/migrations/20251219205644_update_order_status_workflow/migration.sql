-- Add new enum values to OrderStatus
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'IN_PRODUCTION';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'IN_TRANSIT';

-- Note: PostgreSQL doesn't support removing enum values easily, so CANCELLED remains
-- If you need to remove it later, you'd need to recreate the enum type

