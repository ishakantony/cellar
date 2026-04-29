import { toast } from 'sonner';
import type { ChangePasswordData, UpdateProfileData } from '@cellar/shared';
import { authClient } from '@/lib/auth-client';
import { ProfileForm, PasswordForm } from '@/components/settings';
import { useSettingsQuery } from '@/hooks/queries/use-settings';

export function SettingsPage() {
  const settingsQuery = useSettingsQuery();

  if (settingsQuery.isPending) {
    return <div className="py-16 text-center text-xs text-outline">Loading…</div>;
  }
  if (!settingsQuery.data) {
    return <div className="py-16 text-center text-xs text-outline">Failed to load settings.</div>;
  }

  const { user, hasPassword } = settingsQuery.data;

  async function handleUpdateProfile(data: UpdateProfileData) {
    await authClient.updateUser({ name: data.name });
    toast.success('Profile updated successfully');
  }

  async function handleChangePassword(data: ChangePasswordData) {
    const result = await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeOtherSessions: data.revokeOtherSessions,
    });
    if (result.error) {
      throw new Error(result.error.message || 'Failed to change password');
    }
    toast.success('Password changed successfully');
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">Settings</h2>
        <p className="text-xs text-outline mt-1">Manage your profile and account.</p>
      </div>

      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface mb-4">
          Profile
        </h3>
        <ProfileForm
          onSubmit={handleUpdateProfile}
          defaultValues={{ name: user.name }}
          userEmail={user.email}
        />
      </section>

      {hasPassword && (
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface mb-4">
            Password
          </h3>
          <PasswordForm onSubmit={handleChangePassword} />
        </section>
      )}
    </div>
  );
}
