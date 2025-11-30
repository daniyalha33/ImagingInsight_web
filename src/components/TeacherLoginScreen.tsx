import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface TeacherLoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onNavigateToSignUp: () => void;
  onNavigateToPasswordRecovery: () => void;
  onSwitchToAdminLogin: () => void;
}

export function TeacherLoginScreen({ 
  onLogin, 
  onNavigateToSignUp, 
  onNavigateToPasswordRecovery,
  onSwitchToAdminLogin
}: TeacherLoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-blue-900">ImagingInsight</h1>
        </div>

        {/* Login Heading */}
        <div className="mb-8">
          <h2 className="text-blue-900">Teacher Portal</h2>
          <p className="text-muted-foreground mt-2">Login to manage your classes</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5 bg-blue-50/50 border-blue-200 focus:border-blue-600 h-12"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={onNavigateToPasswordRecovery}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-blue-50/50 border-blue-200 focus:border-blue-600 h-12"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-full mt-8"
          >
            Log In as Teacher
          </Button>

          {/* Sign Up Link */}
          <div className="text-center pt-4 space-y-3">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Sign up
              </button>
            </p>
            <div className="pt-2 border-t border-blue-100 space-y-2">
              <button
                type="button"
                onClick={onSwitchToAdminLogin}
                className="block w-full text-muted-foreground hover:text-blue-600 transition-colors"
              >
                Login as Admin →
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
