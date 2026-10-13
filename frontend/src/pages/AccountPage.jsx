import { useState } from 'react';
export default function AccountPage({ user, changePassword, setError, setNotice, busy, setBusy }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  async function submit(e) {
    e.preventDefault(); setError(''); setNotice('');
    if (form.newPassword !== form.confirmPassword) { setError('New password and confirmation do not match.'); return; }
    setBusy(true);
    try { const result = await changePassword(form); setNotice(result?.message || 'Password updated successfully.'); setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
    catch (err) { setError(err.message || 'Could not update password.'); }
    finally { setBusy(false); }
  }
  return <section className="dashboard-page"><div className="eyebrow">YOUR ACCOUNT</div><h1>My Profile</h1><p className="page-lead">Signed in as {user?.email}. Manage your account security and update your password here.</p><form className="panel stack-form" style={{ maxWidth: 560, marginTop: 26 }} onSubmit={submit}><h3>Change password</h3><label>Current password<input type="password" required autoComplete="current-password" value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})}/></label><label>New password<input type="password" required minLength={8} autoComplete="new-password" value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})}/></label><label>Confirm new password<input type="password" required minLength={8} autoComplete="new-password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})}/></label><button className="primary" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button><p className="tiny-note">We will email a security notification after a successful change when SMTP is configured.</p></form></section>;
}
