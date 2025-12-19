-- Drop the existing foreign key constraint
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_orderId_fkey";

-- Re-add the foreign key constraint with CASCADE delete
ALTER TABLE "OrderItem" 
ADD CONSTRAINT "OrderItem_orderId_fkey" 
FOREIGN KEY ("orderId") 
REFERENCES "Order"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

