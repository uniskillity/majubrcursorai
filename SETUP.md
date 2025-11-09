# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env` file in the root directory with the following content:
   ```
   VITE_SUPABASE_URL=https://nnqckrihnsisfvurfdhn.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key-here
   ```
   
   **To get your Supabase credentials:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project (Project ID: nnqckrihnsisfvurfdhn)
   - Navigate to Settings > API
   - Copy the `Project URL` → this is your `VITE_SUPABASE_URL`
   - Copy the `anon` `public` key → this is your `VITE_SUPABASE_PUBLISHABLE_KEY`

3. **Set Up Database**
   
   Run the database migrations in your Supabase project:
   - Go to SQL Editor in Supabase Dashboard
   - Run all migration files from the `supabase/migrations` folder in order:
     1. `20251030124933_afe536b6-9385-4007-aeb5-89c4199400e7.sql`
     2. `20251104134111_158183a0-6ea3-4ed6-9e13-598814158ad2.sql`
     3. `20251104134211_9ea84d1e-a213-4fb0-b31e-ee886e7bbb4f.sql`
     4. `20251106100808_bc4083b3-80a8-4fd7-ba88-e3ab7175e16d.sql`
   
   Or use Supabase CLI:
   ```bash
   supabase db push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

## Optional: Book Recommendations Function

If you want to use the AI book recommendations feature, you'll need to:
1. Get a Lovable API key
2. Add it to your `.env` file:
   ```
   LOVABLE_API_KEY=your-lovable-api-key-here
   ```
3. Deploy the Supabase function from `supabase/functions/book-recommendations`

## Troubleshooting

### Missing Environment Variables
If you see an error about missing Supabase environment variables, make sure:
- Your `.env` file exists in the root directory
- The file contains both `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- The values are correct (no quotes needed)

### Database Connection Issues
- Verify your Supabase project is active
- Check that migrations have been run
- Ensure your API keys are correct

### Port Already in Use
The default port is 8080. If it's already in use, you can change it in `vite.config.ts`

