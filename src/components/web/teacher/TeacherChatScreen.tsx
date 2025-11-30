import { useState } from 'react';
import { Search, Send } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { ScrollArea } from '../../ui/scroll-area';

interface TeacherChatScreenProps {
  teacherName: string;
}

export function TeacherChatScreen({ teacherName }: TeacherChatScreenProps) {
  const [selectedStudent, setSelectedStudent] = useState<string | null>('1');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const students = [
    { id: '1', name: 'Ahmed Khan', avatar: 'AK', lastMessage: 'Thank you for the clarification!', timestamp: '2 min ago', unread: 2 },
    { id: '2', name: 'Sarah Ahmed', avatar: 'SA', lastMessage: 'Can you explain the liver segmentation task?', timestamp: '1 hour ago', unread: 1 },
    { id: '3', name: 'Ali Raza', avatar: 'AR', lastMessage: 'I uploaded my assignment', timestamp: '2 hours ago', unread: 0 },
  ];

  const messages = selectedStudent === '1' ? [
    { id: '1', senderId: '1', senderName: 'Ahmed Khan', content: 'Hi Dr. Mustafa, I have a question about the CT scan quiz', timestamp: '10:30 AM', isOwn: false },
    { id: '2', senderId: 'teacher', senderName: teacherName, content: 'Of course! What would you like to know?', timestamp: '10:32 AM', isOwn: true },
    { id: '3', senderId: '1', senderName: 'Ahmed Khan', content: 'Could you explain question 5 about the Hounsfield units?', timestamp: '10:33 AM', isOwn: false },
    { id: '4', senderId: 'teacher', senderName: teacherName, content: 'Hounsfield units measure the radiodensity of tissues. Water is 0 HU, air is -1000 HU, and bone can be +1000 HU or higher. In the quiz, you need to identify which tissue corresponds to which HU range.', timestamp: '10:35 AM', isOwn: true },
    { id: '5', senderId: '1', senderName: 'Ahmed Khan', content: 'Thank you for the clarification!', timestamp: '10:36 AM', isOwn: false },
  ] : [];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    console.log('Sending message:', message);
    setMessage('');
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex bg-blue-50">
      {/* Student List */}
      <div className="w-80 border-r border-blue-200 bg-white flex flex-col">
        <div className="p-4 border-b border-blue-200 bg-blue-600">
          <h3 className="text-white text-lg font-semibold mb-2">Student Queries</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-100" />
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
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student.id)}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  selectedStudent === student.id
                    ? 'bg-blue-100'
                    : 'hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {student.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-blue-900 truncate font-medium">{student.name}</h4>
                      {student.unread > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {student.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-blue-700 truncate text-sm">{student.lastMessage}</p>
                    <p className="text-blue-400 text-xs">{student.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
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
                {students.find(s => s.id === selectedStudent)?.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-white font-semibold">{students.find(s => s.id === selectedStudent)?.name}</h4>
              <p className="text-blue-100 text-sm">Active now</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${msg.isOwn ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.isOwn && (
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                            {students.find(s => s.id === selectedStudent)?.avatar}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <p className="text-blue-400 text-xs">{msg.timestamp}</p>
                    </div>
                    <div
                      className={`p-3 rounded-lg shadow ${
                        msg.isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-blue-200'
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-blue-200 bg-white">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50/30 to-white">
          <div className="text-center">
            <h3 className="text-blue-900 mb-2 font-semibold">No conversation selected</h3>
            <p className="text-blue-400">Select a student to view messages</p>
          </div>
        </div>
      )}
    </div>
  );
}
