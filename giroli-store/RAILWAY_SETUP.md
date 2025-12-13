# Railway Deployment Setup

## Quick Setup Steps

1. **In Railway Dashboard:**
   - Go to your project settings
   - Find "Root Directory" setting
   - Set it to: `giroli-store`
   - Save

2. **Environment Variables to Add:**
   
   Add these in Railway's environment variables section:
   
   ```
   DATABASE_URL=your_postgresql_connection_string
   R2_ENDPOINT=your_cloudflare_r2_endpoint
   R2_ACCESS_KEY_ID=your_r2_access_key
   R2_SECRET_ACCESS_KEY=your_r2_secret_key
   R2_BUCKET_NAME=your_bucket_name
   R2_PUBLIC_URL=your_r2_public_url
   RESEND_API_KEY=re_AovxepZa_9bvvtNMG8m4iTLJfxhhAro6g
   RESEND_DOMAIN=resend.dev (or comenzi.girolicnc.com once verified)
   JWT_SECRET=your_jwt_secret_key (generate a random string)
   ```

3. **Database:**
   - Railway should auto-detect your PostgreSQL database
   - Make sure to run migrations after first deploy:
     ```bash
     npx prisma migrate deploy
     ```
   - Or Railway can run this automatically if you add it to the build script

4. **Build Settings:**
   - Railway should auto-detect Node.js
   - Build command: `npm run build` (runs automatically)
   - Start command: `npm start` (runs automatically)

## Important Notes

- The `postinstall` script in package.json will automatically run `prisma generate` after `npm install`
- The `build` script includes `prisma generate` to ensure Prisma client is ready
- Make sure all environment variables are set before deploying

