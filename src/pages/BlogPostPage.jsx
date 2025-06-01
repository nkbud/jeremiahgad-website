import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CalendarDays, UserCircle, ArrowLeft, AlertTriangle, Loader2, Edit, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { getYouTubeIframeProps, isYouTubeUrl } from '@/utils/youtube';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('blog_posts')
          .select('*, category:blog_categories(name)')
          .eq('slug', slug)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Blog post not found.');
        
        setPost(data);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError(err.message);
        toast({
          variant: 'destructive',
          title: 'Failed to load post',
          description: err.message === 'JSON object requested, multiple (or no) rows returned' ? `Could not find a blog post with slug: ${slug}` : err.message,
        });
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug, toast]);

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt || `Check out this article: ${post.title}`,
        url: window.location.href,
      })
      .then(() => toast({title: "Shared successfully!", description: "The blog post link has been shared."}))
      .catch((err) => toast({variant: "destructive", title: "Share failed", description: "Could not share the post at this time."}));
    } else {
       navigator.clipboard.writeText(window.location.href);
       toast({title: "Link Copied!", description: "Blog post URL copied to clipboard."});
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Post</h2>
        <p className="text-muted-foreground">{error || 'The blog post could not be found.'}</p>
        <Button asChild className="mt-6">
          <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
        </Button>
      </div>
    );
  }
  
  const postCategoryName = post.category?.name || 'Uncategorized';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="mb-8">
        <Button asChild variant="outline" size="sm" className="mb-6">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
        {post.category && (
           <Link to={`/blog?category=${encodeURIComponent(postCategoryName)}`} className="inline-block bg-secondary/20 text-secondary text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider hover:bg-secondary/30 transition-colors">
            {postCategoryName}
          </Link>
        )}
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-primary dark:text-sky-400 tracking-tight">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center text-sm text-muted-foreground space-x-4">
          {post.published_at && (
            <span className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              Published on {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
          {post.author_name && (
            <span className="flex items-center">
              <UserCircle className="h-4 w-4 mr-1.5" />
              By {post.author_name}
            </span>
          )}
           <span className="flex items-center">
              <Edit className="h-4 w-4 mr-1.5" />
              Last updated {new Date(post.updated_at || post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
        </div>
      </div>

      {post.image_url && (
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <img  
            className="w-full h-auto object-cover max-h-[400px]" 
            src={post.image_url} 
            alt={post.image_alt_text || post.title} 
          />
        </div>
      )}
      
      {post.content ? (
         <div className="prose lg:prose-xl dark:prose-invert max-w-none blog-content-wrapper">
           <ReactMarkdown 
             remarkPlugins={[remarkGfm]}
             rehypePlugins={[
               rehypeRaw,
               [rehypeSanitize, {
                 tagNames: ['iframe', 'img', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'blockquote', 'code', 'pre', 'br'],
                 attributes: {
                   iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'title', 'style', 'class', 'allow', 'loading', 'referrerpolicy'],
                   img: ['src', 'alt', 'width', 'height', 'style', 'class'],
                   a: ['href', 'title', 'target', 'rel'],
                   '*': ['style', 'class']
                 }
               }]
             ]}
             components={{
               iframe: ({node, ...props}) => {
                 const enhancedProps = isYouTubeUrl(props.src) 
                   ? getYouTubeIframeProps(props)
                   : props;
                 
                 return (
                   <div className="relative w-full my-6">
                     <iframe 
                       {...enhancedProps} 
                       className="w-full rounded-lg shadow-lg" 
                       style={{
                         minHeight: '315px',
                         aspectRatio: isYouTubeUrl(props.src) ? '16/9' : 'auto'
                       }}
                     />
                   </div>
                 );
               },
               img: ({node, ...props}) => (
                 <img 
                   {...props} 
                   className="rounded-lg shadow-lg mx-auto"
                   loading="lazy"
                 />
               ),
             }}
           >
             {post.content}
           </ReactMarkdown>
         </div>
      ) : (
        <p className="text-muted-foreground">Content for this post is not available.</p>
      )}

      <div className="mt-12 pt-8 border-t border-border">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Enjoyed this article?</p>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </div>
      
      <style jsx global>{`
        .blog-content-wrapper h1,
        .blog-content-wrapper h2,
        .blog-content-wrapper h3,
        .blog-content-wrapper h4,
        .blog-content-wrapper h5,
        .blog-content-wrapper h6 {
          color: hsl(var(--primary));
        }
        .dark .blog-content-wrapper h1,
        .dark .blog-content-wrapper h2,
        .dark .blog-content-wrapper h3,
        .dark .blog-content-wrapper h4,
        .dark .blog-content-wrapper h5,
        .dark .blog-content-wrapper h6 {
          color: hsl(var(--primary-foreground));
        }
        .blog-content-wrapper p,
        .blog-content-wrapper li {
          color: hsl(var(--foreground) / 0.8);
        }
        .dark .blog-content-wrapper p,
        .dark .blog-content-wrapper li {
          color: hsl(var(--foreground) / 0.8);
        }
        .blog-content-wrapper a {
           color: hsl(var(--secondary));
        }
        .dark .blog-content-wrapper a {
           color: hsl(var(--secondary));
        }
        .blog-content-wrapper img {
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
      `}</style>

    </motion.div>
  );
};

export default BlogPostPage;