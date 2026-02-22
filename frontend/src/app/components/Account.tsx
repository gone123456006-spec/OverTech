import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, LogOut, Trash2 } from 'lucide-react';
import { getProfile, saveProfile, getAddresses, deleteAddress, hasProfile } from '../utils/storage';
import type { UserProfile, Address } from '../utils/storage';
import { toast } from 'sonner';

export function Account() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: ''
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, []);

  const loadProfile = () => {
    const savedProfile = getProfile();
    if (savedProfile) {
      setProfile(savedProfile);
    } else {
      setIsEditing(true);
    }
  };

  const loadAddresses = () => {
    setAddresses(getAddresses());
  };

  const handleSaveProfile = () => {
    if (!profile.name || !profile.email || !profile.phone) {
      toast.error('Please fill all profile fields');
      return;
    }

    saveProfile(profile);
    setIsEditing(false);
    toast.success('Profile saved successfully');
  };

  const handleDeleteAddress = (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddress(addressId);
      loadAddresses();
      toast.success('Address deleted');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-4xl mb-4 md:mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="bg-white rounded-lg md:rounded-xl shadow-md p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl">Profile Information</h2>
                {!isEditing && hasProfile() && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base text-blue-700 border border-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm mb-2 text-gray-600">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm mb-2 text-gray-600">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm mb-2 text-gray-600">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Save Profile
                    </button>
                    {hasProfile() && (
                      <button
                        onClick={() => {
                          loadProfile();
                          setIsEditing(false);
                        }}
                        className="flex-1 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-gray-600">Name</p>
                      <p className="text-base md:text-lg truncate">{profile.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-gray-600">Email</p>
                      <p className="text-base md:text-lg truncate">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-gray-600">Phone</p>
                      <p className="text-base md:text-lg">{profile.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Addresses */}
            <div className="bg-white rounded-lg md:rounded-xl shadow-md p-4 md:p-6">
              <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Saved Addresses</h2>

              {addresses.length === 0 ? (
                <div className="text-center py-6 md:py-8">
                  <MapPin className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">No saved addresses yet</p>
                  <p className="text-xs md:text-sm text-gray-500">
                    Add addresses during checkout to save them here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-3 md:p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-base md:text-lg mb-1 truncate">{address.name}</p>
                          <p className="text-sm md:text-base text-gray-600">{address.mobile}</p>
                          <p className="text-sm md:text-base text-gray-600">{address.house}</p>
                          <p className="text-sm md:text-base text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-600 hover:text-red-700 p-2 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg md:rounded-xl shadow-md p-4 md:p-6 space-y-3 md:space-y-4">
              <h2 className="text-xl md:text-2xl mb-3 md:mb-4">Account Actions</h2>

              <button
                onClick={() => navigate('/orders')}
                className="w-full px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base border-2 border-blue-700 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-left flex items-center gap-2 md:gap-3"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                My Orders
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-left flex items-center gap-2 md:gap-3"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                Logout
              </button>

              <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t">
                <h3 className="text-base md:text-lg mb-3 md:mb-4">Help & Support</h3>
                <div className="space-y-2 text-xs md:text-sm text-gray-600">
                  <p>📧 support@shopzone.com</p>
                  <p>📞 1800-123-4567</p>
                  <p className="text-xs text-gray-500 mt-3 md:mt-4">
                    Available 24/7 for customer support
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
