'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  FileText,
  ChevronDown,
  SearchCode,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Undo2,
  Trash,
  BookOpen,
  LayoutGrid,
  Download,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminFetch } from '@/lib/admin-fetch';
import type { PageBlock } from '@/lib/page-blocks';
import { normalizePageBlocks } from '@/lib/page-blocks';
import { marked } from 'marked';
import TurndownService from 'turndown';
import WysiwygEditor from './WysiwygEditor';

interface Author {
  id: string;
  name: string;
  email: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  blocks: string;
  coverImage: string | null;
  authorId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  customSchema: string | null;
  tags: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  User?: Author | null;
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  blocks: PageBlock[];
  coverImage: string;
  authorId: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  customSchema: string;
  tags: string;
  isPublished: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const emptyForm: BlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  blocks: [],
  coverImage: '',
  authorId: '',
  metaTitle: '',
  metaDescription: '',
  ogImage: '',
  customSchema: '',
  tags: '',
  isPublished: false,
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  try {
    const parsed = JSON.parse(tags);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fallback
  }
  return [];
}

export function AdminBlog() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Trash tab state
  const [activeTab, setActiveTab] = useState('active');
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [permanentDeleting, setPermanentDeleting] = useState(false);

  // Bulk action state
  const [bulkLoading, setBulkLoading] = useState(false);

  // CSV import/export state
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['admin-blog-posts', activeTab, searchTerm, page],
    queryFn: async () => {
        const params = new URLSearchParams({ all: 'true', page: String(page), limit: '12' });
        if (activeTab === 'trashed') params.set('trashed', 'true');
        if (searchTerm) params.set('search', searchTerm);
        const res = await adminFetch(`/api/blog?${params.toString()}`);
        if (!res.ok) throw new Error('Failed');
        return await res.json();
    }
  });

  const posts = data?.blogPosts || [];
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 };

  const { data: authors = [] } = useQuery({
    queryKey: ['admin-authors-minimal'],
    queryFn: async () => {
        const res = await adminFetch('/api/users?all=true');
        const data = await res.json();
        return (data.users || []).map((u: any) => ({ id: u.id, name: u.name, email: u.email }));
    }
  });

  const handleSearch = () => {
    setSelectedIds([]);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setSelectedIds([]);
    setPage(newPage);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === posts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(posts.map(p => p.id));
    }
  };

  const bulkMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: string[], action: string }) => {
        const res = await adminFetch('/api/blog/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids, action }),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed');
        return res.json();
    },
    onSuccess: (data) => {
        toast.success(data.message);
        setSelectedIds([]);
        queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleBulkAction = (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedIds.length === 0) return;
    bulkMutation.mutate({ ids: selectedIds, action });
  };

  const handleOpenAdd = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setSeoOpen(false);
    setFormOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    const tags = parseTags(post.tags);
    const blocks = normalizePageBlocks(post.blocks || '[]');

    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: turndownService.turndown(post.content || ''),
      blocks: blocks,
      coverImage: post.coverImage || '',
      authorId: post.authorId || '',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      ogImage: post.ogImage || '',
      customSchema: post.customSchema || '',
      tags: tags.join(', '),
      isPublished: post.isPublished,
    });
    setSeoOpen(!!(post.metaTitle || post.metaDescription));
    setFormOpen(true);
  };

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : generateSlug(title),
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string, data: any }) => {
        const url = id ? `/api/blog/${id}` : '/api/blog';
        const res = await adminFetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed');
        return res.json();
    },
    onSuccess: () => {
        toast.success(editingPost ? 'Post updated' : 'Post created');
        setFormOpen(false);
        queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Post title is required');
      return;
    }

    const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || generateSlug(form.title),
        excerpt: form.excerpt.trim() || null,
        content: (await marked.parse(form.content.trim() || '')),
        coverImage: form.coverImage.trim() || null,
        authorId: form.authorId || null,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        ogImage: form.ogImage.trim() || null,
        customSchema: form.customSchema.trim() || null,
        tags: form.tags || null,
        isPublished: form.isPublished,
    };

    saveMutation.mutate({ id: editingPost?.id, data: payload });
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminFetch('/api/blog/import', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Imported ${data.imported} blog post(s)`);
        if (data.errors && data.errors.length > 0) {
          toast.warning(`${data.errors.length} error(s) during import`);
        }
        queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      } else {
        const err = await res.json();
        toast.error(err.error || 'Import failed');
      }
    } catch {
      toast.error('Import failed');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleCSVExport = async () => {
    setExporting(true);
    try {
      const res = await adminFetch('/api/blog/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blog-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Blog posts exported');
      } else {
        toast.error('Export failed');
      }
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/blog/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
        toast.success('Post moved to trash');
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    }
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/blog/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ restore: true }),
        });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
        toast.success('Post restored');
        queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    }
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/blog/${id}?permanent=true`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
        toast.success('Post permanently deleted');
        setPermanentDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    }
  });

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id);
  };

  const handlePermanentDelete = () => {
    if (permanentDeleteId) permanentDeleteMutation.mutate(permanentDeleteId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blog Posts</h2>
          <p className="text-muted-foreground mt-1">Manage your blog posts and articles</p>
        </div>
        {activeTab === 'active' && (
          <div className="flex items-center gap-2 flex-wrap">
            <label className="cursor-pointer">
              <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} disabled={importing} />
              <Button variant="outline" size="sm" disabled={importing} asChild>
                <span>
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  {importing ? 'Importing...' : 'Import CSV'}
                </span>
              </Button>
            </label>
            <Button variant="outline" size="sm" disabled={exporting} onClick={handleCSVExport}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button onClick={handleOpenAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Post
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSelectedIds([]); }}>
        <TabsList>
          <TabsTrigger value="active">
            <BookOpen className="mr-2 h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="trashed">
            <Trash className="mr-2 h-4 w-4" />
            Trash
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => { queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] }); }}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <Card className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-sm font-medium">
            {selectedIds.length} post(s) selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={bulkMutation.isPending}
              onClick={() => handleBulkAction('publish')}
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkMutation.isPending}
              onClick={() => handleBulkAction('unpublish')}
            >
              <EyeOff className="mr-1 h-3.5 w-3.5" />
              Unpublish
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkMutation.isPending}
              className="text-rose-600 hover:text-rose-700"
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </Card>
      )}

      {/* Posts Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No posts found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm
                ? 'Try adjusting your search'
                : 'Create your first blog post to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.length === posts.length && posts.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Published</TableHead>
                  <TableHead className="hidden lg:table-cell">Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(post.id)}
                        onCheckedChange={() => toggleSelect(post.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{post.title}</p>
                        <p className="text-xs text-muted-foreground">
                          /{post.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {post.User?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          post.isPublished
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }
                      >
                        {post.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {parseTags(post.tags).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {parseTags(post.tags).slice(0, 2).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {parseTags(post.tags).length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{parseTags(post.tags).length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {activeTab === 'trashed' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleRestore(post.id)}
                              title="Restore"
                            >
                              <Undo2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => setPermanentDeleteId(post.id)}
                              title="Permanent Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenEdit(post)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => setDeleteId(post.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh]">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Edit Post' : 'Add Post'}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <ScrollArea className="max-h-[calc(95vh-180px)] pr-4">
              <TabsContent value="content" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="post-title">
                    Title <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="post-title"
                    placeholder="Post title"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="post-excerpt">Excerpt</Label>
                  <Textarea
                    id="post-excerpt"
                    placeholder="Brief summary of the post..."
                    value={form.excerpt}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, excerpt: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <WysiwygEditor
                    value={form.content}
                    onChange={(value) => setForm(prev => ({ ...prev, content: value }))}
                    minHeight="400px"
                    placeholder="Start writing your blog post..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="post-slug">Slug</Label>
                    <Input
                      id="post-slug"
                      placeholder="post-slug"
                      value={form.slug}
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, slug: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Author</Label>
                    <Select
                      value={form.authorId}
                      onValueChange={(val) =>
                        setForm(prev => ({ ...prev, authorId: val }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select author" />
                      </SelectTrigger>
                      <SelectContent>
                        {authors.map((author) => (
                          <SelectItem key={author.id} value={author.id}>
                            {author.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="post-cover"
                      placeholder="https://example.com/cover.jpg"
                      value={form.coverImage}
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, coverImage: e.target.value }))
                      }
                      className="flex-1"
                    />
                    <label className="cursor-pointer shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setSaving(true);
                          const fd = new FormData();
                          fd.append('file', file);
                          const res = await adminFetch('/api/upload', { method: 'POST', body: fd });
                          if (res.ok) {
                            const data = await res.json();
                            setForm(prev => ({ ...prev, coverImage: data.url }));
                            toast.success('Cover image uploaded');
                          } else {
                            toast.error('Upload failed');
                          }
                          setSaving(false);
                          e.target.value = '';
                        }}
                      />
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span><Upload className="mr-1.5 h-3.5 w-3.5" />Upload</span>
                      </Button>
                    </label>
                  </div>
                  {form.coverImage && (
                    <img
                      src={form.coverImage}
                      alt="Cover preview"
                      className="h-32 w-full rounded-md object-cover bg-muted mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="post-tags">Tags</Label>
                  <Input
                    id="post-tags"
                    placeholder="tag1, tag2, tag3"
                    value={form.tags}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, tags: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated tags</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={form.isPublished}
                    onCheckedChange={(checked) =>
                      setForm(prev => ({ ...prev, isPublished: checked }))
                    }
                  />
                  <Label
                    className="cursor-pointer"
                    onClick={() => setForm(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                  >
                    Published
                  </Label>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <SearchCode className="h-4 w-4" />
                    SEO Settings
                  </h4>
                  <div className="space-y-2">
                    <Label htmlFor="post-meta-title">Meta Title</Label>
                    <Input
                      id="post-meta-title"
                      placeholder="Post Title | Site Name"
                      value={form.metaTitle}
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, metaTitle: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-meta-desc">Meta Description</Label>
                    <Textarea
                      id="post-meta-desc"
                      placeholder="A brief description for search engines..."
                      value={form.metaDescription}
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, metaDescription: e.target.value }))
                      }
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-og-image">OG Image URL</Label>
                    <Input
                      id="post-og-image"
                      placeholder="https://example.com/og-image.jpg"
                      value={form.ogImage}
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, ogImage: e.target.value }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Image shown when this post is shared on social media (recommended 1200×630px)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-custom-schema">Custom JSON-LD Schema (optional)</Label>
                    <Textarea
                      id="post-custom-schema"
                      placeholder='{"@type": "BlogPosting", ...}'
                      value={form.customSchema}
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, customSchema: e.target.value }))
                      }
                      rows={3}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Override or extend the default JSON-LD schema. Must be valid JSON.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete (Move to Trash) Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move this blog post to trash? You can restore it later from the Trash tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleteMutation.isPending ? 'Moving...' : 'Move to Trash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation */}
      <AlertDialog open={!!permanentDeleteId} onOpenChange={() => setPermanentDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This blog post will be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              disabled={permanentDeleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {permanentDeleteMutation.isPending ? 'Deleting...' : 'Permanent Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
