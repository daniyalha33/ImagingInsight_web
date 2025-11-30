import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback } from '../../ui/avatar';

export function TeacherManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState([
    {
      id: '1',
      name: 'Dr. Tahir Mustafa',
      email: 'tahir.mustafa@hospital.com',
      avatar: 'TM',
      classes: 3,
      students: 92,
      joinedAt: '2023-09-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Dr. Uzair Iqbal',
      email: 'uzair.iqbal@hospital.com',
      avatar: 'UI',
      classes: 2,
      students: 60,
      joinedAt: '2024-01-10',
      status: 'active'
    },
    {
      id: '3',
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@medical.com',
      avatar: 'SC',
      classes: 1,
      students: 28,
      joinedAt: '2024-03-05',
      status: 'active'
    },
  ]);

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteTeacher = (teacherId: string) => {
    setTeachers(teachers.filter(t => t.id !== teacherId));
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-white text-2xl font-bold mb-2">All Teachers</h1>
          <p className="text-blue-100">Manage teachers</p>
        </div>


        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 border-blue-100">
            <p className="text-muted-foreground mb-1">Total Teachers</p>
            <h2 className="text-blue-900">{teachers.length}</h2>
          </Card>
          <Card className="p-4 border-blue-100">
            <p className="text-muted-foreground mb-1">Total Classes</p>
            <h2 className="text-blue-900">{teachers.reduce((sum, t) => sum + t.classes, 0)}</h2>
          </Card>
          <Card className="p-4 border-blue-100">
            <p className="text-muted-foreground mb-1">Total Students</p>
            <h2 className="text-blue-900">{teachers.reduce((sum, t) => sum + t.students, 0)}</h2>
          </Card>
        </div>

        {/* Teachers List */}
        <div className="space-y-3">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="p-5 border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {teacher.avatar}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h4 className="text-blue-900 mb-1">{teacher.name}</h4>
                    <p className="text-muted-foreground">{teacher.email}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-muted-foreground">Classes</p>
                      <p className="text-foreground">{teacher.classes}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Students</p>
                      <p className="text-foreground">{teacher.students}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Joined</p>
                      <p className="text-foreground">{new Date(teacher.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTeacher(teacher.id)}
                  className="hover:bg-red-50"
                >
                  <X className="w-5 h-5 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
