import { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  LogOut,
  Home,
  ClipboardList
} from 'lucide-react';
import { Button } from '../ui/button';
import { TeacherClassesScreen } from './teacher/TeacherClassesScreen';
import { TeacherClassDetailScreen } from './teacher/TeacherClassDetailScreen';
import { TeacherChatScreen } from './teacher/TeacherChatScreen';
import { CreateTestScreen } from './teacher/CreateTestScreen';

interface TeacherDashboardProps {
  teacherName: string;
  teacherEmail: string;
  onLogout?: () => void;
}

type Screen = 
  | { type: 'classes' }
  | { type: 'class-detail'; classId: string }
  | { type: 'chat' }
  | { type: 'create-test'; classId?: string };

export function TeacherDashboard({ teacherName, teacherEmail, onLogout }: TeacherDashboardProps) {
  const [screen, setScreen] = useState<Screen>({ type: 'classes' });

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
            teacherName={teacherName}
          />
        );
      case 'class-detail':
        return (
          <TeacherClassDetailScreen
            classId={screen.classId}
            onBack={() => setScreen({ type: 'classes' })}
            onCreateTest={() => setScreen({ type: 'create-test', classId: screen.classId })}
          />
        );
      case 'chat':
        return (
          <TeacherChatScreen
            teacherName={teacherName}
          />
        );
      case 'create-test':
        return (
          <CreateTestScreen
            classId={screen.classId || ''}
            onBack={() => screen.classId 
              ? setScreen({ type: 'class-detail', classId: screen.classId })
              : setScreen({ type: 'classes' })
            }
            onSuccess={handleTestCreated}
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