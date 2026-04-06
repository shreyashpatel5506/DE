import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Shield, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../AuthContext';
import { api } from '../../lib/api';
const authorizedEmails = [
  'admin@city.gov',
  'infrastructure@city.gov',
  'maintenance@city.gov',
  'public.works@city.gov'
];

export function OfficerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginOfficer } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!authorizedEmails.includes(email.toLowerCase())) {
      toast.error('Unauthorized email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.post('/api/auth/loginOfficer', { email, password });
      if (response.data.success) {
        toast.success('Login successful!');
        // Note: Currently the backend JWT decode checks for { id } instead of { _id }, handle accordingly
        loginOfficer({ _id: response.data.token, email }); 
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Server error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle>Government Officer Login</CardTitle>
          <CardDescription>
            Access the infrastructure management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Official Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="officer@city.gov"
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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}