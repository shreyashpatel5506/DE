import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../AuthContext';
import { api } from '../../lib/api';

export function CitizenLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const authMode = params.get('authMode');
    const token = params.get('token');
    const resetEmail = params.get('email');

    if (authMode === 'reset' && token) {
      setIsLogin(true);
      setShowForgotPassword(false);
      setResetToken(token);
      if (resetEmail) setEmail(resetEmail);
    }
  }, []);

  const isResetMode = useMemo(() => Boolean(resetToken), [resetToken]);

  const clearResetMode = () => {
    setResetToken('');
    setResetPassword('');
    setConfirmResetPassword('');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('authMode');
      url.searchParams.delete('token');
      url.searchParams.delete('email');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleSendSignupOtp = async () => {
    if (!email || !password || !userName) {
      toast.error('Name, email and password are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/sendotp', {
        email,
        purpose: 'signup',
      });
      if (response.data.success) {
        setOtpSent(true);
        toast.success('OTP sent to your email');
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your registered email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/forgotPassword', { email });
      toast.success(
        response.data.message ||
          'If this email is registered, a reset link has been sent.',
      );
      setShowForgotPassword(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to process request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassword || !confirmResetPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    if (resetPassword !== confirmResetPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/resetPassword', {
        email,
        token: resetToken,
        password: resetPassword,
      });
      if (response.data.success) {
        toast.success('Password reset successful. Please log in.');
        clearResetMode();
        setPassword('');
        setIsLogin(true);
      } else {
        toast.error(response.data.message || 'Reset password failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Reset password failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isResetMode) {
      await handleResetPassword(e);
      return;
    }

    if (showForgotPassword) {
      await handleForgotPassword(e);
      return;
    }

    if (!email || !password || (!isLogin && !userName) || (!isLogin && otpSent && !otp)) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await api.post('/api/auth/loginuser', { email, password });
        if (response.data.success) {
          toast.success('Logged in successfully');
          loginUser(response.data.user);
        } else {
          toast.error(response.data.message || 'Login failed');
        }
      } else if (!otpSent) {
        await handleSendSignupOtp();
        return;
      } else {
        const response = await api.post('/api/auth/createUser', {
          email,
          password,
          userName,
          otp,
        });
        if (response.data.success) {
          toast.success('Account created successfully');
          loginUser(response.data.user);
        } else {
          toast.error(response.data.message || 'Registration failed');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred server-side');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle>{isLogin ? 'Citizen Login' : 'Create Account'}</CardTitle>
          <CardDescription>
            {isResetMode
              ? 'Create a new secure password for your account'
              : showForgotPassword
              ? 'Enter your email to receive reset link'
              : isLogin
              ? 'Access your infrastructure reports'
              : 'Join to start reporting neighborhood issues'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isResetMode && !showForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="userName">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="userName"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="citizen@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isResetMode}
                />
              </div>
            </div>

            {!showForgotPassword && !isResetMode && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {!isLogin && otpSent && !isResetMode && !showForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="otp">Verification OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>
            )}

            {isResetMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="resetPassword">New Password</Label>
                  <Input
                    id="resetPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmResetPassword">Confirm New Password</Label>
                  <Input
                    id="confirmResetPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmResetPassword}
                    onChange={(e) => setConfirmResetPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              disabled={isLoading}
            >
              {isLoading
                ? 'Please wait...'
                : isResetMode
                ? 'Reset Password'
                : showForgotPassword
                ? 'Send Reset Link'
                : isLogin
                ? 'Sign In'
                : otpSent
                ? 'Verify OTP & Sign Up'
                : 'Send OTP'}
            </Button>

            {!isResetMode && isLogin && !showForgotPassword && (
              <button
                type="button"
                className="w-full text-sm text-blue-500 hover:text-blue-600 hover:underline"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </button>
            )}

            {!isResetMode && !isLogin && otpSent && (
              <button
                type="button"
                className="w-full text-sm text-blue-500 hover:text-blue-600 hover:underline"
                disabled={isLoading}
                onClick={handleSendSignupOtp}
              >
                Resend OTP
              </button>
            )}
            
            <div className="mt-4 text-center text-sm">
              {isResetMode ? (
                <button
                  type="button"
                  className="text-blue-500 hover:underline hover:text-blue-600"
                  onClick={clearResetMode}
                >
                  Back to login
                </button>
              ) : showForgotPassword ? (
                <button
                  type="button"
                  className="text-blue-500 hover:underline hover:text-blue-600"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to login
                </button>
              ) : (
                <span className="text-muted-foreground text-sm flex gap-1 justify-center">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    className="text-blue-500 hover:underline hover:text-blue-600"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setOtpSent(false);
                      setOtp('');
                      setShowForgotPassword(false);
                    }}
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
