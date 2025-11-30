import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, X } from 'lucide-react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';

export function StudentPerformanceScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const [topStudents, setTopStudents] = useState([
    { id: '1', name: 'Sarah Ahmed', avatar: 'SA', avgScore: 94, trend: 'up', improvement: 8 },
    { id: '2', name: 'Fatima Noor', avatar: 'FN', avgScore: 91, trend: 'up', improvement: 5 },
    { id: '3', name: 'Ahmed Khan', avatar: 'AK', avgScore: 87, trend: 'up', improvement: 3 },
    { id: '4', name: 'Ali Raza', avatar: 'AR', avgScore: 76, trend: 'down', improvement: -2 },
  ]);

  const handleDeleteStudent = () => {
    if (studentToDelete) {
      setTopStudents(topStudents.filter(s => s.id !== studentToDelete));
      setStudentToDelete(null);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-600 text-white p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-white mb-2 text-lg">Student Performance</h1>
          <p className="text-muted-foreground">Track student progress and achievements</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-blue-900">Overview</h2>

          {/* Top Performers */}
          <Card className="p-6 border-blue-100">
            <h3 className="text-blue-900 mb-4">Top Performers</h3>
            <div className="space-y-3">
              {topStudents.map((student, index) => (
                <div key={student.id} className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg group">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    {index + 1}
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {student.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-blue-900">{student.name}</h4>
                    <p className="text-muted-foreground">Average: {student.avgScore}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={student.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {student.improvement > 0 ? '+' : ''}{student.improvement}%
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStudentToDelete(student.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Student</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this student from the system? This action cannot be undone and will remove all their data, progress, and assessments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStudent}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Student
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
