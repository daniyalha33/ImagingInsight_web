import { useState, useEffect } from 'react';
import { Send, MoreVertical, Trash2, Loader2, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
    fetchPosts();
  }, [classId]);

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
        setPosts(data.data);
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
        setPosts([data.data, ...posts]);
        setNewPost('');
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
            <div className="flex items-center gap-4 text-gray-500 pt-4 border-t border-blue-100 text-sm">
              <span>{post.comments?.length || 0} comments</span>
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