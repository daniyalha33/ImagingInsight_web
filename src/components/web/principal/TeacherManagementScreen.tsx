import { useState, useEffect } from 'react';
import { Search, X, Loader2, UserX, UserCheck } from 'lucide-react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';

const API_URL = 'http://localhost:5000/api';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

export function TeacherManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_URL}/admin/users?role=teacher&isApproved=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setTeachers(data.data);
      } else {
        setError(data.message || 'Failed to fetch teachers');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      return;
    }

    setActionLoading(teacherId);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/admin/delete-user/${teacherId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setTeachers(teachers.filter(t => t._id !== teacherId));
        setSuccessMessage('Teacher deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to delete teacher');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Delete error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (teacherId: string, currentStatus: boolean) => {
    setActionLoading(teacherId);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = currentStatus ? 'deactivate-user' : 'activate-user';

      const response = await fetch(`${API_URL}/admin/${endpoint}/${teacherId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setTeachers(teachers.map(t => 
          t._id === teacherId ? { ...t, isActive: !currentStatus } : t
        ));
        setSuccessMessage(`Teacher ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to update teacher status');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Toggle active error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-600 text-white p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-white text-2xl font-bold mb-2">All Teachers</h1>
          <p className="text-blue-100">Manage approved teachers</p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-sm text-red-900">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-sm text-green-900">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search teachers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-blue-200 focus:border-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 border-blue-100 bg-white">
            <p className="text-sm text-gray-600 mb-1">Total Teachers</p>
            <h2 className="text-2xl font-bold text-blue-900">{teachers.length}</h2>
          </Card>
          <Card className="p-4 border-blue-100 bg-white">
            <p className="text-sm text-gray-600 mb-1">Active Teachers</p>
            <h2 className="text-2xl font-bold text-green-600">
              {teachers.filter(t => t.isActive).length}
            </h2>
          </Card>
          <Card className="p-4 border-blue-100 bg-white">
            <p className="text-sm text-gray-600 mb-1">Inactive Teachers</p>
            <h2 className="text-2xl font-bold text-red-600">
              {teachers.filter(t => !t.isActive).length}
            </h2>
          </Card>
        </div>

        <div className="space-y-3">
          {filteredTeachers.length === 0 ? (
            <Card className="p-12 text-center border-blue-100 bg-white">
              <p className="text-gray-600">
                {searchQuery ? 'No teachers found matching your search' : 'No approved teachers yet'}
              </p>
            </Card>
          ) : (
            filteredTeachers.map((teacher) => (
              <Card key={teacher._id} className="p-5 border-blue-100 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-blue-900">{teacher.name}</h4>
                        <Badge 
                          className={teacher.isActive 
                            ? "bg-green-100 text-green-700 border-green-200" 
                            : "bg-red-100 text-red-700 border-red-200"
                          }
                        >
                          {teacher.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{teacher.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined: {new Date(teacher.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(teacher._id, teacher.isActive)}
                      disabled={actionLoading === teacher._id}
                      className={teacher.isActive 
                        ? "border-red-600 text-red-600 hover:bg-red-50" 
                        : "border-green-600 text-green-600 hover:bg-green-50"
                      }
                    >
                      {actionLoading === teacher._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : teacher.isActive ? (
                        <>
                          <UserX className="w-4 h-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTeacher(teacher._id)}
                      disabled={actionLoading === teacher._id}
                      className="hover:bg-red-50"
                    >
                      {actionLoading === teacher._id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <X className="w-5 h-5 text-red-600" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}