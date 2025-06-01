# Major Application Rework: Blog/Appointment Focus, Markdown Content, Simplified Backend

## Goals
- Streamline backend to core tables: users, profiles, blog_posts, appointment_slots, bookings.
- Migrate all content into blog_posts (academy, guides, testimonials, categories, modules, types).
- Replace WYSIWYG HTML editor with a markdown editor and preview (with HTML/iframe embedding).
- Simplify frontend navigation to: Home, Blogs, Appointments.
- Enable appointment booking/payment flow for users and admins.
- Document all manual backend operations and migrations.

---

## Backend Changes
- **Create `post` table** for markdown content, to be rendered as HTML on the frontend.
- Remove all frontend dependencies on backend tables except: users, profiles, blog_posts, appointment_slots, bookings.
- Migrate and hardcode any other content (guides, testimonials, etc.) into blog_posts or static files as needed.

## Frontend Changes
- **Editor:** Replace WYSIWYG with a markdown editor (with preview, support for embedded YouTube iframes).
- **Navigation:** Update top bar to Home, Blogs, Appointments.
- **Blog Posts:** List, search, and filter by tags/keywords.
- **Appointments:** Anonymous users can browse, but booking requires login.
- **User Dashboard:** Logged-in users can view, book, and pay for appointments (PayPal, Venmo, Stripe).
- **Admin Dashboard:** Manage blog_posts, availability, bookings, payment method registration; upload HTML files as content; edit existing pages.

## Flows

### Anonymous Users
- Can browse blog content (all under blog_posts).
- Can see appointment options, but booking requires login.

### Logged-in Users
- Can select appointment slots for any admin user with availability.
- See booking types, costs, and what to expect.
- Choose slot from weekly calendar; proceed to payment screen (PayPal, Venmo, Stripe).
- Confirmation email sent to both user and admin with video meeting link and calendar entry.

### Administrators
- Can create/manage blog_posts (HTML/markdown, embedded YouTube supported).
- Manage availability and bookings.
- Register payment method (required for bookings).
- HTML content editor supports direct HTML pasting and .html file uploads.

---

## Migration & Manual Operations
- All academy, guide, testimonial, and category content must be migrated to blog_posts or hardcoded.
- Manual SQL/Supabase changes and migration steps are documented in `human-instructions/supabase_ops.md`.

---

## Deliverables
- This plan (`planned-changes/major_rework.md`)
- SQL/manual instructions (`human-instructions/supabase_ops.md`)
- GitHub issue tracking this rework