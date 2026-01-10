import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Activity, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { motion } from 'motion/react';

const API_URL = 'http://localhost:5000/api';

interface AdminLoginScreenProps {
  onLogin: (email: string, token: string) => void;
  onNavigateToPasswordRecovery: () => void;
  onSwitchToTeacherLogin: () => void;
}

export function AdminLoginScreen({ 
  onLogin, 
  onNavigateToPasswordRecovery,
  onSwitchToTeacherLogin
}: AdminLoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Check if user is admin
        if (data.user.role !== 'admin') {
          setError('Access denied. Admin credentials required.');
          return;
        }

        // Store token in localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));

        // Call onLogin with email and token
        onLogin(email, data.token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running on port 5000.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-blue-900">ImagingInsight</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Admin Portal</h2>
          <p className="text-gray-600">Login to manage the platform</p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-900">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
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
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
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
              disabled={loading}
              required
              className="bg-blue-50/50 border-blue-200 focus:border-blue-600 h-12"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-full mt-8"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              'Log In as Admin'
            )}
          </Button>

          <div className="text-center pt-4">
            <div className="pt-2 border-t border-blue-100">
              <button
                type="button"
                onClick={onSwitchToTeacherLogin}
                disabled={loading}
                className="block w-full text-gray-600 hover:text-blue-600 transition-colors text-sm"
              >
                Login as Teacher →
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}