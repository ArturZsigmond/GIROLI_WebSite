# Stop any running Node processes that might be locking Prisma files
Write-Host "Cleaning up Prisma client cache..."
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Regenerating Prisma client..."
npx prisma generate

Write-Host "Done! You can now restart your dev server with 'npm run dev'"

