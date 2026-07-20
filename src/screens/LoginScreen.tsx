import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function LoginScreen() {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      showToast(error.message === 'Invalid login credentials'
        ? 'Invalid email or password'
        : error.message, 'error');
    } else {
      showToast('Welcome back!', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-6 pt-12">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-500 mt-1">Sign in to continue shopping</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<Mail className="w-5 h-5" />}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={<Lock className="w-5 h-5" />}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-link">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Sign In
        </Button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-200 flex-1" />
          <span className="px-3 text-xs text-gray-400">OR</span>
          <div className="border-t border-gray-200 flex-1" />
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl
            hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.23v2.84C4.13 20.49 7.78 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.27H2.23C1.44 8.55 1 10.22 1 12s.44 3.45 1.23 4.73l2.61-1.64z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.78 1 4.13 3.51 2.23 7.27l2.61 2.14C5.71 8.81 7.14 7.38 12 5.38z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Continue with Google</span>
        </button>
      </form>

      <div className="p-6 text-center border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-link">
            Sign Up <ChevronRight className="w-4 h-4 inline -mt-0.5" />
          </Link>
        </p>
      </div>
    </div>
  );
}
