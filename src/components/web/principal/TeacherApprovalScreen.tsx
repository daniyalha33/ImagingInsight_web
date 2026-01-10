import { useState, useEffect } from 'react';
import { Check, X, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../ui/dialog';
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

export function TeacherApprovalScreen() {
  const [pendingTeachers, setPendingTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const fetchPendingTeachers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_URL}/admin/pending-teachers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setPendingTeachers(data.data);
      } else {
        setError(data.message || 'Failed to fetch pending teachers');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (teacherId: string) => {
    setActionLoading(teacherId);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/admin/approve-teacher/${teacherId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setPendingTeachers(pendingTeachers.filter(t => t._id !== teacherId));
        setSuccessMessage('Teacher approved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to approve teacher');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Approve error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (teacherId: string) => {
    setActionLoading(teacherId);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/admin/reject-teacher/${teacherId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setPendingTeachers(pendingTeachers.filter(t => t._id !== teacherId));
        setSuccessMessage('Teacher registration rejected');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to reject teacher');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Reject error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailsDialog(true);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pending teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-600 text-white p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-white text-2xl font-bold mb-2">Teacher Approval Requests</h1>
          <p className="text-blue-100">Review and approve teacher registration requests</p>
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

        <div className="space-y-4">
          {pendingTeachers.length === 0 ? (
            <Card className="p-12 text-center border-blue-100 border-dashed">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">No pending requests</h4>
              <p className="text-gray-600">All teacher requests have been reviewed</p>
            </Card>
          ) : (
            pendingTeachers.map((teacher) => (
              <Card key={teacher._id} className="p-6 border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-6">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-blue-600 text-white text-lg">
                      {teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-blue-900">{teacher.name}</h3>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            Pending Review
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">Role: {teacher.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{teacher.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          Applied: {new Date(teacher.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleViewDetails(teacher)}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        disabled={actionLoading === teacher._id}
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleApprove(teacher._id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={actionLoading === teacher._id}
                      >
                        {actionLoading === teacher._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReject(teacher._id)}
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                        disabled={actionLoading === teacher._id}
                      >
                        {actionLoading === teacher._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogTitle>Teacher Application Details</DialogTitle>
          <DialogDescription>
            Review the complete application information
          </DialogDescription>
          {selectedTeacher && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-blue-600 text-white text-lg">
                    {selectedTeacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">{selectedTeacher.name}</h3>
                  <p className="text-gray-600">{selectedTeacher.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium">{selectedTeacher.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Applied Date</p>
                  <p className="font-medium">
                    {new Date(selectedTeacher.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="font-medium">{selectedTeacher.isActive ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    handleApprove(selectedTeacher._id);
                    setShowDetailsDialog(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={actionLoading === selectedTeacher._id}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    handleReject(selectedTeacher._id);
                    setShowDetailsDialog(false);
                  }}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                  disabled={actionLoading === selectedTeacher._id}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}