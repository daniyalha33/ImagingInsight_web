import { useState } from 'react';
import { Search, Mail, MessageSquare, BarChart3, MoreVertical } from 'lucide-react';
import { Input } from '../../../ui/input';
import { Card } from '../../../ui/card';
import { Avatar, AvatarFallback } from '../../../ui/avatar';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';

interface StudentsTabProps {
  classId: string;
}

export function StudentsTab({ classId }: StudentsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const students = [
    {
      id: '1',
      name: 'Ahmed Khan',
      email: 'ahmed.khan@student.com',
      avatar: 'AK',
      joinedAt: '2024-09-15',
      testsCompleted: 8,
      totalTests: 10,
      averageScore: 87,
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Sarah Ahmed',
      email: 'sarah.ahmed@student.com',
      avatar: 'SA',
      joinedAt: '2024-09-16',
      testsCompleted: 10,
      totalTests: 10,
      averageScore: 94,
      lastActive: '1 day ago'
    },
    {
      id: '3',
      name: 'Ali Raza',
      email: 'ali.raza@student.com',
      avatar: 'AR',
      joinedAt: '2024-09-17',
      testsCompleted: 7,
      totalTests: 10,
      averageScore: 76,
      lastActive: '3 hours ago'
    },
    {
      id: '4',
      name: 'Fatima Noor',
      email: 'fatima.noor@student.com',
      avatar: 'FN',
      joinedAt: '2024-09-18',
      testsCompleted: 9,
      totalTests: 10,
      averageScore: 91,
      lastActive: '5 hours ago'
    },
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-600';
    if (score >= 75) return 'bg-blue-100 text-blue-600';
    if (score >= 60) return 'bg-amber-100 text-amber-600';
    return 'bg-red-100 text-red-600';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-blue-900">Students ({students.length})</h3>
          <p className="text-muted-foreground">Monitor student progress and engagement</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="p-5 border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {student.avatar}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-blue-900">{student.name}</h4>
                    <Badge className={getScoreBadge(student.averageScore)}>
                      {student.averageScore}% avg
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{student.email}</p>
                </div>

                <div className="grid grid-cols-3 gap-6 mr-4">
                  <div className="text-center">
                    <p className="text-muted-foreground">Tests</p>
                    <p className="text-foreground">{student.testsCompleted}/{student.totalTests}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Avg Score</p>
                    <p className={getScoreColor(student.averageScore)}>
                      {student.averageScore}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Last Active</p>
                    <p className="text-foreground">{student.lastActive}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Performance
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
