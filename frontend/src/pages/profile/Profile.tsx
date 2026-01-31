import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '@/components/Topbar';
import { User, Lock, Loader2, CheckCircle2, XCircle, Mail, Edit2 } from 'lucide-react';
import { changePassword, changeEmail, updateName, getCurrentUser, logout } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

/**
 * Profile page component
 * Allows users to change their password and logout
 */
const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [emailFormData, setEmailFormData] = useState({
    newEmail: '',
    currentPassword: '',
  });
  const [nameFormData, setNameFormData] = useState({
    name: '',
  });
  const [formErrors, setFormErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [emailFormErrors, setEmailFormErrors] = useState<{
    newEmail?: string;
    currentPassword?: string;
  }>({});
  const [nameFormErrors, setNameFormErrors] = useState<{
    name?: string;
  }>({});

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error: any) {
        console.error('Error fetching user:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load user data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [toast]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!formData.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword(formData.currentPassword, formData.newPassword);

      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setFormErrors({});
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Validate email form
  const validateEmailForm = (): boolean => {
    const errors: typeof emailFormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailFormData.newEmail.trim()) {
      errors.newEmail = 'New email is required';
    } else if (!emailRegex.test(emailFormData.newEmail)) {
      errors.newEmail = 'Please enter a valid email address';
    } else if (emailFormData.newEmail.toLowerCase() === user?.email.toLowerCase()) {
      errors.newEmail = 'New email must be different from current email';
    }

    if (!emailFormData.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }

    setEmailFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle email change
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmailForm()) {
      return;
    }

    try {
      setIsChangingEmail(true);
      const updatedUser = await changeEmail(emailFormData.newEmail, emailFormData.currentPassword);
      setUser(updatedUser);

      toast({
        title: 'Success',
        description: 'Email changed successfully',
      });

      // Reset form
      setEmailFormData({
        newEmail: '',
        currentPassword: '',
      });
      setEmailFormErrors({});
      setIsEditingEmail(false);
    } catch (error: any) {
      console.error('Error changing email:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to change email',
        variant: 'destructive',
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  // Validate name form
  const validateNameForm = (): boolean => {
    const errors: typeof nameFormErrors = {};

    if (!nameFormData.name.trim()) {
      errors.name = 'Name is required';
    } else if (nameFormData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    setNameFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle name update
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateNameForm()) {
      return;
    }

    try {
      setIsUpdatingName(true);
      const updatedUser = await updateName(nameFormData.name.trim());
      setUser(updatedUser);

      toast({
        title: 'Success',
        description: 'Name updated successfully',
      });

      setIsEditingName(false);
    } catch (error: any) {
      console.error('Error updating name:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update name',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <Topbar
          title="Profile"
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Profile' },
          ]}
        />
        <main className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Topbar
        title="Profile"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Profile' },
        ]}
      />

      <main className="p-6 max-w-4xl mx-auto">
        {/* User Info Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
              <User className="w-8 h-8 text-accent-foreground" />
            </div>
            <div className="flex-1">
              {/* Name Section */}
              {!isEditingName ? (
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-foreground">{user?.name || 'User'}</h2>
                  <button
                    onClick={() => {
                      setIsEditingName(true);
                      setNameFormData({ name: user?.name || '' });
                      setNameFormErrors({});
                    }}
                    className="p-1 hover:bg-accent/10 rounded transition-colors"
                    title="Edit name"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground hover:text-accent" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateName} className="mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameFormData.name}
                      onChange={(e) => {
                        setNameFormData({ name: e.target.value });
                        setNameFormErrors({});
                      }}
                      className={`input-field flex-1 ${nameFormErrors.name ? 'border-destructive' : ''}`}
                      placeholder="Enter your name"
                      autoFocus
                      required
                    />
                    <button
                      type="submit"
                      disabled={isUpdatingName}
                      className="btn-accent px-4 py-2 disabled:opacity-50"
                    >
                      {isUpdatingName ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Save'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false);
                        setNameFormData({ name: '' });
                        setNameFormErrors({});
                      }}
                      className="btn-outline px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                  {nameFormErrors.name && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      {nameFormErrors.name}
                    </p>
                  )}
                </form>
              )}

              {/* Email Section */}
              {!isEditingEmail ? (
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-muted-foreground">{user?.email}</p>
                  <button
                    onClick={() => {
                      setIsEditingEmail(true);
                      setEmailFormData({ newEmail: '', currentPassword: '' });
                      setEmailFormErrors({});
                    }}
                    className="p-1 hover:bg-accent/10 rounded transition-colors"
                    title="Change email"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground hover:text-accent" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleChangeEmail} className="mb-2 space-y-2">
                  <input
                    type="email"
                    value={emailFormData.newEmail}
                    onChange={(e) => {
                      setEmailFormData({ ...emailFormData, newEmail: e.target.value });
                      setEmailFormErrors({ ...emailFormErrors, newEmail: '' });
                    }}
                    className={`input-field w-full ${emailFormErrors.newEmail ? 'border-destructive' : ''}`}
                    placeholder="Enter new email"
                    autoFocus
                    required
                  />
                  {emailFormErrors.newEmail && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      {emailFormErrors.newEmail}
                    </p>
                  )}
                  <input
                    type="password"
                    value={emailFormData.currentPassword}
                    onChange={(e) => {
                      setEmailFormData({ ...emailFormData, currentPassword: e.target.value });
                      setEmailFormErrors({ ...emailFormErrors, currentPassword: '' });
                    }}
                    className={`input-field w-full ${emailFormErrors.currentPassword ? 'border-destructive' : ''}`}
                    placeholder="Enter current password for security"
                    required
                  />
                  {emailFormErrors.currentPassword && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      {emailFormErrors.currentPassword}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isChangingEmail}
                      className="btn-accent px-4 py-2 disabled:opacity-50"
                    >
                      {isChangingEmail ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Save'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingEmail(false);
                        setEmailFormData({ newEmail: '', currentPassword: '' });
                        setEmailFormErrors({});
                      }}
                      className="btn-outline px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent">
                {user?.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Current Password <span className="text-destructive">*</span>
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => {
                  setFormData({ ...formData, currentPassword: e.target.value });
                  setFormErrors({ ...formErrors, currentPassword: '' });
                }}
                className={`input-field ${formErrors.currentPassword ? 'border-destructive' : ''}`}
                placeholder="Enter your current password"
                required
              />
              {formErrors.currentPassword && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {formErrors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                New Password <span className="text-destructive">*</span>
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => {
                  setFormData({ ...formData, newPassword: e.target.value });
                  setFormErrors({ ...formErrors, newPassword: '' });
                }}
                className={`input-field ${formErrors.newPassword ? 'border-destructive' : ''}`}
                placeholder="Enter your new password (min 6 characters)"
                required
              />
              {formErrors.newPassword && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {formErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Confirm New Password <span className="text-destructive">*</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setFormErrors({ ...formErrors, confirmPassword: '' });
                }}
                className={`input-field ${formErrors.confirmPassword ? 'border-destructive' : ''}`}
                placeholder="Confirm your new password"
                required
              />
              {formErrors.confirmPassword && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {formErrors.confirmPassword}
                </p>
              )}
              {!formErrors.confirmPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                <p className="text-sm text-success mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="btn-accent w-full sm:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Logout Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Account Actions</h3>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-outline text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

