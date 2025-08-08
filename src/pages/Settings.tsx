import AppLayout from "@/components/layout/AppLayout";
import { Seo } from "@/components/Seo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { fetchProfile, upsertProfile } from "@/services/finance";

export default function Settings() {
  const [form, setForm] = useState({ shop_name: "", owner_name: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile().then(p => {
      if (p) setForm({ shop_name: p.shop_name ?? "", owner_name: p.owner_name ?? "" });
    }).catch(() => {});
  }, []);

  async function save() {
    setLoading(true);
    try {
      await upsertProfile({ shop_name: form.shop_name, owner_name: form.owner_name });
      alert('Profile saved');
    } catch (e) {
      alert('Error saving');
    } finally { setLoading(false); }
  }

  return (
    <AppLayout>
      <Seo title="Settings – Smart Market Ledger" />
      <h1 className="text-2xl font-semibold">Profile & Settings</h1>
      <div className="mt-6 grid gap-4 max-w-xl">
        <div>
          <Label>Shop Name</Label>
          <Input value={form.shop_name} onChange={e => setForm({ ...form, shop_name: e.target.value })} />
        </div>
        <div>
          <Label>Owner Name</Label>
          <Input value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} />
        </div>
        <div>
          <Button onClick={save} variant="hero" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </AppLayout>
  );
}
