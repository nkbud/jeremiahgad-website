import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Loader2, UploadCloud } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreateBlogPostForm = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const quillRef = useRef(null);

  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCategoryId, setBlogCategoryId] = useState('');
  const [blogImageFile, setBlogImageFile] = useState(null);
  const [blogImagePreview, setBlogImagePreview] = useState('');
  const [blogImageAltText, setBlogImageAltText] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('blog_categories').select('id, name');
      if (error) {
        toast({ variant: 'destructive', title: 'Error fetching categories', description: error.message });
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, [toast]);

  const generateSlug = (titleString) => {
    return titleString.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  };

  const handleBlogTitleChange = (e) => {
    const newTitle = e.target.value;
    setBlogTitle(newTitle);
    setBlogSlug(generateSlug(newTitle));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBlogImageFile(file);
      setBlogImagePreview(URL.createObjectURL(file));
      if (!blogImageAltText) setBlogImageAltText(file.name.split('.')[0]);
    } else {
      setBlogImageFile(null);
      setBlogImagePreview('');
    }
  };

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file && quillRef.current) {
        const quillEditor = quillRef.current.getEditor();
        const range = quillEditor.getSelection(true);
        quillEditor.insertEmbed(range.index, 'image', `/assets/loader.gif`); 
        quillEditor.setSelection(range.index + 1);

        try {
          const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('blog_images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage.from('blog_images').getPublicUrl(uploadData.path);
          const imageUrl = publicUrlData.publicUrl;

          quillEditor.deleteText(range.index, 1); 
          quillEditor.insertEmbed(range.index, 'image', imageUrl);
          quillEditor.setSelection(range.index + 1);
        } catch (error) {
          quillEditor.deleteText(range.index, 1); 
          toast({ variant: 'destructive', title: 'Image Upload Failed', description: error.message });
        }
      }
    };
  }, [toast]);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
        [{size: []}],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), [imageHandler]);

  const quillFormats = [
    'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'link', 'image', 'video'
  ];

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!profile?.id || !user) {
      toast({ variant: 'destructive', title: 'Unauthorized', description: 'User not properly authenticated.' });
      return;
    }
    if (!blogTitle || !blogSlug || !blogContent || !blogCategoryId) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill in Title, Slug, Content, and Category.' });
      return;
    }
    setIsSubmittingPost(true);
    let uploadedFeaturedImageUrl = null;

    if (blogImageFile) {
      setIsUploadingImage(true);
      const fileName = `${Date.now()}_feat_${blogImageFile.name.replace(/\s+/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('blog_images').upload(fileName, blogImageFile);
      setIsUploadingImage(false);
      if (uploadError) {
        toast({ variant: 'destructive', title: 'Featured Image Upload Failed', description: uploadError.message });
        setIsSubmittingPost(false); return;
      }
      const { data: publicUrlData } = supabase.storage.from('blog_images').getPublicUrl(uploadData.path);
      uploadedFeaturedImageUrl = publicUrlData.publicUrl;
    }

    try {
      const { data, error } = await supabase.from('blog_posts').insert([
        {
          title: blogTitle, slug: blogSlug, excerpt: blogExcerpt, content: blogContent,
          category_id: parseInt(blogCategoryId), author_id: user.id,
          author_name: profile.full_name || user.email, image_url: uploadedFeaturedImageUrl,
          image_alt_text: blogImageAltText || blogTitle, published_at: new Date().toISOString(),
        }
      ]).select();
      if (error) throw error;
      toast({ title: 'Blog Post Created!', description: `"${data[0].title}" published.` });
      setBlogTitle(''); setBlogSlug(''); setBlogExcerpt(''); setBlogContent('');
      setBlogCategoryId(''); setBlogImageFile(null); setBlogImagePreview(''); setBlogImageAltText('');
      if (quillRef.current) quillRef.current.getEditor().setContents([]);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error Creating Post', description: error.message });
    } finally {
      setIsSubmittingPost(false);
    }
  };

  return (
    <Card className="glassmorphism-card">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary"><PlusCircle className="mr-2 h-6 w-6" /> Create New Blog Post</CardTitle>
        <CardDescription>Craft and publish new articles with embedded media.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmitPost}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input id="post-title" value={blogTitle} onChange={handleBlogTitleChange} placeholder="Enter post title" required disabled={isSubmittingPost}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-slug">Slug</Label>
            <Input id="post-slug" value={blogSlug} onChange={(e) => setBlogSlug(e.target.value)} placeholder="post-slug-will-be-here" required disabled={isSubmittingPost}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-image">Featured Image (Optional)</Label>
            <Input id="post-image" type="file" accept="image/*" onChange={handleImageFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" disabled={isSubmittingPost || isUploadingImage}/>
            {isUploadingImage && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading image...</div>}
            {blogImagePreview && <img-replace src={blogImagePreview} alt="Preview" className="mt-2 max-h-48 w-auto rounded-md object-contain" />}
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-image-alt">Featured Image Alt Text</Label>
            <Input id="post-image-alt" value={blogImageAltText} onChange={(e) => setBlogImageAltText(e.target.value)} placeholder="Descriptive text for featured image" disabled={isSubmittingPost}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-excerpt">Excerpt (Short Summary)</Label>
            <Textarea id="post-excerpt" value={blogExcerpt} onChange={(e) => setBlogExcerpt(e.target.value)} placeholder="A brief summary of the post..." rows={3} disabled={isSubmittingPost}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-content">Content</Label>
            <ReactQuill ref={quillRef} theme="snow" value={blogContent} onChange={setBlogContent} modules={quillModules} formats={quillFormats} placeholder="Write your amazing content here..." className="bg-background dark:bg-slate-800 rounded-md" style={{minHeight: '300px'}} readOnly={isSubmittingPost}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-category">Category</Label>
            <Select onValueChange={(value) => setBlogCategoryId(value)} value={blogCategoryId} disabled={isSubmittingPost}>
              <SelectTrigger id="post-category"><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>{categories.map((cat) => (<SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmittingPost || isUploadingImage}>
            {(isSubmittingPost || isUploadingImage) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Publish Post
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateBlogPostForm;