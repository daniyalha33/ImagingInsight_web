import { useState, useRef, useEffect } from 'react';
import { Search, Send, RefreshCw } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { ScrollArea } from '../../ui/scroll-area';

// TypeScript interfaces for students and messages
interface Student {
  chatId: string;
  studentName: string;
  studentEmail: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime?: string;
}

interface Message {
  id: string;
  isOwn: boolean;
  senderName: string;
  timestamp: string;
  content: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export function TeacherChatScreen({ teacherName }: { teacherName?: string }) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  // Get token from localStorage (adjust based on your auth setup)
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch chat list
  const fetchChatList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/list`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setStudents(data.chats || []);
        setError('');
      } else {
        setError(data.message || 'Failed to load chats');
      }
    } catch (err) {
      let msg = 'Error loading chats';
      if (err instanceof Error) msg += ': ' + err.message;
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (chatId: string) => {
    if (!chatId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/chat/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(data.chat.messages || []);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedStudent?.chatId || isSending) return;

    const messageText = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/${selectedStudent.chatId}/message`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: messageText }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      } else {
        setMessage(messageText);
        alert(data.message || 'Failed to send message');
      }
    } catch (err) {
      setMessage(messageText);
      let msg = 'Error sending message';
      if (err instanceof Error) msg += ': ' + err.message;
      alert(msg);
    } finally {
      setIsSending(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Filter students
  const filteredStudents = students.filter(student =>
    student.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Initial load
  useEffect(() => {
    fetchChatList();
  }, []);

  // Load messages when student is selected
  useEffect(() => {
    if (selectedStudent?.chatId) {
      fetchMessages(selectedStudent.chatId);
      
      // Start polling for new messages
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages(selectedStudent.chatId);
      }, 3000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedStudent]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchChatList} className="bg-blue-600 hover:bg-blue-700">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-blue-50">
      {/* Student List */}
      <div className="w-80 border-r border-blue-200 bg-white flex flex-col">
        <div className="p-4 border-b border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-blue-600 text-lg font-semibold">Student Queries</h3>
              {teacherName && <p className="text-xs text-blue-400">Signed in as {teacherName}</p>}
            </div>
            <button
              onClick={fetchChatList}
              className="p-1 hover:bg-blue-50 rounded"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-blue-600" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-blue-400">
                {searchQuery ? 'No students found' : 'No student queries yet'}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.chatId}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    selectedStudent?.chatId === student.chatId
                      ? 'bg-blue-100'
                      : 'hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        {student.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-blue-900 truncate font-medium text-sm">
                          {student.studentName}
                        </h4>
                        {student.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {student.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-blue-700 truncate text-sm">
                        {student.lastMessage}
                      </p>
                      <p className="text-blue-400 text-xs mt-1">
                        {student.lastMessageTime
                          ? new Date(student.lastMessageTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedStudent ? (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50/50 to-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-blue-200 bg-blue-600 flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-white text-blue-600">
                {selectedStudent.studentName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="text-white font-semibold">{selectedStudent.studentName}</h4>
              <p className="text-blue-100 text-sm">{selectedStudent.studentEmail}</p>
            </div>
            <button
              onClick={() => fetchMessages(selectedStudent.chatId)}
              className="p-2 hover:bg-blue-700 rounded"
              title="Refresh messages"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-blue-400">
                  No messages yet
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%]`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.isOwn && (
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {msg.senderName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <p className="text-blue-400 text-xs">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-lg shadow ${
                          msg.isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-blue-200 text-blue-900'
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-blue-200 bg-white">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isSending}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50/30 to-white">
          <div className="text-center">
            <h3 className="text-blue-900 mb-2 font-semibold text-lg">
              No conversation selected
            </h3>
            <p className="text-blue-400">
              {students.length === 0
                ? 'Waiting for student queries...'
                : 'Select a student to view messages'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}