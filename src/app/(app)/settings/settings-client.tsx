'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsClient({
  user,
}: {
  user: { name: string; email: string; image?: string | null };
}) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await authClient.updateUser({ name });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
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
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-outline cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-container/30 hover:bg-primary-container/50 border border-primary/30 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save Changes
          </button>
        </form>
      </section>
    </div>
  );
}
