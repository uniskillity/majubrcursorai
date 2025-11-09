# Database Setup Guide

## ✅ Important: Set Up Your Database First!

The 400 error you're seeing is likely because:
1. **Database migrations haven't been run** - The tables don't exist yet
2. **No user account exists** - You need to create your first account
3. **Email confirmation might be required** - Check Supabase auth settings

## Step 1: Run Database Migrations

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `wteaucwbkwzirhpnxqmk`
3. Click on **SQL Editor** in the left sidebar
4. Run each migration file **in order**:

### Migration 1: `20251030124933_afe536b6-9385-4007-aeb5-89c4199400e7.sql`
   - Creates: `books`, `reading_history`, `user_preferences`, `recommendations` tables

### Migration 2: `20251104134111_158183a0-6ea3-4ed6-9e13-598814158ad2.sql`
   - Creates: `profiles`, `categories`, `book_categories`, `user_roles` tables
   - Sets up Row Level Security (RLS) policies
   - Creates functions and triggers

### Migration 3: `20251104134211_9ea84d1e-a213-4fb0-b31e-ee886e7bbb4f.sql`
   - Adds columns to `books` table (department, semester, course_code, etc.)

### Migration 4: `20251106100808_bc4083b3-80a8-4fd7-ba88-e3ab7175e16d.sql`
   - Creates: `book_issues` table
   - Sets up RLS policies for book issues

## Step 2: Configure Authentication

1. In Supabase Dashboard, go to **Authentication > Settings**
2. **Disable Email Confirmation** (for testing):
   - Uncheck "Enable email confirmations"
   - This allows users to sign in immediately after signup
   - ⚠️ Re-enable this in production!

3. **Configure Auth Providers** (optional):
   - Enable/disable providers as needed
   - Configure email templates if needed

## Step 3: Create Your First User

### Option A: Sign Up Through the App
1. Make sure migrations are run
2. Go to the app: http://localhost:8080
3. Click "Don't have an account? Sign up"
4. Enter your email and password (minimum 6 characters)
5. Sign up and then sign in

### Option B: Create User via Supabase Dashboard
1. Go to **Authentication > Users**
2. Click **Add User** → **Create new user**
3. Enter email and password
4. User will be created immediately

## Step 4: Verify Setup

1. **Check Tables Exist**:
   - Go to **Table Editor** in Supabase Dashboard
   - You should see: `books`, `profiles`, `reading_history`, `categories`, etc.

2. **Check RLS Policies**:
   - Go to **Authentication > Policies**
   - Verify policies are set up for each table

3. **Test Authentication**:
   - Try signing up in the app
   - Check if user appears in **Authentication > Users**
   - Try signing in

## Common Issues

### "Invalid login credentials" (400 Error)
- **Cause**: User doesn't exist or wrong password
- **Solution**: Sign up first, or reset password in Supabase Dashboard

### "Email not confirmed"
- **Cause**: Email confirmation is enabled
- **Solution**: 
  - Disable email confirmation in Auth Settings (for development)
  - Or check your email for confirmation link

### "Table does not exist"
- **Cause**: Migrations haven't been run
- **Solution**: Run all migration files in order

### "Permission denied"
- **Cause**: RLS policies not set up correctly
- **Solution**: Check that migration 2 ran successfully (sets up RLS)

## Quick Test

After setup, you should be able to:
1. ✅ Sign up with a new email
2. ✅ Sign in with that email
3. ✅ See the main page (not the auth page)
4. ✅ Browse books (if any exist in database)

## Next Steps

1. **Add some books** to the database:
   - Use the Admin panel (if you have admin role)
   - Or insert directly via SQL Editor:
   ```sql
   INSERT INTO books (title, author, genre, description)
   VALUES ('Sample Book', 'Sample Author', 'Fiction', 'A sample book description');
   ```

2. **Set up your profile**:
   - After signing in, go to Profile page
   - Update your information

3. **Test features**:
   - Browse books
   - Save books to reading list
   - View reading history

## Production Checklist

Before deploying to production:
- [ ] Enable email confirmation
- [ ] Set up proper email templates
- [ ] Review and test RLS policies
- [ ] Set up backup strategy
- [ ] Configure custom domain (if needed)
- [ ] Set up monitoring and alerts

