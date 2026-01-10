import { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { TeacherLoginScreen } from './components/TeacherLoginScreen';
import { TeacherSignUpScreen } from './components/TeacherSignUpScreen';
import { AdminLoginScreen } from './components/AdminLoginScreen';
import { TeacherDashboard } from './components/web/TeacherDashboard';
import { PrincipalDashboard } from './components/web/PrincipalDashboard';
import { PasswordRecoveryScreen } from "./components/PasswordRecoveryScreen";

type Screen = 'loading' | 'teacher-login' | 'teacher-signup' | 'admin-login' | 'password-recovery' | 'teacher-dashboard' | 'principal-dashboard';

interface UserData {
  name: string;
  email: string;
  role: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('loading');
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    window.addEventListener('resize', () => { });
    return () => window.removeEventListener('resize', () => { });
  }, []);

  useEffect(() => {
    if (currentScreen === 'loading') {
      const timer = setTimeout(() => {
        setCurrentScreen('teacher-login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);
  const handleSendResetLink = (email: string) => {
    alert("A password reset link has been sent to: " + email);
    setCurrentScreen("teacher-login");
  };

  const handleBackToLogin = () => {
    setCurrentScreen("teacher-login");
  };
  if (currentScreen === 'password-recovery') {
    return (
      <PasswordRecoveryScreen
        onSendResetLink={handleSendResetLink}
        onBackToLogin={handleBackToLogin}
      />
    );
  }


  const handleSignUp = (data: any) => {
    const role = data.role || 'teacher';
    if (role === 'teacher') {
      alert('Your teacher registration request has been submitted. An admin will review it shortly.');
      setCurrentScreen('teacher-login');
      return;
    }
    if (role === 'principal') {
      alert('Your principal registration request has been submitted for review.');
      setCurrentScreen('teacher-login');
      return;
    }
    setUserData({
      name: data.name,
      email: data.email,
      role: role
    });
    setCurrentScreen('teacher-dashboard');
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentScreen('teacher-login');
  };

  const handleNavigateToPasswordRecovery = () => {
    setCurrentScreen('password-recovery');
  };
  const handleSwitchToTeacherLogin = () => {
    setCurrentScreen('teacher-login');
  };
  const handleNavigateToTeacherSignUp = () => {
    setCurrentScreen('teacher-signup');
  };
  const handleNavigateToTeacherLogin = () => {
    setCurrentScreen('teacher-login');
  };
  const handleSwitchToAdminLogin = () => {
    setCurrentScreen('admin-login');
  };
  const handleTeacherLogin = (email: string) => {
    const name = email.includes('@') ? email.split('@')[0] : email;
    setUserData({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email.includes('@') ? email : `${email}@imaginginsight.com`,
      role: 'teacher'
    });
    setCurrentScreen('teacher-dashboard');
  };
  // Update the handleAdminLogin function in App.tsx
  const handleAdminLogin = (email: string, token: string) => {
    const name = email.includes('@') ? email.split('@')[0] : email;
    setUserData({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email.includes('@') ? email : `${email}@imaginginsight.com`,
      role: 'principal'
    });
    setCurrentScreen('principal-dashboard');
  };

  const renderScreen = () => {
    if (currentScreen === 'loading') {
      return <LoadingScreen />;
    }
    if (currentScreen === 'teacher-login') {
      return (
        <TeacherLoginScreen
          onLogin={handleTeacherLogin}
          onNavigateToSignUp={handleNavigateToTeacherSignUp}
          onNavigateToPasswordRecovery={handleNavigateToPasswordRecovery}
          onSwitchToAdminLogin={handleSwitchToAdminLogin}
        />
      );
    }
    if (currentScreen === 'teacher-signup') {
      return (
        <TeacherSignUpScreen
          onNavigateToLogin={handleNavigateToTeacherLogin}
        />
      );
    }
    if (currentScreen === 'admin-login') {
      return (
        <AdminLoginScreen
          onLogin={handleAdminLogin}
          onNavigateToPasswordRecovery={handleNavigateToPasswordRecovery}
          onSwitchToTeacherLogin={handleSwitchToTeacherLogin}
        />
      );
    }
    if (currentScreen === 'teacher-dashboard' && userData) {
      return <TeacherDashboard teacherName={userData.name} teacherEmail={userData.email} onLogout={handleLogout} />;
    }
    if (currentScreen === 'principal-dashboard' && userData) {
      return <PrincipalDashboard principalName={userData.name} principalEmail={userData.email} onLogout={handleLogout} />;
    }
    return <LoadingScreen />;
  };

  const shouldShowWebView =
    currentScreen === 'teacher-dashboard' ||
    currentScreen === 'principal-dashboard' ||
    currentScreen === 'teacher-login' ||
    currentScreen === 'teacher-signup' ||
    currentScreen === 'admin-login';

  return (
    <div className={shouldShowWebView ? "min-h-screen bg-gradient-to-br from-blue-50 to-white" : "min-h-screen bg-slate-900 flex items-center justify-center p-4"}>
      {shouldShowWebView ? (
        renderScreen()
      ) : (
        <div className="w-full max-w-[390px] h-[844px] bg-white rounded-[3rem] shadow-2xl overflow-hidden relative border-8 border-slate-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-3xl z-50" />
          <div className="w-full h-full overflow-hidden">
            {renderScreen()}
          </div>
        </div>
      )}
    </div>
  );
}