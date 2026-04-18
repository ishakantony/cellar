'use client';

import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { ProfileForm } from '@/components/settings';
import type { UpdateProfileData } from '@/schemas/settings';

export interface SettingsClientProps {
  user: { name: string; email: string; image?: string | null };
}

export function SettingsClient({ user }: SettingsClientProps) {
  async function handleUpdateProfile(data: UpdateProfileData) {
    await authClient.updateUser({ name: data.name });
    toast.success('Profile updated successfully');
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
    </div>
  );
}
