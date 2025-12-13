# Railway Deployment Checklist

## Before Deploying

1. **Make sure `package-lock.json` is committed to git:**
   ```bash
   git add giroli-store/package-lock.json
   git commit -m "Add package-lock.json for Railway deployment"
   git push
   ```

2. **Set Root Directory in Railway:**
   - Go to Railway Dashboard → Your Project → Settings
   - Find "Root Directory" 
   - Set to: `giroli-store`
   - Save

3. **Add Environment Variables in Railway:**
   - Go to Railway Dashboard → Your Project → Variables
   - Add all these variables:
   
   ```
   DATABASE_URL=your_postgresql_connection_string
   R2_ENDPOINT=your_cloudflare_r2_endpoint
   R2_ACCESS_KEY_ID=your_r2_access_key
   R2_SECRET_ACCESS_KEY=your_r2_secret_key
   R2_BUCKET_NAME=your_bucket_name
   R2_PUBLIC_URL=your_r2_public_url
   RESEND_API_KEY=re_AovxepZa_9bvvtNMG8m4iTLJfxhhAro6g
   RESEND_DOMAIN=resend.dev
   JWT_SECRET=generate_a_random_string_here
   NODE_ENV=production
   ```

4. **Run Database Migrations:**
   After first deployment, run:
   ```bash
   npx prisma migrate deploy
   ```
   Or add this as a one-time command in Railway.

## Build Process

Railway will:
1. Detect Node.js project in `giroli-store/` directory
2. Run `npm install` (from .nixpacks.toml)
3. Run `npx prisma generate` (from .nixpacks.toml)
4. Run `npm run build` (from .nixpacks.toml)
5. Start with `npm start` (from .nixpacks.toml)

## Troubleshooting

If build fails:
- Check that `package-lock.json` is committed
- Verify Root Directory is set to `giroli-store`
- Check all environment variables are set
- Review Railway build logs for specific errors

