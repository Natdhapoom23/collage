# Photo Collage Web App

This is a Next.js (App Router) application for uploading photos into groups and presenting them as a dynamic collage.

## Features
- **User Page**: Clean glassmorphism UI for users to input their name, select a group, and upload a photo.
- **Admin Dashboard**: Manage groups (Create, Edit, Delete).
- **Presentation View**: Fullscreen, randomly arranged photo collage (Masonry style) with the group name.

## Running Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database (SQLite)**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the App**
   - User Upload Form: `http://localhost:3002`
   - Admin Dashboard: `http://localhost:3002/admin`

*(Note: In local development, uploaded images are saved to `public/uploads`)*

## Deploying to Vercel

Since Vercel is a serverless environment, local SQLite databases and local file uploads (`public/uploads`) will **not** persist. You must configure external storage and database services.

### 1. Database Setup (Vercel Postgres or Supabase)
1. Go to your Vercel Project Dashboard.
2. Under the **Storage** tab, create a new **Postgres** database (or use Supabase).
3. Vercel will automatically add `POSTGRES_URL` (or similar) to your Environment Variables.
4. Update `prisma/schema.prisma` to use Postgres:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("POSTGRES_URL")
   }
   ```
5. Run `npx prisma migrate dev` locally to reset the migrations for Postgres, or use `npx prisma db push` during deployment.

### 2. File Storage Setup (Vercel Blob or AWS S3)
1. In the Vercel **Storage** tab, create a new **Blob** store.
2. Install `@vercel/blob`:
   ```bash
   npm install @vercel/blob
   ```
3. Update `src/app/api/upload/route.ts` to use Vercel Blob instead of `fs.writeFile`:
   ```typescript
   import { put } from '@vercel/blob';
   // ... inside POST
   const blob = await put(file.name, file, { access: 'public' });
   // Then save `blob.url` to the database instead of the local path
   ```

### 3. Deploy
Once you have pushed your code to GitHub and connected it to Vercel, Vercel will automatically run `npm run build` and deploy your application. Remember to add a build script in `package.json` that generates the Prisma client:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```
