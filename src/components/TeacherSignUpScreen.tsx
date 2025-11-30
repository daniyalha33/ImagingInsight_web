import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface TeacherSignUpScreenProps {
  onSignUp: (data: any) => void;
  onNavigateToLogin: () => void;
}

export function TeacherSignUpScreen({ onSignUp, onNavigateToLogin }: TeacherSignUpScreenProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignUp({ email, name, password, profilePic, role: 'teacher' });
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

        {/* Get Started */}
        <div className="mb-8">
          <h2 className="text-blue-900 mb-2">Teacher Registration</h2>
          <p className="text-muted-foreground">Request access to teach</p>
        </div>

        {/* Info Alert */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-blue-900">Your registration will be reviewed by an admin before approval.</p>
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
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1.5 bg-blue-50/50 border-blue-200 focus:border-blue-600 h-12"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
                <span className="text-blue-900">
                  {profilePic ? profilePic.name : 'Upload profile picture'}
                </span>
                <input
                  id="profile-pic"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-white rounded-full mt-6"
          >
            Request Teacher Access
          </Button>

          {/* Login Link */}
          <div className="text-center pt-4">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
