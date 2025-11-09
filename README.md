# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ce44048f-4199-4db5-a23e-1d523376ab8c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ce44048f-4199-4db5-a23e-1d523376ab8c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables
# Copy the example environment file and fill in your Supabase credentials
cp .env.example .env

# Edit .env and add your Supabase URL and API key:
# - VITE_SUPABASE_URL: Your Supabase project URL (e.g., https://your-project.supabase.co)
# - VITE_SUPABASE_PUBLISHABLE_KEY: Your Supabase anon/public key
# 
# You can find these in your Supabase dashboard under Project Settings > API

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Environment Setup

This project requires Supabase for authentication and database functionality.

### Quick Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Create a `.env` file** in the root directory:
   
   **Option A: Use the PowerShell script** (Windows):
   ```powershell
   .\create-env.ps1
   ```
   
   **Option B: Create manually**:
   Create a file named `.env` in the root directory with:
   ```
   VITE_SUPABASE_URL=https://nnqckrihnsisfvurfdhn.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key-here
   ```

3. **Get your Supabase credentials**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project (Project ID: `nnqckrihnsisfvurfdhn`)
   - Navigate to **Settings > API**
   - Copy the `Project URL` → paste as `VITE_SUPABASE_URL`
   - Copy the `anon` `public` key → paste as `VITE_SUPABASE_PUBLISHABLE_KEY`

4. **Set up your database**:
   - Go to SQL Editor in your Supabase dashboard
   - Run all migration files from `supabase/migrations` in order:
     1. `20251030124933_afe536b6-9385-4007-aeb5-89c4199400e7.sql`
     2. `20251104134111_158183a0-6ea3-4ed6-9e13-598814158ad2.sql`
     3. `20251104134211_9ea84d1e-a213-4fb0-b31e-ee886e7bbb4f.sql`
     4. `20251106100808_bc4083b3-80a8-4fd7-ba88-e3ab7175e16d.sql`
   - Or use Supabase CLI: `supabase db push`

5. **Start the development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

### Detailed Setup

For more detailed setup instructions, see [SETUP.md](./SETUP.md)

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ce44048f-4199-4db5-a23e-1d523376ab8c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
