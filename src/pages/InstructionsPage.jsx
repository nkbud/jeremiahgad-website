import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Database, Image as ImageIcon, Key, ShieldCheck, Users, CalendarDays, FileText, Terminal, Server } from 'lucide-react';

const SectionCard = ({ title, icon, children }) => (
  <Card className="glassmorphism-card shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center text-xl text-primary">
        {React.createElement(icon, { className: "mr-3 h-6 w-6" })}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="prose prose-sm sm:prose dark:prose-invert max-w-none">
      {children}
    </CardContent>
  </Card>
);

const CodeBlock = ({ children, language = 'sql' }) => (
  <pre className="bg-slate-800 dark:bg-gray-900 text-slate-100 dark:text-gray-200 p-4 rounded-md overflow-x-auto text-sm my-4 shadow-inner">
    <code className={`language-${language}`}>{children.trim()}</code>
  </pre>
);

const InstructionsPage = () => {
  const supabaseUrl = "YOUR_SUPABASE_URL"; // Replace with actual placeholder or instruction
  const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"; // Replace with actual placeholder or instruction

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      <header className="text-center py-12 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-xl shadow-xl">
        <Server className="h-16 w-16 text-white mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Deployment & Supabase Setup Instructions</h1>
        <p className="text-lg text-indigo-100">Guide for rebuilding and deploying this application with a self-hosted Supabase instance.</p>
      </header>

      <SectionCard title="Overview" icon={AlertCircle}>
        <p>This application relies on Supabase for its backend services including authentication, database storage, and file storage. To rebuild and deploy this application, especially with a self-hosted Supabase instance (e.g., on DigitalOcean), you'll need to replicate the Supabase project structure and configure the frontend accordingly.</p>
        <p><strong>Key Supabase Features Used:</strong></p>
        <ul>
          <li><strong>Authentication:</strong> Email/password sign-up and sign-in. User profiles with an <code>is_admin</code> flag.</li>
          <li><strong>Database (PostgreSQL):</strong> Stores blog posts, categories, user profiles, academy content, testimonials, and appointment bookings.</li>
          <li><strong>Storage:</strong> Used for blog post featured images and images uploaded within the blog content editor (<code>blog_images</code> bucket).</li>
          <li><strong>Row Level Security (RLS):</strong> Implemented on most tables to control data access.</li>
        </ul>
      </SectionCard>

      <SectionCard title="Frontend Setup" icon={Terminal}>
        <p>The frontend is a Vite + React application. Ensure you have Node.js (v20 or higher recommended) and npm installed.</p>
        <ol>
          <li>Clone your frontend repository.</li>
          <li>Install dependencies: <CodeBlock language="bash">npm install</CodeBlock></li>
          <li>
            Configure Supabase credentials: Create a <code>.env.local</code> file in the root of your frontend project (or use environment variables directly during build/deployment) with your Supabase URL and Anon Key:
            <CodeBlock language="bash">{`VITE_SUPABASE_URL=${supabaseUrl}\nVITE_SUPABASE_ANON_KEY=${supabaseAnonKey}`}</CodeBlock>
            <p>These are then used in <code>src/lib/supabaseClient.js</code>.</p>
          </li>
          <li>Run development server: <CodeBlock language="bash">npm run dev</CodeBlock></li>
          <li>Build for production: <CodeBlock language="bash">npm run build</CodeBlock> The output will be in the <code>dist</code> folder.</li>
        </ol>
      </SectionCard>

      <SectionCard title="Supabase Project Setup (Self-Hosted or Cloud)" icon={Database}>
        <p>If self-hosting Supabase (e.g., using Docker on DigitalOcean), follow the official <a href="https://supabase.com/docs/guides/self-hosting" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase self-hosting guide</a>. For Supabase Cloud, create a new project.</p>
        <p>Once your Supabase instance is running, you'll need to perform the following steps using the Supabase Studio (SQL Editor, Storage UI, Auth settings):</p>

        <h4 className="font-semibold mt-4 mb-2 text-lg">1. Authentication Configuration</h4>
        <ul>
          <li>Enable Email/Password authentication.</li>
          <li>(Optional) Configure email templates for confirmation, password reset, etc.</li>
          <li>Note down your Supabase Project URL and Anon Key. These are needed for the frontend.</li>
        </ul>

        <h4 className="font-semibold mt-4 mb-2 text-lg">2. Database Schema & RLS</h4>
        <p>Execute the following SQL in your Supabase SQL Editor. This creates the necessary tables and basic RLS policies. <strong>Important:</strong> Review and adapt RLS policies to your specific security needs.</p>
        
        <p><strong>Profiles Table (for user metadata):</strong></p>
        <CodeBlock language="sql">{`
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  website text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_admin boolean DEFAULT false,
  PRIMARY KEY (id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Function to create a profile when a new user signs up
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

-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        `}</CodeBlock>

        <p><strong>Blog Categories Table:</strong></p>
        <CodeBlock language="sql">{`
CREATE TABLE public.blog_categories (
  id SERIAL PRIMARY KEY,
  name text NOT NULL UNIQUE
);
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public." ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories." ON public.blog_categories FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)) WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
-- Sample Data:
INSERT INTO public.blog_categories (name) VALUES ('Buyers'), ('Sellers'), ('Market Updates'), ('Creative Financing');
        `}</CodeBlock>

        <p><strong>Blog Posts Table:</strong></p>
        <CodeBlock language="sql">{`
CREATE TABLE public.blog_posts (
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  category_id integer REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name text, -- Denormalized for easier display
  image_url text,
  image_alt_text text,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are public." ON public.blog_posts FOR SELECT USING (published_at <= now());
CREATE POLICY "Admins can manage posts." ON public.blog_posts FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)) WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
        `}</CodeBlock>

        <p><strong>Academy Types, Modules, Guides, Testimonials Tables:</strong></p>
        <CodeBlock language="sql">{`
CREATE TABLE public.academy_types (
  id SERIAL PRIMARY KEY,
  name text NOT NULL UNIQUE -- e.g., 'Buyer', 'Seller'
);
INSERT INTO public.academy_types (name) VALUES ('Buyer'), ('Seller');

CREATE TABLE public.academy_modules (
  id SERIAL PRIMARY KEY,
  academy_type_id integer REFERENCES public.academy_types(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  icon_name text, -- e.g., 'Home', 'DollarSign' (Lucide icon names)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.guides (
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  description text,
  file_url text, -- URL to a PDF or other resource
  academy_type_id integer REFERENCES public.academy_types(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.testimonials (
  id SERIAL PRIMARY KEY,
  client_name text NOT NULL,
  quote text NOT NULL,
  avatar_fallback text,
  avatar_url text,
  academy_type_id integer REFERENCES public.academy_types(id) ON DELETE SET NULL, -- Optional link to academy
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Academy content (example: public read, admin write)
ALTER TABLE public.academy_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Academy types public read" ON public.academy_types FOR SELECT USING (true);
CREATE POLICY "Academy types admin write" ON public.academy_types FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)) WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
-- Apply similar RLS to academy_modules, guides, testimonials
        `}</CodeBlock>

        <p><strong>Appointment Slots & Bookings Tables:</strong></p>
        <CodeBlock language="sql">{`
CREATE TABLE public.appointment_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week SMALLINT NOT NULL, -- 0 (Sunday) to 6 (Saturday)
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
ALTER TABLE public.appointment_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage their own appointment slots" ON public.appointment_slots FOR ALL TO authenticated USING (admin_profile_id = auth.uid()) WITH CHECK (admin_profile_id = auth.uid());
CREATE POLICY "All users can view active appointment slots" ON public.appointment_slots FOR SELECT TO authenticated USING (is_active = TRUE);

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
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own bookings" ON public.bookings FOR ALL TO authenticated USING (user_profile_id = auth.uid()) WITH CHECK (user_profile_id = auth.uid());
CREATE POLICY "Admins can view bookings for their services" ON public.bookings FOR SELECT TO authenticated USING (admin_profile_id = auth.uid());
        `}</CodeBlock>
        
        <h4 className="font-semibold mt-4 mb-2 text-lg">3. Storage Setup</h4>
        <ul>
          <li>Create a public Storage bucket named <code>blog_images</code>.</li>
          <li>
            Set up Storage policies for <code>blog_images</code>:
            <ul>
              <li>Public read access.</li>
              <li>Authenticated users can insert.</li>
              <li>Owners can update/delete their own images. (Refer to the RLS policies provided in previous database setup steps for <code>storage.objects</code>).</li>
            </ul>
          </li>
        </ul>
      </SectionCard>

      <SectionCard title="Making an Admin User" icon={ShieldCheck}>
        <p>After a user signs up, you can make them an admin by directly updating the <code>is_admin</code> flag in the <code>public.profiles</code> table for their user ID:</p>
        <CodeBlock language="sql">{`
UPDATE public.profiles
SET is_admin = true
WHERE id = 'USER_UUID_TO_MAKE_ADMIN';
        `}</CodeBlock>
        <p>Replace <code>'USER_UUID_TO_MAKE_ADMIN'</code> with the actual user's ID from the <code>auth.users</code> table (which is also the ID in <code>public.profiles</code>).</p>
      </SectionCard>
      
      <SectionCard title="Deployment to DigitalOcean (Example)" icon={Server}>
        <p>If self-hosting Supabase on a DigitalOcean Droplet:</p>
        <ol>
          <li>Provision a Droplet with Docker installed.</li>
          <li>Follow Supabase's official <a href="https://supabase.com/docs/guides/self-hosting/docker" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Docker Compose setup guide</a>. Ensure you configure persistent volumes for database and storage data.</li>
          <li>Secure your Supabase instance (SSL, firewall, strong passwords in <code>.env</code>).</li>
          <li>Perform the database schema and storage setup as described above.</li>
        </ol>
        <p>For the frontend:</p>
        <ol>
          <li>Build your React app: <code>npm run build</code>.</li>
          <li>Deploy the static files from the <code>dist</code> directory to a static site hosting service, or serve them using a web server like Nginx or Caddy on a DigitalOcean Droplet.</li>
          <li>Ensure your frontend is configured with the correct Supabase URL and Anon Key for your self-hosted instance.</li>
        </ol>
      </SectionCard>

      <footer className="text-center text-muted-foreground text-sm py-8">
        <p>This guide provides a starting point. Always refer to official Supabase documentation for the most up-to-date and detailed instructions. Ensure all security best practices are followed.</p>
      </footer>
    </motion.div>
  );
};

export default InstructionsPage;