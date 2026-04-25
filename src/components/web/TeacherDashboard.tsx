import { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  LogOut,
  Home,
  ClipboardList,
  Search,
} from 'lucide-react';
import { Button } from '../ui/button';
import { TeacherClassesScreen } from './teacher/TeacherClassesScreen';
import { TeacherClassDetailScreen } from './teacher/TeacherClassDetailScreen';
import { TeacherChatScreen } from './teacher/TeacherChatScreen';
import { CreateTestScreen } from './teacher/CreateTestScreen';
import { CreateSegmentationTestScreen } from './teacher/Createsegmentationscreen';

interface TeacherDashboardProps {
  teacherName: string;
  teacherEmail: string;
  onLogout?: () => void;
  onOpenRag?: () => void;
}

type Screen = 
  | { type: 'classes' }
  | { type: 'class-detail'; classId: string }
  | { type: 'chat' }
  | { type: 'create-test'; classId?: string };

export function TeacherDashboard({ teacherName, teacherEmail, onLogout, onOpenRag }: TeacherDashboardProps) {
  const [screen, setScreen] = useState<Screen>({ type: 'classes' });
  const [createType, setCreateType] = useState<'mcq' | 'segmentation' | null>(null);

  const handleTestCreated = () => {
    // After test is created, go back to class detail
    if (screen.type === 'create-test' && screen.classId) {
      setScreen({ type: 'class-detail', classId: screen.classId });
    } else {
      setScreen({ type: 'classes' });
    }
  };

  const renderScreen = () => {
    switch (screen.type) {
      case 'classes':
        return (
          <TeacherClassesScreen
            onSelectClass={(classId) => setScreen({ type: 'class-detail', classId })}
          />
        );
      case 'class-detail':
        return (
          <TeacherClassDetailScreen
            classId={screen.classId}
            onBack={() => setScreen({ type: 'classes' })}
            onCreateTest={() => setScreen({ type: 'create-test', classId: screen.classId })}
            teacherName={teacherName}
          />
        );
      case 'chat':
        return (
          <TeacherChatScreen
            teacherName={teacherName}
          />
        );
      case 'create-test':
        // Allow teacher to choose between MCQ and Segmentation tests
        if (!createType) {
          return (
            <div className="p-8">
              <div className="max-w-2xl mx-auto bg-white rounded-lg p-8 shadow">
                <h2 className="text-xl font-semibold mb-4">Create Assessment</h2>
                <p className="text-sm text-gray-600 mb-6">Choose the type of assessment to create for this class.</p>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-blue-600 text-white" onClick={() => setCreateType('mcq')}>Multiple Choice (MCQ)</Button>
                  <Button className="flex-1 bg-green-600 text-white" onClick={() => setCreateType('segmentation')}>Segmentation Task</Button>
                </div>
                <div className="mt-4">
                  <Button variant="ghost" onClick={() => {
                    // go back to previous screen
                    if (screen.classId) setScreen({ type: 'class-detail', classId: screen.classId }); else setScreen({ type: 'classes' });
                  }}>Cancel</Button>
                </div>
              </div>
            </div>
          );
        }

        // Render selected creation screen
        return createType === 'mcq' ? (
          <CreateTestScreen
            classId={screen.classId || ''}
            onBack={() => {
              setCreateType(null);
              if (screen.classId) setScreen({ type: 'class-detail', classId: screen.classId }); else setScreen({ type: 'classes' });
            }}
            onSuccess={() => { setCreateType(null); handleTestCreated(); }}
          />
        ) : (
          <CreateSegmentationTestScreen
            classId={screen.classId || ''}
            onBack={() => {
              setCreateType(null);
              if (screen.classId) setScreen({ type: 'class-detail', classId: screen.classId }); else setScreen({ type: 'classes' });
            }}
            onSuccess={() => { setCreateType(null); handleTestCreated(); }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-blue-100 flex flex-col shadow-lg">
        {/* Logo */}
        <div className="p-6 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-blue-900">ImagingInsight</h2>
              <p className="text-sm text-gray-500">Teacher Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={screen.type === 'classes' ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              screen.type === 'classes' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-blue-900 hover:bg-blue-50'
            }`}
            onClick={() => setScreen({ type: 'classes' })}
          >
            <Home className="w-4 h-4 mr-3" />
            My Classes
          </Button>
          <Button
            variant={screen.type === 'chat' ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              screen.type === 'chat' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-blue-900 hover:bg-blue-50'
            }`}
            onClick={() => setScreen({ type: 'chat' })}
          >
            <MessageSquare className="w-4 h-4 mr-3" />
            Student Queries
          </Button>
          <Button
            variant={screen.type === 'create-test' ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              screen.type === 'create-test' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-blue-900 hover:bg-blue-50'
            }`}
            onClick={() => setScreen({ type: 'create-test' })}
          >
            <ClipboardList className="w-4 h-4 mr-3" />
            Create Assessment
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start text-blue-900 hover:bg-blue-50`}
            onClick={() => onOpenRag?.()}
          >
            <Search className="w-4 h-4 mr-3" />
            RAG Assistant
          </Button>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-blue-100">
          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">{teacherName}</p>
            <p className="text-xs text-gray-500 truncate">{teacherEmail}</p>
          </div>
          <Button
            variant="outline"
            className="w-full border-blue-200 text-blue-900 hover:bg-blue-50"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderScreen()}
      </div>
    </div>
  );
}