import { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
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
import { RefreshCw } from 'lucide-react';
// TypeScript interfaces for student and class
interface StudentClass {
  id: string;
  name: string;
  avgScore: number;
}
interface Student {
  id: string;
  name: string;
  avatar: string;
  email: string;
  classes: StudentClass[];
}
interface StudentToDelete {
  studentId: string;
  studentName: string;
}

export function AllStudentsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<StudentToDelete | null>(null);
  const [classNameInput, setClassNameInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState<Student[]>([]);

  // Fetch students from backend
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/students', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch students');
      }

      if (data.success && data.students) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDeleteStudent = async () => {
    if (!studentToDelete || !classNameInput.trim()) {
      setError('Please enter a class name');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const student = students.find(s => s.id === studentToDelete.studentId);
      const matchingClass = student?.classes.find(
        c => c.name.toLowerCase() === classNameInput.trim().toLowerCase()
      );

      if (!matchingClass) {
        setError('Class not found for this student');
        setIsDeleting(false);
        return;
      }

      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:5000/api/admin/class/${matchingClass.id}/student/${studentToDelete.studentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove student');
      }

      // Update local state
      setStudents(students.map((student: Student) => {
        if (student.id === studentToDelete.studentId) {
          const updatedClasses = student.classes.filter((c: StudentClass) => c.id !== matchingClass.id);
          if (updatedClasses.length === 0) {
            return null as any;
          }
          return { ...student, classes: updatedClasses };
        }
        return student;
      }).filter(Boolean));

      setStudentToDelete(null);
      setClassNameInput('');
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to remove student');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStudents = students.filter((student: Student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.classes.some((c: StudentClass) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-600 text-white p-6 rounded-lg mb-8 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white mb-2 text-2xl font-semibold">All Students</h1>
              <p className="text-blue-100">Manage all students in the system</p>
            </div>
            <Button
              onClick={fetchStudents}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Search Bar */}
          <Card className="p-4 border-blue-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search students by name, email, or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Students List */}
          <Card className="p-6 border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-900 text-lg font-semibold">
                Students ({filteredStudents.length})
              </h3>
            </div>
            
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-500">Loading students...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={fetchStudents} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No students found matching your search' : 'No students found'}
                </div>
              ) : (
                filteredStudents.map((student: Student) => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-blue-600 text-white text-lg">
                          {student.avatar}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-blue-900 font-semibold">{student.name}</h4>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                          {student.classes.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setStudentToDelete({ studentId: student.id, studentName: student.name })}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">Enrolled Classes:</p>
                          {student.classes.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {student.classes.map((cls: StudentClass) => (
                                <Badge 
                                  key={cls.id} 
                                  variant="outline" 
                                  className="bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  {cls.name} • {cls.avgScore}%
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">Not enrolled in any classes</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!studentToDelete} onOpenChange={() => {
          setStudentToDelete(null);
          setClassNameInput('');
          setError('');
        }}>
          <AlertDialogContent className="bg-white rounded-xl shadow-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900">
                Remove Student from Class
              </AlertDialogTitle>

              <AlertDialogDescription className="text-gray-600">
                {studentToDelete && (
                  <>
                    You are about to remove <strong>{studentToDelete.studentName}</strong> from a class.
                    Please enter the exact class name to confirm.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="my-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Name
              </label>
              <Input
                type="text"
                placeholder="Enter class name exactly as shown"
                value={classNameInput}
                onChange={(e) => {
                  setClassNameInput(e.target.value);
                  setError('');
                }}
                className={error ? 'border-red-500' : ''}
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
              {studentToDelete && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Available classes:</p>
                  <div className="mt-1 space-y-1">
                    {students
                      .find(s => s.id === studentToDelete.studentId)
                      ?.classes.map(cls => (
                        <p key={cls.id} className="text-sm text-blue-600">• {cls.name}</p>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel 
                className="text-gray-600 hover:bg-gray-100"
                disabled={isDeleting}
              >
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleDeleteStudent}
                disabled={isDeleting || !classNameInput.trim()}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isDeleting ? 'Removing...' : 'Remove Student'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}