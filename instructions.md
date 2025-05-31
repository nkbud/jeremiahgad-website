# Local Development Setup Instructions

This guide provides step-by-step instructions for setting up and running the Jeremiah Gad Real Estate Website locally on your development machine.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js) or yarn package manager
- **Git** for version control
- A **Supabase account** (free tier available at [supabase.com](https://supabase.com))

## Required Dependencies

This project relies on the following key technologies:

### Frontend Dependencies
- **React 18** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### Backend Service
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database
  - Authentication system
  - File storage
  - Real-time subscriptions
  - Row Level Security (RLS)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/nkbud/jeremiahgad-website.git
cd jeremiahgad-website
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages as defined in `package.json`.

### 3. Supabase Setup

#### Option A: Use Existing Supabase Instance (Quick Start)

The application is currently configured to use an existing Supabase instance. You can run the application immediately with:

```bash
npm run dev
```

#### Option B: Set Up Your Own Supabase Instance (Recommended for Development)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a free account
   - Create a new project
   - Wait for the project to initialize (this may take a few minutes)

2. **Get Your Supabase Credentials**
   - Go to your project's Settings > API
   - Copy the Project URL and anon/public key

3. **Configure Environment Variables** (Optional)
   
   If you want to use your own Supabase instance, you can either:
   
   **Method 1: Environment Variables**
   Create a `.env.local` file in the project root:
   ```bash
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   Then update `src/lib/supabaseClient.js` to use environment variables:
   ```javascript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lyeqplsjroegqnifgxez.supabase.co';
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_fallback_key';

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

   **Method 2: Direct Configuration**
   Replace the hardcoded values in `src/lib/supabaseClient.js` with your credentials.

### 4. Database Schema Setup

If using your own Supabase instance, you'll need to set up the database schema:

#### 4.1. Authentication Configuration
1. In your Supabase dashboard, go to Authentication > Settings
2. Enable Email/Password authentication
3. Configure any email templates as needed

#### 4.2. Database Schema
Execute the following SQL scripts in your Supabase SQL Editor:

**User Profiles Table:**
```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  website text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_admin boolean DEFAULT false,
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger the function on new user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Blog System Tables:**
```sql
-- Blog categories
CREATE TABLE public.blog_categories (
  id SERIAL PRIMARY KEY,
  name text NOT NULL UNIQUE
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public." ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories." ON public.blog_categories FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)) WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Sample categories
INSERT INTO public.blog_categories (name) VALUES 
('Buyers'), ('Sellers'), ('Market Updates'), ('Creative Financing');

-- Blog posts
CREATE TABLE public.blog_posts (
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  category_id integer REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name text,
  image_url text,
  image_alt_text text,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are public." ON public.blog_posts FOR SELECT USING (published_at <= now());
CREATE POLICY "Admins can manage posts." ON public.blog_posts FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)) WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
```

**Academy System Tables:**
```sql
-- Academy types (Buyer, Seller)
CREATE TABLE public.academy_types (
  id SERIAL PRIMARY KEY,
  name text NOT NULL UNIQUE
);

INSERT INTO public.academy_types (name) VALUES ('Buyer'), ('Seller');

-- Academy modules
CREATE TABLE public.academy_modules (
  id SERIAL PRIMARY KEY,
  academy_type_id integer REFERENCES public.academy_types(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  icon_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Guides/resources
CREATE TABLE public.guides (
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  description text,
  file_url text,
  academy_type_id integer REFERENCES public.academy_types(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Testimonials
CREATE TABLE public.testimonials (
  id SERIAL PRIMARY KEY,
  client_name text NOT NULL,
  quote text NOT NULL,
  avatar_fallback text,
  avatar_url text,
  academy_type_id integer REFERENCES public.academy_types(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on academy tables
ALTER TABLE public.academy_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Academy content public read" ON public.academy_types FOR SELECT USING (true);
CREATE POLICY "Academy modules public read" ON public.academy_modules FOR SELECT USING (true);
CREATE POLICY "Guides public read" ON public.guides FOR SELECT USING (true);
CREATE POLICY "Testimonials public read" ON public.testimonials FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Academy admin write" ON public.academy_types FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)) WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
CREATE POLICY "Academy modules admin write" ON public.academy_modules FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)) WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
CREATE POLICY "Guides admin write" ON public.guides FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)) WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
CREATE POLICY "Testimonials admin write" ON public.testimonials FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)) WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
```

**Appointment System Tables:**
```sql
-- Appointment slots
CREATE TABLE public.appointment_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week SMALLINT NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    buffer_time_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Bookings
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_slot_id UUID REFERENCES public.appointment_slots(id) ON DELETE SET NULL,
    appointment_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price_at_booking DECIMAL(10, 2),
    currency_at_booking VARCHAR(3),
    status VARCHAR(50) DEFAULT 'pending_payment',
    stripe_payment_intent_id TEXT,
    google_meet_link TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage their own appointment slots" ON public.appointment_slots FOR ALL TO authenticated USING (admin_profile_id = auth.uid()) WITH CHECK (admin_profile_id = auth.uid());
CREATE POLICY "All users can view active appointment slots" ON public.appointment_slots FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "Users can manage their own bookings" ON public.bookings FOR ALL TO authenticated USING (user_profile_id = auth.uid()) WITH CHECK (user_profile_id = auth.uid());
CREATE POLICY "Admins can view bookings for their services" ON public.bookings FOR SELECT TO authenticated USING (admin_profile_id = auth.uid());
```

#### 4.3. Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `blog_images`
3. Make it public for reading
4. Set up storage policies for the bucket:

```sql
-- Allow public read access to blog_images bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('blog_images', 'blog_images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload blog images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog_images');

-- Allow public read access
CREATE POLICY "Public can view blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog_images');

-- Allow users to update their own images
CREATE POLICY "Users can update own blog images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog_images' AND auth.uid() = owner);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own blog images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog_images' AND auth.uid() = owner);
```

### 5. Creating Admin Users

After setting up the database and having users sign up, you can make a user an admin:

1. Go to your Supabase dashboard > Authentication > Users
2. Find the user you want to make an admin and copy their UUID
3. Go to SQL Editor and run:

```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = 'USER_UUID_HERE';
```

Replace `USER_UUID_HERE` with the actual user ID.

## Running the Application

### Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

### Building for Production

Create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Environment Configuration

The application supports the following environment variables:

### Required (if using your own Supabase instance)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### Optional
- Environment variables for any additional services (email, analytics, etc.)

## Development Workflow

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Project Structure

- `src/pages/` - React page components
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions and configurations
- `src/contexts/` - React context providers
- `public/` - Static assets

### Key Features to Test

1. **Authentication**: Sign up, login, logout functionality
2. **Blog System**: Create, edit, publish blog posts (admin only)
3. **Academy Pages**: View buyer and seller academy content
4. **Appointment Booking**: Book consultation appointments
5. **Admin Dashboard**: Manage content and users (admin only)

## Troubleshooting

### Common Issues

1. **Build fails**: Check that all dependencies are installed with `npm install`
2. **Supabase connection issues**: Verify your URL and API key are correct
3. **Authentication not working**: Check Supabase auth settings and RLS policies
4. **Images not uploading**: Verify storage bucket and policies are set up correctly

### Getting Help

- Check the browser console for error messages
- Review the Supabase dashboard for database/auth issues
- Refer to the [Supabase documentation](https://supabase.com/docs)
- Check the [Vite documentation](https://vitejs.dev/guide/) for build issues

## Production Deployment

For production deployment, you'll need to:

1. Set up your production Supabase instance
2. Configure your environment variables
3. Build the application with `npm run build`
4. Deploy the `dist` folder to your hosting service
5. Ensure your Supabase instance is properly secured

Popular hosting options include:
- Vercel
- Netlify
- GitHub Pages
- DigitalOcean App Platform
- Traditional web servers (Nginx, Apache)

## Security Considerations

- Never commit environment variables or API keys to version control
- Review and customize Supabase RLS policies for your use case
- Use HTTPS in production
- Regularly update dependencies
- Monitor your Supabase logs for unusual activity