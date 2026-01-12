import { useState, useEffect } from 'react';
import { Plus, ClipboardList, Pencil, Eye, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';

const API_URL = 'http://localhost:5000/api';

interface TestsTabProps {
  classId: string;
  onCreateTest: () => void;
}

export function TestsTab({ classId, onCreateTest }: TestsTabProps) {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, [classId]);

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tests/class/${classId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setTests(data.data);
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tests/${testId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setTests(tests.filter(t => t._id !== testId));
      }
    } catch (err) {
      console.error('Delete test error:', err);
    }
  };

  const handleUpdateStatus = async (testId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (data.success) {
        setTests(tests.map(t => t._id === testId ? { ...t, status } : t));
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'mcq' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-600';
      case 'draft':
        return 'bg-gray-100 text-gray-600';
      case 'closed':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-blue-900">Assessments</h3>
          <p className="text-gray-600">Create and manage tests for your students</p>
        </div>
        <Button
          onClick={onCreateTest}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Assessment
        </Button>
      </div>

      {/* Tests List */}
      {tests.length === 0 ? (
        <Card className="p-12 text-center border-blue-100 border-dashed">
          <ClipboardList className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h4 className="text-blue-900 mb-2 font-semibold">No assessments yet</h4>
          <p className="text-gray-600 mb-4">Create your first assessment to test your students</p>
          <Button onClick={onCreateTest} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <Card key={test._id} className="p-6 border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-lg font-semibold text-blue-900">{test.title}</h4>
                    <Badge className={getTypeColor(test.type)}>
                      {test.type === 'mcq' ? 'MCQ' : 'Segmentation'}
                    </Badge>
                    <Badge className={getStatusColor(test.status)}>
                      {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500 text-sm">Questions</p>
                      <p className="text-gray-900 font-medium">
                        {test.questions?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Duration</p>
                      <p className="text-gray-900 font-medium">{test.duration} mins</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Submissions</p>
                      <p className="text-gray-900 font-medium">{test.submissionCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Due Date</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(test.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {test.submissionCount > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (test.submissionCount / 32) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {test.status === 'draft' && (
                      <DropdownMenuItem onClick={() => handleUpdateStatus(test._id, 'active')}>
                        <Eye className="w-4 h-4 mr-2" />
                        Publish
                      </DropdownMenuItem>
                    )}
                    {test.status === 'active' && (
                      <DropdownMenuItem onClick={() => handleUpdateStatus(test._id, 'closed')}>
                        <Eye className="w-4 h-4 mr-2" />
                        Close
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Results
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteTest(test._id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}