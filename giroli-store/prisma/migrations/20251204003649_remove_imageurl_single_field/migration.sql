/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
-- Conditionally drop column only if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Product' 
        AND column_name = 'imageUrl'
    ) THEN
        ALTER TABLE "Product" DROP COLUMN "imageUrl";
    END IF;
END $$;
