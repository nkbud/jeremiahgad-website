import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = 'https://lyeqplsjroegqnifgxez.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZXFwbHNqcm9lZ3FuaWZneGV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjgwNzMsImV4cCI6MjA2NDA0NDA3M30.Fn38lbPZ73wxw18SEaetoF8qYZkN7GuLEd3z-XjJK7I';

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);