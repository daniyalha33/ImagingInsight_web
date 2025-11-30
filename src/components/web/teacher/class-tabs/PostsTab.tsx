import { useState } from 'react';
import { Plus, Send, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Textarea } from '../../../ui/textarea';
import { Avatar, AvatarFallback } from '../../../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';

interface PostsTabProps {
  classId: string;
}

export function PostsTab({ classId }: PostsTabProps) {
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState([
    {
      id: '1',
      author: 'Dr. Tahir Mustafa',
      authorAvatar: 'TM',
      content: 'Welcome to Radiology Initial! Please review the CT scan basics document in the Files section before our next session.',
      timestamp: '2024-10-10 09:00',
      comments: 5
    },
    {
      id: '2',
      author: 'Dr. Tahir Mustafa',
      authorAvatar: 'TM',
      content: 'New assessment posted: Liver Segmentation Task. Deadline: October 15, 2024',
      timestamp: '2024-10-08 14:30',
      comments: 12
    },
  ]);

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const post = {
      id: Date.now().toString(),
      author: 'Dr. Tahir Mustafa',
      authorAvatar: 'TM',
      content: newPost,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      comments: 0
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Create Post */}
      <Card className="p-6 border-blue-100">
        <h3 className="text-blue-900 mb-4">Create Announcement</h3>
        <Textarea
          placeholder="Share an announcement with your students..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="min-h-[120px] mb-4 bg-blue-50/50 border-blue-200"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleCreatePost}
            disabled={!newPost.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Post Announcement
          </Button>
        </div>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-6 border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {post.authorAvatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-blue-900">{post.author}</h4>
                  <p className="text-muted-foreground">{post.timestamp}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleDeletePost(post.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-foreground mb-4">{post.content}</p>
            <div className="flex items-center gap-4 text-muted-foreground pt-4 border-t border-blue-100">
              <span>{post.comments} comments</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
