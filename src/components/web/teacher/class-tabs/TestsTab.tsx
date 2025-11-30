import { useState } from 'react';
import { Plus, ClipboardList, Pencil, Eye, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';

interface TestsTabProps {
  classId: string;
  onCreateTest: () => void;
}

export function TestsTab({ classId, onCreateTest }: TestsTabProps) {
  const [tests, setTests] = useState([
    {
      id: '1',
      title: 'CT Scan Basics Quiz',
      type: 'mcq',
      questions: 10,
      duration: 30,
      status: 'active',
      submissions: 28,
      totalStudents: 32,
      createdAt: '2024-10-05',
      dueDate: '2024-10-15'
    },
    {
      id: '2',
      title: 'Liver Segmentation Task',
      type: 'segmentation',
      questions: 3,
      duration: 45,
      status: 'active',
      submissions: 25,
      totalStudents: 32,
      createdAt: '2024-10-08',
      dueDate: '2024-10-18'
    },
    {
      id: '3',
      title: 'Kidney Identification',
      type: 'segmentation',
      questions: 5,
      duration: 60,
      status: 'draft',
      submissions: 0,
      totalStudents: 32,
      createdAt: '2024-10-10',
      dueDate: '2024-10-20'
    },
  ]);

  const handleDeleteTest = (testId: string) => {
    setTests(tests.filter(t => t.id !== testId));
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-blue-900">Assessments</h3>
          <p className="text-muted-foreground">Create and manage tests for your students</p>
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
      <div className="space-y-4">
        {tests.map((test) => (
          <Card key={test.id} className="p-6 border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-blue-900">{test.title}</h4>
                  <Badge className={getTypeColor(test.type)}>
                    {test.type === 'mcq' ? 'MCQ' : 'Segmentation'}
                  </Badge>
                  <Badge className={getStatusColor(test.status)}>
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-muted-foreground">Questions</p>
                    <p className="text-foreground">{test.questions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="text-foreground">{test.duration} mins</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submissions</p>
                    <p className="text-foreground">{test.submissions}/{test.totalStudents}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="text-foreground">{test.dueDate}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(test.submissions / test.totalStudents) * 100}%` }}
                  />
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View Results
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteTest(test.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {tests.length === 0 && (
        <Card className="p-12 text-center border-blue-100 border-dashed">
          <ClipboardList className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h4 className="text-blue-900 mb-2">No assessments yet</h4>
          <p className="text-muted-foreground mb-4">Create your first assessment to test your students</p>
          <Button onClick={onCreateTest} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </Card>
      )}
    </div>
  );
}
