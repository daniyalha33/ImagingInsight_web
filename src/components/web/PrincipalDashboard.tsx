import { useState } from 'react';
import { 
  Users, 
  BarChart3, 
  TrendingUp, 
  Brain,
  LogOut,
  Home,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { Button } from '../ui/button';
import { TeacherApprovalScreen } from './principal/TeacherApprovalScreen';
import { TeacherManagementScreen } from './principal/TeacherManagementScreen';
import { AllStudentsScreen } from './principal/AllStudentsScreen';
import { AnalyticsScreen } from './principal/AnalyticsScreen';
import { DashboardOverview } from './principal/DashboardOverview';

interface PrincipalDashboardProps {
  principalName: string;
  principalEmail: string;
  onLogout?: () => void;
}

type Screen = 
  | { type: 'overview' }
  | { type: 'teacher-approval' }
  | { type: 'teacher-management' }
  | { type: 'student-management' }
  | { type: 'analytics' };

export function PrincipalDashboard({ principalName, principalEmail, onLogout }: PrincipalDashboardProps) {
  const [screen, setScreen] = useState<Screen>({ type: 'overview' });

  const renderScreen = () => {
    switch (screen.type) {
      case 'overview':
        return <DashboardOverview />;
      case 'teacher-approval':
        return <TeacherApprovalScreen />;
      case 'teacher-management':
        return <TeacherManagementScreen />;
      case 'student-management':
        return <AllStudentsScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
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
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-blue-900">ImagingInsight</h2>
              <p className="text-muted-foreground">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={screen.type === 'overview' ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              screen.type === 'overview' ? 'bg-blue-600 text-white' : 'text-blue-900'
            }`}
            onClick={() => setScreen({ type: 'overview' })}
          >
            <Home className="w-4 h-4 mr-3" />
            Dashboard
          </Button>
          <Button
            variant={screen.type === 'teacher-approval' ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              screen.type === 'teacher-approval' ? 'bg-blue-600 text-white' : 'text-blue-900'
            }`}
            onClick={() => setScreen({ type: 'teacher-approval' })}
          >
            <UserCheck className="w-4 h-4 mr-3" />
            Teacher Requests
          </Button>
          <Button
            variant={screen.type === 'teacher-management' ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              screen.type === 'teacher-management' ? 'bg-blue-600 text-white' : 'text-blue-900'
            }`}
            onClick={() => setScreen({ type: 'teacher-management' })}
          >
            <Users className="w-4 h-4 mr-3" />
            Teachers Management
          </Button>
          <Button
            variant={screen.type === 'student-management' ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              screen.type === 'student-management' ? 'bg-blue-600 text-white' : 'text-blue-900'
            }`}
            onClick={() => setScreen({ type: 'student-management' })}
          >
            <BarChart3 className="w-4 h-4 mr-3" />
            Student Management
          </Button>
          <Button
            variant={screen.type === 'analytics' ? 'default' : 'ghost'}
            className={`w-full justify-start ${
              screen.type === 'analytics' ? 'bg-blue-600 text-white' : 'text-blue-900'
            }`}
            onClick={() => setScreen({ type: 'analytics' })}
          >
            <Brain className="w-4 h-4 mr-3" />
            AI Analytics
          </Button>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-blue-100">
          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-900">{principalName}</p>
            <p className="text-muted-foreground">{principalEmail}</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderScreen()}
      </div>
    </div>
  );
}
