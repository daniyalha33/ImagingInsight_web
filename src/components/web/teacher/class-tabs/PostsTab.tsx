import { useState, useEffect } from 'react';
import { Send, MoreVertical, Trash2, Loader2, AlertCircle, Heart } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Textarea } from '../../../ui/textarea';
import { Avatar, AvatarFallback } from '../../../ui/avatar';
import { Alert, AlertDescription } from '../../../ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';

const API_URL = 'http://localhost:5000/api';

interface PostsTabProps {
  classId: string;
}

export function PostsTab({ classId }: PostsTabProps) {
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  // track which posts have their comments expanded in the UI
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const toggleCommentsExpanded = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  useEffect(() => {
    fetchPosts();
  }, [classId]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // New helpers: format fallback for unknown user ids and normalize likes/comments
  const formatUserFallback = (idOrStr: string | undefined) => {
    if (!idOrStr) return 'User';
    // show short suffix of id to avoid printing full raw id
    const s = String(idOrStr);
    if (s.length <= 10) return s;
    return `User ${s.slice(-4)}`;
  };

  const normalizeLikeEntry = (l: any) => {
    if (!l) return { id: undefined, name: 'User' };
    if (typeof l === 'string') return { id: l, name: formatUserFallback(l) };
    // object case
    const id = l._id || l.id || undefined;
    const name = l.name || l.displayName || l.username || l.fullName || formatUserFallback(id);
    return { id, name };
  };

  // Simplified normalizeComment using nullish coalescing and a predictable author shape
  const normalizeComment = (c: any) => {
    if (!c) return null;

    const content = c.content ?? c.text ?? c.body ?? c.message ?? '';

    const author = (c.author && typeof c.author === 'object')
      ? {
          id: c.author._id ?? c.author.id,
          name: c.author.name ?? 'Student',
          profileImage: c.author.profileImage ?? c.author.avatar ?? null,
        }
      : {
          id: c.author ?? undefined,
          name: c.authorName ?? 'Student',
          profileImage: c.authorProfileImage ?? null,
        };

    return { ...c, content, author };
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/classes/${classId}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        // debug: show full first post to confirm whether comments are returned by the API
        try { console.log('Full first post:', JSON.stringify(data.data[0], null, 2)); } catch (e) { console.debug('Could not stringify first post'); }
        console.log('RAW first post comments:', JSON.stringify(data.data[0]?.comments, null, 2));
        const currentUserId = localStorage.getItem('userId');
        const normalized = (data.data || []).map((p: any) => {
          const rawLikes = Array.isArray(p.likes) ? p.likes : [];
          const rawComments = Array.isArray(p.comments) ? p.comments : [];

          // Normalize likes
          const likes = rawLikes.map((l: any) => normalizeLikeEntry(l));

          // Normalize comments and add logs to help debugging missing text issues
          const comments = rawComments.map((c: any) => {
            const result = normalizeComment(c);
            try {
              console.debug('raw comment:', JSON.stringify(c));
              console.debug('normalized comment:', JSON.stringify(result));
            } catch (e) {
              // ignore circular JSON errors
              console.debug('raw/normalized comment (non-serializable)');
            }
            return result;
          }).filter(Boolean);

          const likeCount = p.likeCount ?? likes.length ?? 0;
          const commentCount = p.commentCount ?? p.commentsCount ?? comments.length ?? 0;
          const liked = !!p.liked || !!p.likedByCurrentUser || (currentUserId ? likes.some((l: any) => (l.id || l._id || l) === currentUserId) : false);

          return { ...p, likes, likeCount, comments, commentCount, liked };
        });
        setPosts(normalized);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    setCreating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/classes/${classId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newPost })
      });

      const data = await response.json();

      if (data.success) {
        // instead of inserting the returned post object (which may not contain populated comments/author), re-fetch the posts
        setNewPost('');
        await fetchPosts();
      } else {
        setError(data.message || 'Failed to create post');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Create post error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/classes/${classId}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setPosts(posts.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  const handleToggleLike = async (postId: string) => {
    const token = localStorage.getItem('token');

    // Optimistic update: toggle liked and adjust likeCount
    let prevPosts: any[] = [];
    setPosts((prev) => {
      prevPosts = prev;
      return prev.map((p) => {
        if (p._id !== postId) return p;
        const currentCount = p.likeCount ?? (Array.isArray(p.likes) ? p.likes.length : 0);
        const currentlyLiked = !!p.liked;
        return { ...p, liked: !currentlyLiked, likeCount: currentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1 };
      });
    });

    try {
      const res = await fetch(`${API_URL}/classes/${classId}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!data.success) {
        // revert
        setPosts(prevPosts);
      } else {
        // refresh to get accurate server state (comments, like lists, counts)
        await fetchPosts();
      }
    } catch (err) {
      console.error('Toggle like error:', err);
      setPosts(prevPosts);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Create Post */}
      <Card className="p-6 border-blue-100">
        <h3 className="text-blue-900 mb-4 font-semibold">Create Announcement</h3>

        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-900">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Textarea
          placeholder="Share an announcement with your students..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          disabled={creating}
          className="min-h-[120px] mb-4 bg-blue-50/50 border-blue-200"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleCreatePost}
            disabled={!newPost.trim() || creating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Post Announcement
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post._id} className="p-6 border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(post.author?.name || 'Unknown')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-blue-900 font-medium">{post.author?.name}</h4>
                  <p className="text-gray-500 text-sm">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleDeletePost(post._id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

            {/* Comment previews */}
            {post.comments && post.comments.length > 0 && (
              <div className="mb-3 space-y-2">
                {(() => {
                  const isExpanded = !!expandedComments[post._id];
                  const visible = isExpanded ? post.comments : post.comments.slice(0, 2);
                  return visible.map((c: any, i: number) => {
                    const commentText = c.content ?? c.text ?? c.body ?? c.message ?? '';
                    const authorName = c.author?.name ?? c.authorName ?? 'Student';
                    const authorImg = c.author?.profileImage ?? c.authorProfileImage ?? null;

                    return (
                      <div key={c._id || i} className="flex items-start gap-2">
                        <Avatar className="w-6 h-6 shrink-0">
                          {authorImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={authorImg} alt={authorName} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {getInitials(authorName)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="bg-gray-100 rounded-lg px-3 py-1.5 flex-1 min-w-0">
                          {/* Only show comment content (no full username) */}
                          <span className="text-sm text-gray-800 break-words">{commentText}</span>
                        </div>
                      </div>
                    );
                  })
                })()}

                {post.comments.length > 2 && (
                  <div className="pl-8">
                    <button
                      onClick={() => toggleCommentsExpanded(post._id)}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      {expandedComments[post._id] ? 'Show less' : `+${post.comments.length - 2} more comment${post.comments.length - 2 > 1 ? 's' : ''}`}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 text-gray-500 pt-4 border-t border-blue-100 text-sm">
              {/* Comments count on the left */}
              <span>{post.commentCount ?? post.comments?.length ?? 0} comments</span>

              {/* Likes floated to the right with who liked */}
              <div className="ml-auto text-sm flex items-center gap-3">
                <button
                  onClick={() => handleToggleLike(post._id)}
                  className={"flex items-center gap-2 " + (post.liked ? 'text-red-600' : 'text-gray-500')}
                  aria-pressed={!!post.liked}
                >
                  <Heart className="w-4 h-4" />
                  <span>{post.likeCount ?? (Array.isArray(post.likes) ? post.likes.length : 0)}</span>
                </button>

                {/* Who liked (first two names) */}
                {post.likes && post.likes.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {(() => {
                      const names = post.likes.slice(0, 2).map((l: any) => l.name || l.displayName || (typeof l === 'string' ? l : 'User'));
                      const rest = (post.likeCount ?? post.likes.length) - names.length;
                      return (
                        <>
                          Liked by {names.join(', ')}{rest > 0 ? ` and ${rest} others` : ''}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <Card className="p-12 text-center border-blue-100 border-dashed">
          <h4 className="text-blue-900 mb-2 font-semibold">No announcements yet</h4>
          <p className="text-gray-600">Create your first announcement to communicate with students</p>
        </Card>
      )}
    </div>
  );
}