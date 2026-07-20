import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function SignupScreen() {
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!fullName) newErrors.fullName = 'Full name is required';
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
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      showToast(
        error.message.includes('already registered')
          ? 'Email already registered. Please sign in.'
          : error.message,
        'error'
      );
    } else {
      showToast('Account created successfully!', 'success');
      navigate('/');
    }
  };

  const passwordRequirements = [
    { label: 'At least 6 characters', check: password.length >= 6 },
    { label: 'Contains a number', check: /\d/.test(password) },
    { label: 'Contains uppercase letter', check: /[A-Z]/.test(password) },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-6 pt-12">
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-500 mt-1">Start your shopping journey</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          icon={<User className="w-5 h-5" />}
        />

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
            placeholder="Create a password"
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

        <div className="space-y-2 pt-1">
          {passwordRequirements.map(({ label, check }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <CheckCircle
                className={`w-3.5 h-3.5 ${check ? 'text-secondary-500' : 'text-gray-300'}`}
              />
              <span className={check ? 'text-secondary-600' : 'text-gray-400'}>{label}</span>
            </div>
          ))}
        </div>

        <Button type="submit" loading={loading} className="w-full mt-4">
          Create Account
        </Button>

        <p className="text-xs text-gray-500 text-center pt-2">
          By signing up, you agree to our{' '}
          <Link to="/terms" className="text-link">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-link">Privacy Policy</Link>
        </p>
      </form>

      <div className="p-6 text-center border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-link">
            Sign In <ChevronRight className="w-4 h-4 inline -mt-0.5" />
          </Link>
        </p>
      </div>
    </div>
  );
}
