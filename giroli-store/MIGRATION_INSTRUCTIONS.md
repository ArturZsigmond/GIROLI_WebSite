# Migration Instructions for Multiple Categories Feature

## Database Migration Required

The schema has been updated to support multiple categories per product. You need to run a migration to apply these changes to your database.

### Steps:

1. **Generate the migration:**
   ```bash
   cd giroli-store
   npx prisma migrate dev --name add_multiple_categories
   ```

2. **If you're in production, generate the migration SQL first:**
   ```bash
   npx prisma migrate dev --create-only --name add_multiple_categories
   ```
   Then review the generated SQL file in `prisma/migrations/` before applying it.

3. **Apply the migration:**
   ```bash
   npx prisma migrate deploy
   ```

### What the migration does:

- Creates a new `ProductCategory` table for the many-to-many relationship
- Keeps the existing `category` field on `Product` for backward compatibility
- Existing products will continue to work with their single category
- New products can have multiple categories assigned

### After Migration:

- Existing products will only have their primary category
- You can edit existing products in the admin panel to add additional categories
- The filtering and display will work with both single and multiple categories

