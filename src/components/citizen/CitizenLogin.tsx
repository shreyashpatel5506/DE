import React, { useState } from 'react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !userName)) {
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
      } else {
        const response = await api.post('/api/auth/createUser', { email, password, userName });
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
            {isLogin 
              ? 'Access your infrastructure reports'
              : 'Join to start reporting neighborhood issues'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
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
                />
              </div>
            </div>

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

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
            
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground text-sm flex gap-1 justify-center">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button type="button" className="text-blue-500 hover:underline hover:text-blue-600" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
