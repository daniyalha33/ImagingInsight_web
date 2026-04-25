import { useState, useEffect } from 'react';
import { Plus, Users, Search, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Alert, AlertDescription } from '../../ui/alert';
import { motion } from 'motion/react';

const API_URL = 'http://localhost:5000/api';

interface TeacherClassesScreenProps {
  onSelectClass: (classId: string) => void;
}

export function TeacherClassesScreen({ onSelectClass }: TeacherClassesScreenProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/classes/teacher`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!className.trim()) return;

    setCreating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: className,
          description: classDescription
        })
      });

      const data = await response.json();

      if (data.success) {
        setClasses([data.data, ...classes]);
        setShowCreateDialog(false);
        setClassName('');
        setClassDescription('');
      } else {
        setError(data.message || 'Failed to create class');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Create class error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 bg-blue-50 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

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
      {classes.length === 0 ? (
        <Card className="p-12 text-center border-blue-100">
          <Users className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h3 className="text-blue-900 mb-2 font-semibold">No classes yet</h3>
          <p className="text-gray-600 mb-4">Create your first class to get started</p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Class
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <motion.div
              key={cls._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className="p-6 border border-blue-200 bg-white hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onSelectClass(cls._id)}
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
                    <span>{cls.students?.length || 0} students</span>
                  </div>
                  <span>
                    Created {new Date(cls.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Class Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md bg-white rounded-2xl shadow-lg p-6">
          <DialogTitle className="text-blue-900 font-semibold text-lg">Create New Class</DialogTitle>
          <DialogDescription className="text-blue-500">
            Create a new class and get a class code to share with students
          </DialogDescription>

          {error && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-900">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="class-name">Class Name</Label>
              <Input
                id="class-name"
                placeholder="e.g., Radiology Basics"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                disabled={creating}
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
                disabled={creating}
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={creating}
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateClass}
                disabled={!className.trim() || creating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Class'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}