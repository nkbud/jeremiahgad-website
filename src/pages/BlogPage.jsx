import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Rss, Search as SearchIcon, Filter, CalendarDays, UserCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('blog_categories')
          .select('id, name')
          .order('name');
        if (categoriesError) throw categoriesError;
        setCategories([{ id: 'All', name: 'All' }, ...(categoriesData || [])]);

        let query = supabase
          .from('blog_posts')
          .select('*, category:blog_categories(name)')
          .order('published_at', { ascending: false })
          .not('published_at', 'is', null) // Only fetch published posts
          .lte('published_at', new Date().toISOString()); // Published date is in the past or now

        const { data: postsData, error: postsError } = await query;
        if (postsError) throw postsError;
        setPosts(postsData || []);

      } catch (err) {
        console.error("Error fetching blog data:", err);
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Failed to load blog content",
          description: "Could not fetch blog posts or categories. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBlogData();
  }, [toast]);
  
  useEffect(() => {
    if (selectedCategory === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", selectedCategory);
    }
    setSearchParams(searchParams);
  }, [selectedCategory, searchParams, setSearchParams]);


  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const categoryName = post.category?.name || '';
      const matchesCategory = selectedCategory === "All" || categoryName === selectedCategory;
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, posts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Blog Posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Blog</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12 bg-gradient-to-r from-green-500 to-teal-600 dark:from-green-600 dark:to-teal-700 rounded-xl shadow-xl"
      >
        <Rss className="h-16 w-16 text-white mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Real Estate Insights</h1>
        <p className="text-xl text-green-100 max-w-2xl mx-auto">
          Your source for the latest news, tips, and expert advice in the real estate world.
        </p>
      </motion.section>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-background dark:bg-slate-800 rounded-lg shadow"
      >
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        {categories.length > 0 && (
          <div className="min-w-[200px]">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <Filter className="inline-block mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </motion.div>

      {filteredPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            >
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 glassmorphism-card bg-background/70 dark:bg-slate-800/70">
                {post.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img  
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                      alt={post.image_alt_text || post.title}
                     src="https://images.unsplash.com/photo-1504983875-d3b163aba9e6" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl text-primary hover:underline">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {post.published_at && (
                      <span className="inline-flex items-center mr-2">
                        <CalendarDays className="h-3 w-3 mr-1" /> 
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                    )}
                    {post.author_name && (
                      <span className="inline-flex items-center">
                        <UserCircle className="h-3 w-3 mr-1" /> {post.author_name}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-foreground/80 dark:text-slate-300">{post.excerpt}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="link" className="text-primary p-0">
                    <Link to={`/blog/${post.slug}`}>Read More &rarr;</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y:10 }} 
          animate={{ opacity: 1, y:0 }} 
          className="text-center py-12"
        >
          <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">No articles found matching your criteria.</p>
        </motion.div>
      )}
    </div>
  );
};

export default BlogPage;