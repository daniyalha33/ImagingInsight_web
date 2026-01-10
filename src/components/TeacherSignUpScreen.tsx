import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const API_URL = 'http://localhost:5000/api';

interface TeacherSignUpScreenProps {
  onNavigateToLogin: () => void;
}

export function TeacherSignUpScreen({ onNavigateToLogin }: TeacherSignUpScreenProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email || !name || !password || password.length < 6) {
      setError('Please fill all required fields correctly');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          password,
          role: 'teacher',
          profileImage: profilePic?.name || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setEmail('');
        setName('');
        setPassword('');
        setProfilePic(null);
        
        setTimeout(() => {
          onNavigateToLogin();
        }, 3000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running on port 5000.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your teacher account request has been submitted successfully. An admin will review your application soon.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You'll be able to login once your account is approved.
          </p>
          <Button
            onClick={onNavigateToLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
          >
            Go to Login
          </Button>
        </motion.div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Teacher Registration</h2>
          <p className="text-gray-600">Request access to teach</p>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription className="text-sm text-blue-900">
            Your registration will be reviewed by an admin before approval.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-900">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1.5 bg-blue-50/50 border-blue-200 focus:border-blue-600 h-12"
            />
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="mt-1.5 bg-blue-50/50 border-blue-200 focus:border-blue-600 h-12"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="mt-1.5 bg-blue-50/50 border-blue-200 focus:border-blue-600 h-12"
            />
          </div>

          <div>
            <Label htmlFor="profile-pic">Profile Picture (Optional)</Label>
            <div className="mt-1.5">
              <label
                htmlFor="profile-pic"
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <Upload className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-900">
                  {profilePic ? profilePic.name : 'Upload profile picture'}
                </span>
                <input
                  id="profile-pic"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-white rounded-full mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Request Teacher Access'
            )}
          </Button>

          <div className="text-center pt-4">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}