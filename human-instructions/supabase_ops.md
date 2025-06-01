# Supabase Operations and Database Migrations

This document outlines the manual database operations required for the major application rework, focusing on blog/appointment functionality with simplified backend.

## Overview

The rework aims to streamline the database by consolidating content into `blog_posts` and removing dependencies on academy-specific tables. The final backend will only use: `users`, `profiles`, `blog_posts`, `appointment_slots`, and `bookings`.

---

## Table Migration Strategy

### 1. Content Migration to blog_posts

All existing content from academy, guides, testimonials, and categories should be migrated to the `blog_posts` table or hardcoded as needed.

#### Academy Content Migration
```sql
-- Migrate academy modules to blog_posts
INSERT INTO blog_posts (title, slug, excerpt, content, author_name, published_at, created_at)
SELECT 
    am.title,
    LOWER(REPLACE(REPLACE(am.title, ' ', '-'), '''', '')) as slug,
    am.description as excerpt,
    am.description as content,
    'System Migration' as author_name,
    NOW() as published_at,
    am.created_at
FROM academy_modules am
JOIN academy_types at ON am.academy_type_id = at.id;
```

#### Guides Migration
```sql
-- Migrate guides to blog_posts
INSERT INTO blog_posts (title, slug, excerpt, content, author_name, published_at, created_at)
SELECT 
    g.title,
    LOWER(REPLACE(REPLACE(g.title, ' ', '-'), '''', '')) as slug,
    g.description as excerpt,
    CONCAT(g.description, COALESCE('\n\nFile: ' || g.file_url, '')) as content,
    'System Migration' as author_name,
    NOW() as published_at,
    g.created_at
FROM guides g;
```

#### Testimonials Migration
```sql
-- Migrate testimonials to blog_posts with structured content
INSERT INTO blog_posts (title, slug, excerpt, content, author_name, published_at, created_at)
SELECT 
    CONCAT('Testimonial: ', t.client_name) as title,
    CONCAT('testimonial-', LOWER(REPLACE(t.client_name, ' ', '-'))) as slug,
    LEFT(t.quote, 150) as excerpt,
    CONCAT(
        '# Testimonial from ', t.client_name, '\n\n',
        '> ', t.quote, '\n\n',
        CASE WHEN t.rating IS NOT NULL THEN CONCAT('**Rating:** ', t.rating, '/5 stars\n\n') ELSE '' END,
        CASE WHEN t.avatar_url IS NOT NULL THEN CONCAT('![', t.client_name, '](', t.avatar_url, ')\n\n') ELSE '' END
    ) as content,
    t.client_name as author_name,
    NOW() as published_at,
    t.created_at
FROM testimonials t;
```

### 2. Post Table for Markdown Content

The existing `blog_posts` table already supports markdown content in the `content` field. No schema changes are required, but ensure the frontend renders markdown as HTML.

### 3. Table Cleanup (CAUTION: Backup First!)

After successful content migration and frontend updates:

```sql
-- ⚠️ BACKUP ALL DATA BEFORE RUNNING THESE COMMANDS ⚠️

-- Drop academy-related tables
DROP TABLE IF EXISTS academy_modules CASCADE;
DROP TABLE IF EXISTS academy_types CASCADE;
DROP TABLE IF EXISTS guides CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;

-- Keep only essential tables:
-- - auth.users (Supabase managed)
-- - public.profiles
-- - public.blog_posts  
-- - public.blog_categories (may keep for organization)
-- - public.appointment_slots
-- - public.bookings
```

---

## Required Manual Steps

### 1. Pre-Migration Backup
```sql
-- Create backup tables
CREATE TABLE academy_modules_backup AS SELECT * FROM academy_modules;
CREATE TABLE academy_types_backup AS SELECT * FROM academy_types;
CREATE TABLE guides_backup AS SELECT * FROM guides;
CREATE TABLE testimonials_backup AS SELECT * FROM testimonials;
```

### 2. Content Review and Cleanup
- Review migrated content in `blog_posts` table
- Update slugs to avoid duplicates
- Add appropriate categories if needed
- Verify markdown formatting

### 3. Frontend Route Cleanup
- Remove `/buyer-academy` and `/seller-academy` routes
- Update navigation to exclude academy links
- Redirect old academy URLs to relevant blog posts

### 4. Storage Cleanup
```sql
-- Clean up unused storage buckets if any academy-specific files exist
-- Review and migrate important files to blog_images bucket
```

---

## Validation Queries

```sql
-- Verify content migration
SELECT COUNT(*) as total_posts FROM blog_posts;
SELECT COUNT(*) as migrated_modules FROM blog_posts WHERE author_name = 'System Migration';

-- Check remaining table dependencies
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name NOT IN ('profiles', 'blog_posts', 'blog_categories', 'appointment_slots', 'bookings');
```

---

## Rollback Plan

If issues arise:
1. Restore from backup tables
2. Revert frontend changes
3. Re-enable academy routes
4. Remove migrated blog posts: `DELETE FROM blog_posts WHERE author_name = 'System Migration';`

---

## Notes

- Perform migrations during low-traffic periods
- Test thoroughly in development environment first
- Monitor application performance after migration
- Update documentation and user guides as needed