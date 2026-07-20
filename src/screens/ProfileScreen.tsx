import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Settings,
  HelpCircle,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  Edit2,
  ExternalLink
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { showToast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editingProfile.full_name,
        phone: editingProfile.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      showToast('Failed to update profile', 'error');
    } else {
      showToast('Profile updated', 'success');
      setShowEditModal(false);
      window.location.reload();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showToast('Successfully signed out', 'info');
    navigate('/');
  };

  const menuSections = [
    {
      title: 'My Account',
      items: [
        {
          icon: <Package className="w-5 h-5" />,
          label: 'Orders',
          onClick: () => navigate('/orders'),
        },
        {
          icon: <MapPin className="w-5 h-5" />,
          label: 'Addresses',
          onClick: () => showToast('Address management coming soon', 'info'),
        },
        {
          icon: <Settings className="w-5 h-5" />,
          label: 'Settings',
          onClick: () => showToast('Settings coming soon', 'info'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle className="w-5 h-5" />,
          label: 'Help Center',
          onClick: () => showToast('Help center coming soon', 'info'),
        },
        {
          icon: <FileText className="w-5 h-5" />,
          label: 'Privacy Policy',
          onClick: () => showToast('Privacy policy coming soon', 'info'),
        },
        {
          icon: <Shield className="w-5 h-5" />,
          label: 'Terms of Service',
          onClick: () => showToast('Terms coming soon', 'info'),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Profile" />

      {/* Profile Header */}
      <div className="bg-white border-b border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size="xl" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {profile?.full_name || 'New User'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
            {profile?.phone && (
              <p className="text-sm text-gray-500">{profile.phone}</p>
            )}
          </div>
          <button
            onClick={() => {
              setEditingProfile({
                full_name: profile?.full_name || '',
                phone: profile?.phone || '',
              });
              setShowEditModal(true);
            }}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="p-4 space-y-4">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h3>
            <Card className="overflow-hidden">
              {section.items.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors ${
                    index !== section.items.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <div className="text-gray-400">{item.icon}</div>
                  <span className="flex-1 font-medium text-gray-900">
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </Card>
          </div>
        ))}

        {/* Sign Out */}
        <Button
          variant="secondary"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={editingProfile.full_name}
            onChange={(e) =>
              setEditingProfile({ ...editingProfile, full_name: e.target.value })
            }
            placeholder="Enter your name"
          />
          <Input
            label="Phone Number"
            value={editingProfile.phone}
            onChange={(e) =>
              setEditingProfile({ ...editingProfile, phone: e.target.value })
            }
            placeholder="Enter phone number"
            type="tel"
          />
          <Button
            onClick={handleUpdateProfile}
            loading={saving}
            className="w-full mt-4"
          >
            Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
}
