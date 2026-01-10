import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'motion/react';

interface PasswordRecoveryScreenProps {
  onSendResetLink: (email: string) => void;
  onBackToLogin: () => void;
}

export function PasswordRecoveryScreen({
  onSendResetLink,
  onBackToLogin
}: PasswordRecoveryScreenProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendResetLink(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Back button */}
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mx-auto mb-4">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-blue-900">Recover Password</h2>
          <p className="text-muted-foreground mt-2">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 bg-blue-50/50 border-blue-200 focus:border-blue-600 h-12"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-full mt-6"
          >
            Send Reset Link
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
