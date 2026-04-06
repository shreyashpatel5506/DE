import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, MessageCircle, Share2, Search, TrendingUp, Clock, Users, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

type LivePost = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  author: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  image: string | null;
  liked: boolean;
  location?: string;
};

type PostComment = {
  text: string;
  user?: {
    _id?: string;
    userName?: string;
    email?: string;
  };
  createdAt?: string;
  _optimistic?: boolean;
};

const statusConfig = {
  Resolved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Resolved' },
  'In Progress': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'In Progress' },
  Pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Pending' },
  Verified: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', label: 'Verified' }
};

const typeConfig = {
  issue: { icon: CheckCircle, color: 'text-blue-500' },
  update: { icon: TrendingUp, color: 'text-green-500' },
};

function getRelativeTime(input?: string) {
  if (!input) return 'Recently';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function HomePage() {
  const [posts, setPosts] = useState<LivePost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [commentsByPost, setCommentsByPost] = useState<Record<string, PostComment[]>>({});
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const { userId, userName } = useAuth();

  const hydrateFromCache = () => {
    try {
      const raw = localStorage.getItem('home_posts_cache');
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (Array.isArray(cached)) {
        setPosts(cached);
      }
    } catch {
      // ignore bad cache
    }
  };

  const persistCache = (nextPosts: LivePost[]) => {
    try {
      localStorage.setItem('home_posts_cache', JSON.stringify(nextPosts));
    } catch {
      // ignore storage limitations
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get('/api/getposts?limit=50&page=1');
      if (!response.data.success) {
        toast.error('Failed to load live posts');
        return;
      }

      const mapped: LivePost[] = (response.data.posts || []).map((post: any) => ({
        id: String(post._id),
        title: post.title || 'Untitled Issue',
        description: post.description || 'No description provided.',
        category: post.category || post.department || 'Other',
        status: post.status || 'Pending',
        author: post.createdUser?.userName || post.createdUser?.email || 'Citizen Reporter',
        timestamp: getRelativeTime(post.createdAt),
        likes: Number(post.likesCount || 0),
        comments: Number(post.commentsCount || 0),
        shares: 0,
        image: post.imageUrl || null,
        liked: Array.isArray(post.likes) && userId
          ? post.likes.some((likeId: string) => String(likeId) === String(userId))
          : false,
        location: post.location,
      }));

      setPosts(mapped);
      persistCache(mapped);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to fetch live posts');
    }
  };

  useEffect(() => {
    hydrateFromCache();
    fetchPosts();
  }, [userId]);

  const stats = useMemo(() => {
    const resolved = posts.filter((p) => p.status === 'Resolved').length;
    const inProgress = posts.filter((p) => p.status === 'In Progress').length;
    const pending = posts.filter((p) => p.status === 'Pending').length;
    return { resolved, inProgress, pending, total: posts.length };
  }, [posts]);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLike = async (postId: string) => {
    if (!userId) {
      toast.info('Please login as citizen to like a post');
      return;
    }

    const previousPosts = posts;
    const target = previousPosts.find((p) => p.id === postId);
    if (!target) return;

    const optimisticLiked = !target.liked;
    const optimisticLikes = optimisticLiked ? target.likes + 1 : Math.max(0, target.likes - 1);

    setPosts((prev) => prev.map((post) =>
      post.id === postId
        ? { ...post, liked: optimisticLiked, likes: optimisticLikes }
        : post,
    ));

    try {
      const response = await api.post(`/api/posts/like?id=${postId}`, { userId });
      if (!response.data.success) {
        setPosts(previousPosts);
        toast.error(response.data.message || 'Like update failed');
        return;
      }

      setPosts((prev) => prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: response.data.isLiked,
              likes: Number(response.data.likesCount || post.likes),
            }
          : post,
      ));
    } catch (error: any) {
      setPosts(previousPosts);
      toast.error(error.response?.data?.message || 'Could not update like');
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const response = await api.get(`/api/posts/fetchComments?id=${postId}`);
      if (!response.data.success) return;

      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: response.data.comments || [],
      }));
    } catch {
      // silent fail for instant UX
    }
  };

  const handleCommentOpen = async (postId: string) => {
    setActivePostId(postId);
    if (!commentsByPost[postId]) {
      await fetchComments(postId);
    }
  };

  const submitComment = async () => {
    if (!activePostId) return;
    if (!commentInput.trim()) return;
    if (!userId) {
      toast.info('Please login as citizen to comment');
      return;
    }

    const content = commentInput.trim();
    const optimisticComment: PostComment = {
      text: content,
      user: {
        _id: userId,
        userName: userName || 'You',
      },
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

    const previousComments = commentsByPost[activePostId] || [];

    setCommentInput('');
    setCommentsByPost((prev) => ({
      ...prev,
      [activePostId]: [...(prev[activePostId] || []), optimisticComment],
    }));
    setPosts((prev) => prev.map((post) =>
      post.id === activePostId
        ? { ...post, comments: post.comments + 1 }
        : post,
    ));

    try {
      setIsCommentSubmitting(true);
      const response = await api.post(`/api/posts/AddComments?id=${activePostId}`, {
        text: content,
        userId,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Comment failed');
      }

      const newComments = response.data.post?.comments || [];
      setCommentsByPost((prev) => ({
        ...prev,
        [activePostId]: newComments,
      }));
      setPosts((prev) => prev.map((post) =>
        post.id === activePostId
          ? { ...post, comments: Number(response.data.post?.commentsCount || newComments.length || post.comments) }
          : post,
      ));
    } catch (error: any) {
      setCommentsByPost((prev) => ({
        ...prev,
        [activePostId]: previousComments,
      }));
      setPosts((prev) => prev.map((post) =>
        post.id === activePostId
          ? { ...post, comments: Math.max(0, post.comments - 1) }
          : post,
      ));
      toast.error(error.response?.data?.message || error.message || 'Could not add comment');
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/#post-${postId}`);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          CivicReport Community
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Stay updated with the latest infrastructure improvements, community announcements, 
          and civic developments in your area. Together, we're building a better community.
        </p>
        
        {/* Search */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="font-semibold">{stats.resolved}</div>
            <div className="text-sm text-muted-foreground">Issues Resolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="font-semibold">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="font-semibold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Live Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="font-semibold">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">No Posts Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms to find relevant posts.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map(post => {
            const TypeIcon = typeConfig.issue.icon;
            return (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-muted">
                        <TypeIcon className={`w-4 h-4 ${typeConfig.issue.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-muted-foreground">{post.author}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{post.category}</Badge>
                      {post.status && statusConfig[post.status as keyof typeof statusConfig] && (
                        <Badge className={statusConfig[post.status as keyof typeof statusConfig].color}>
                          {statusConfig[post.status as keyof typeof statusConfig].label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="text-base leading-relaxed">
                    {post.description}
                  </CardDescription>

                  {post.image && (
                    <div className="rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={post.image}
                        alt={post.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}

                  {/* Social Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-2 transition-colors ${
                          post.liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                        <span>{post.likes}</span>
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCommentOpen(post.id)}
                            className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Comments</DialogTitle>
                            <DialogDescription>{post.title}</DialogDescription>
                          </DialogHeader>

                          <div className="space-y-3 max-h-72 overflow-auto pr-1">
                            {(commentsByPost[post.id] || []).length === 0 ? (
                              <p className="text-sm text-muted-foreground">No comments yet.</p>
                            ) : (
                              (commentsByPost[post.id] || []).map((comment, index) => (
                                <div key={`${comment.createdAt || 'c'}-${index}`} className="rounded-md border p-3">
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {comment.user?.userName || comment.user?.email || 'Citizen'}
                                  </div>
                                  <div className="text-sm">{comment.text}</div>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="space-y-2">
                            <Textarea
                              placeholder="Write a comment..."
                              value={activePostId === post.id ? commentInput : ''}
                              onChange={(e) => {
                                setActivePostId(post.id);
                                setCommentInput(e.target.value);
                              }}
                              rows={3}
                            />
                            <div className="flex justify-end">
                              <Button onClick={submitComment} disabled={isCommentSubmitting || activePostId !== post.id}>
                                {isCommentSubmitting && activePostId === post.id ? 'Posting...' : 'Post Comment'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(post.id)}
                        className="flex items-center space-x-2 text-muted-foreground hover:text-green-500 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{post.shares}</span>
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Post #{post.id}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 border-0">
        <CardContent className="text-center py-8">
          <h3 className="mb-2">Have an Infrastructure Issue?</h3>
          <p className="text-muted-foreground mb-4">
            Report issues in your area and help us maintain our community infrastructure.
          </p>
          <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
            Report an Issue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}