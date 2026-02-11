import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f6f8f6] via-[#eef3ee] to-[#f1f5f1] p-4">

      <Card className="w-full max-w-md border border-[#e4ebe4] shadow-sm">

        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">
            Login
          </CardTitle>

          <CardDescription className="text-gray-500">
            Enter your credentials to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-600">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#dfe6df] focus:border-[#6f8f72] focus:ring-[#6f8f72]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-600">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-[#dfe6df] focus:border-[#6f8f72] focus:ring-[#6f8f72]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#6f8f72] hover:bg-[#5e7a60] text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>

            <div className="text-center text-sm text-gray-500">
              Don’t have an account?{' '}
              <Link to="/register" className="text-[#6f8f72] font-medium hover:underline">
                Register
              </Link>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
