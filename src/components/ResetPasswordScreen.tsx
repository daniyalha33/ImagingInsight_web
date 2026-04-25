import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ResetPasswordScreenProps {
  resetToken: string;
  onSuccess: (token: string) => void;
  onBackToLogin: () => void;
}

export function ResetPasswordScreen({ resetToken, onSuccess, onBackToLogin }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${resetToken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');

      setIsDone(true);
      // Auto-login: pass JWT token up so app can store it
      setTimeout(() => onSuccess(data.token), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
        {isDone ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-blue-900 text-xl font-semibold">Password reset!</h2>
            <p className="text-muted-foreground mt-2">Logging you in...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mx-auto mb-4">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-blue-900">Set New Password</h2>
              <p className="text-muted-foreground mt-2">Choose a strong password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="password">New Password</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-blue-50/50 border-blue-200 focus:border-blue-600 h-12 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-blue-400 hover:text-blue-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1.5 bg-blue-50/50 border-blue-200 focus:border-blue-600 h-12"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-full mt-6"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full text-sm text-blue-600 hover:text-blue-700 mt-2"
              >
                Back to Login
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
