import { useState } from 'react';
import { Plus, Users, Search, Copy, Check } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { motion } from 'motion/react';

interface TeacherClassesScreenProps {
  onSelectClass: (classId: string) => void;
  teacherName: string;
}

export function TeacherClassesScreen({ onSelectClass, teacherName }: TeacherClassesScreenProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const classes = [
    { 
      id: '1', 
      name: 'Radiology Initial', 
      code: 'RAD2024A',
      students: 32, 
      description: 'Introduction to radiology imaging',
      created: '2024-01-15'
    },
    { 
      id: '2', 
      name: 'Advanced CT Imaging', 
      code: 'CT2024B',
      students: 28, 
      description: 'Advanced CT scan interpretation',
      created: '2024-02-10'
    },
  ];

  const handleCreateClass = () => {
    const classCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    console.log('Creating class:', className, classDescription, classCode);
    setShowCreateDialog(false);
    setClassName('');
    setClassDescription('');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="p-8 bg-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 bg-blue-600 text-white rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">My Classes</h1>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-white text-blue-600 hover:bg-blue-100 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Class
          </Button>
        </div>
        <p className="text-blue-100">Manage your classes and student learning</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
          <Input
            placeholder="Search classes..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              className="p-6 border border-blue-200 bg-white hover:shadow-lg transition-all cursor-pointer"
              onClick={() => onSelectClass(cls.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm">
                    {cls.code}
                  </code>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(cls.code);
                    }}
                    className="p-1 hover:bg-blue-50 rounded"
                  >
                    {copiedCode === cls.code ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              <h3 className="text-blue-900 mb-2 font-semibold">{cls.name}</h3>
              <p className="text-blue-700 mb-4">{cls.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-blue-100 text-blue-400 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{cls.students} students</span>
                </div>
                <span>
                  Created {new Date(cls.created).toLocaleDateString()}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create Class Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md bg-white rounded-2xl shadow-lg p-6">
          <DialogTitle className="text-blue-900 font-semibold text-lg">Create New Class</DialogTitle>
          <DialogDescription className="text-blue-500">
            Create a new class and get a class code to share with students
          </DialogDescription>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="class-name">Class Name</Label>
              <Input
                id="class-name"
                placeholder="e.g., Radiology Basics"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="class-desc">Description</Label>
              <Input
                id="class-desc"
                placeholder="Brief description of the class"
                value={classDescription}
                onChange={(e) => setClassDescription(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateClass}
                disabled={!className.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Class
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
