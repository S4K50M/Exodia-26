import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';

/**
 * LOGIN COMPONENT
 * Handles Email/Password authentication
 */
function AdminLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onLoginSuccess();
    }
  };

  return (
    <div className="h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans">
      <form 
        onSubmit={handleLogin}
        className="bg-zinc-900 p-8 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl"
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mb-6 text-center uppercase tracking-tighter">
          Exodia Admin
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white transition-all"
              placeholder="admin@exodia.in"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 ml-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-700 text-black font-black rounded-xl transition-all mt-4 uppercase tracking-widest"
          >
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </div>
      </form>
    </div>
  );
}


/**
 * NOTIFICATION SYSTEM COMPONENT
 */
function NotificationTab() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [heading, setHeading] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setNotifications(data || []);
  };

  const handleCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('notifications')
      .insert([{ heading, body }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setHeading('');
      setBody('');
      fetchNotifications();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (!error) setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Compose Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-yellow-500 uppercase tracking-tight">Compose Notification</h2>
        <form onSubmit={handleCompose} className="bg-zinc-900 p-6 rounded-2xl border border-white/10 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Heading</label>
            <input 
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. Workshop Update"
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Body Message</label>
            <textarea 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your announcement here..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all resize-none"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl transition-all uppercase tracking-widest text-sm"
          >
            {loading ? 'Posting...' : 'Post Notification'}
          </button>
        </form>
      </div>

      {/* List Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-400 uppercase tracking-tight">Current Notifications</h2>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {notifications.length === 0 && <p className="text-gray-600 italic">No notifications found.</p>}
          {notifications.map((n) => (
            <div key={n.id} className="group bg-zinc-900/50 border border-white/5 p-5 rounded-2xl relative hover:border-white/20 transition-all">
              <button 
                onClick={() => handleDelete(n.id)}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <h3 className="font-bold text-white text-lg pr-8">{n.heading}</h3>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">{n.body}</p>
              <p className="text-[10px] text-zinc-600 mt-4 font-mono">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/**
 * ADVERTISEMENT TAB COMPONENT
 */
const gdrive = (url: string): string => {
  // Convert Google Drive share link or ID to thumbnail URL
  // Supports: https://drive.google.com/file/d/ID/view or plain ID
  const match = url.match(/[-\w]{25,}/);
  if (!match) return url;
  return `https://drive.google.com/thumbnail?id=${match[0]}`;
};

function AdvertisementTab() {
  const [current, setCurrent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [isActive, setIsActive] = useState(false);
  const [shape, setShape] = useState<'rectangle' | 'square' | 'portrait'>('rectangle');
  const [hasButton, setHasButton] = useState(false);
  const [buttonLink, setButtonLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => { fetchCurrent(); }, []);

  const fetchCurrent = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('advertisement')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      const d = data[0];
      setCurrent(d);
      setIsActive(d.is_active);
      setShape(d.shape);
      setHasButton(d.has_button);
      setButtonLink(d.button_link || '');
      setImageUrl(d.image_url || '');
      setHeading(d.heading);
      setDescription(d.description);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    // Convert Google Drive URL to thumbnail URL (or null if empty)
    const finalImageUrl = imageUrl.trim() ? gdrive(imageUrl.trim()) : null;

    // Delete ALL old rows
    const { error: delError } = await supabase
      .from('advertisement')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all

    if (delError) {
      setMsg({ type: 'error', text: 'Failed to clear old data: ' + delError.message });
      setSaving(false);
      return;
    }

    // Insert new row
    const { error: insError } = await supabase
      .from('advertisement')
      .insert([{
        is_active: isActive,
        shape,
        has_button: hasButton,
        button_link: hasButton && buttonLink.trim() ? buttonLink.trim() : null,
        image_url: finalImageUrl,
        heading: heading.trim(),
        description: description.trim(),
      }]);

    if (insError) {
      setMsg({ type: 'error', text: 'Failed to save: ' + insError.message });
    } else {
      setMsg({ type: 'success', text: 'Advertisement updated successfully!' });
      fetchCurrent();
    }
    setSaving(false);
  };

  const shapes: { value: 'rectangle' | 'square' | 'portrait'; label: string; desc: string }[] = [
    { value: 'rectangle', label: 'Rectangle', desc: 'Wide landscape card (520px)' },
    { value: 'square', label: 'Square', desc: 'Balanced square card (420px)' },
    { value: 'portrait', label: 'Portrait', desc: 'Tall narrow card (360px)' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Form Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-yellow-500 uppercase tracking-tight">Configure Advertisement</h2>

        {loading ? (
          <p className="text-gray-500 italic">Loading current config...</p>
        ) : (
          <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-2xl border border-white/10 space-y-5">

            {/* On/Off Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="text-sm font-bold text-white">Advertisement Active</p>
                <p className="text-xs text-gray-500 mt-0.5">Show popup on homepage</p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(v => !v)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-yellow-500' : 'bg-zinc-700'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                  isActive ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Shape */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-3 ml-1">Poster Shape</label>
              <div className="grid grid-cols-3 gap-3">
                {shapes.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setShape(s.value)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      shape === s.value
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs font-bold">{s.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Redirect Button Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="text-sm font-bold text-white">Redirect Button</p>
                <p className="text-xs text-gray-500 mt-0.5">Show a CTA button on the popup</p>
              </div>
              <button
                type="button"
                onClick={() => setHasButton(v => !v)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  hasButton ? 'bg-yellow-500' : 'bg-zinc-700'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                  hasButton ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Redirect Link (conditional) */}
            {hasButton && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Redirect Button Link</label>
                <input
                  type="url"
                  value={buttonLink}
                  onChange={e => setButtonLink(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-white"
                  required={hasButton}
                />
              </div>
            )}

            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Image URL <span className="normal-case text-gray-600 font-normal">(Google Drive public link, optional)</span></label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view"
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-white"
              />
              <p className="text-[10px] text-gray-600 mt-1 ml-1">Will be auto-converted to a Google Drive thumbnail URL before saving</p>
            </div>

            {/* Heading */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Heading <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={heading}
                onChange={e => setHeading(e.target.value)}
                placeholder="e.g. Registrations Now Open!"
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-white"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Description <span className="text-red-400">*</span></label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Write the advertisement body text here..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all resize-none text-white"
                required
              />
            </div>

            {/* Message */}
            {msg && (
              <div className={`p-3 rounded-lg text-sm font-semibold ${
                msg.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-700 text-black font-black rounded-xl transition-all uppercase tracking-widest text-sm"
            >
              {saving ? 'Saving...' : 'Save Advertisement'}
            </button>
          </form>
        )}
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-400 uppercase tracking-tight">Current Config</h2>
        {current ? (
          <div className="bg-zinc-900 border border-white/5 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                current.is_active
                  ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                  : 'bg-zinc-700/50 text-gray-500 border border-white/5'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  current.is_active ? 'bg-green-400' : 'bg-gray-600'
                }`} />
                {current.is_active ? 'LIVE' : 'OFF'}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{current.shape} shape</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Heading</p>
              <p className="text-white font-bold">{current.heading}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">Description</p>
              <p className="text-gray-400 text-sm leading-relaxed">{current.description}</p>
            </div>
            {current.image_url && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Image</p>
                <img src={current.image_url} alt="Ad preview" className="w-full max-h-40 object-cover rounded-lg border border-white/10" />
              </div>
            )}
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-500">
                Button: <span className={current.has_button ? 'text-yellow-400 font-bold' : 'text-gray-600'}>{current.has_button ? 'Yes' : 'No'}</span>
              </span>
              {current.has_button && current.button_link && (
                <a href={current.button_link} target="_blank" rel="noreferrer" className="text-yellow-400/70 underline truncate max-w-[200px]">
                  {current.button_link}
                </a>
              )}
            </div>
            <p className="text-[10px] text-zinc-600 font-mono">
              Last updated: {new Date(current.created_at).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-dashed border-white/10 p-12 rounded-2xl text-center">
            <p className="text-gray-500">No advertisement configured yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}


/**
 * MAIN ADMIN PAGE COMPONENT
 */
export function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('approval');
  
  // Registration State
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loadingReg, setLoadingReg] = useState(true);

  // Merch State
  const [merchOrders, setMerchOrders] = useState<any[]>([]);
  const [loadingMerch, setLoadingMerch] = useState(true);

  // --- REPLACE THIS WITH YOUR ADMIN EMAIL ---
  const ADMIN_EMAIL = "setiasaksham15@gmail.com";

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user.email === ADMIN_EMAIL) {
        fetchRegistrations();
        fetchMerchOrders();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- REGISTRATION LOGIC ---
  const fetchRegistrations = async () => {
    setLoadingReg(true);
    const { data, error } = await supabase.from('registrations').select('*');
    if (!error) setRegistrations(data || []);
    setLoadingReg(false);
  };

  const handleApprove = async (reg: any) => {
    const { error: insertError } = await supabase.from('registered').insert([{
      full_name: reg.full_name,
      email: reg.email,
      phone: reg.phone,
      institute_name: reg.institute_name,
      contingent_size: reg.contingent_size,
      total_amount: reg.total_amount,
      transaction_id: reg.transaction_id
    }]);

    if (insertError) return alert("Approval failed: " + insertError.message);

    const fileName = reg.proof_url.split('/').pop();
    await supabase.storage.from('payment_proofs').remove([fileName]);
    await supabase.from('registrations').delete().eq('id', reg.id);
    
    setRegistrations(prev => prev.filter(item => item.id !== reg.id));
  };

  const handleReject = (reg: any) => {
    setRegistrations(prev => prev.filter(item => item.id !== reg.id));
  };

  const exportRegistrationsCSV = async () => {
    const { data, error } = await supabase
      .from('registered')
      .select('full_name, email, phone, institute_name, contingent_size, total_amount, transaction_id, verified_at')
      .order('verified_at', { ascending: false });

    if (error || !data) return alert("Export failed: " + error?.message);

    const headers = ["Full Name", "Email", "Phone", "Institute", "Size", "Amount", "Txn ID", "Verified At"];
    const csvRows = data.map(row => [
      `"${row.full_name}"`,
      `"${row.email}"`,
      `"${row.phone}"`,
      `"${row.institute_name}"`,
      row.contingent_size,
      row.total_amount,
      `"${row.transaction_id}"`,
      `"${new Date(row.verified_at).toLocaleString()}"`
    ].join(","));

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Exodia_Registrations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- MERCHANDISE LOGIC ---
  const fetchMerchOrders = async () => {
    setLoadingMerch(true);
    const { data, error } = await supabase.from('merch_orders').select('*');
    if (!error) setMerchOrders(data || []);
    setLoadingMerch(false);
  };

  const handleMerchApprove = async (order: any) => {
    const { error: insertError } = await supabase.from('merch_approved').insert([{
      full_name: order.full_name,
      email: order.email,
      phone: order.phone,
      items_ordered: order.items_ordered,
      total_amount: order.total_amount,
      transaction_id: order.transaction_id
    }]);

    if (insertError) return alert("Approval failed: " + insertError.message);

    const fileName = order.proof_url.split('/').pop();
    await supabase.storage.from('payment_proofs').remove([fileName]);
    await supabase.from('merch_orders').delete().eq('id', order.id);
    
    setMerchOrders(prev => prev.filter(item => item.id !== order.id));
  };

  const handleMerchReject = (order: any) => {
    setMerchOrders(prev => prev.filter(item => item.id !== order.id));
  };

  const exportMerchCSV = async () => {
    const { data, error } = await supabase
      .from('merch_approved')
      .select('*')
      .order('verified_at', { ascending: false });

    if (error || !data) return alert("Export failed: " + error?.message);

    const headers = ["Full Name", "Email", "Phone", "Items Ordered", "Amount", "Txn ID", "Verified At"];
    const csvRows = data.map(row => {
      // Format items ordered into a readable string for CSV
      let itemsStr = "Invalid Data";
      if (Array.isArray(row.items_ordered)) {
        itemsStr = row.items_ordered.map((i: any) => 
          `${i.item} (Size 1: ${i.size1 || 'N/A'}${i.size2 ? `, Size 2: ${i.size2}` : ''})`
        ).join(" | ");
      }
      return [
        `"${row.full_name}"`,
        `"${row.email}"`,
        `"${row.phone}"`,
        `"${itemsStr}"`,
        row.total_amount,
        `"${row.transaction_id}"`,
        `"${new Date(row.verified_at).toLocaleString()}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Exodia_Merch_Orders_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auth Guard
  if (!session || session.user.email !== ADMIN_EMAIL) {
    return <AdminLogin onLoginSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-6">
      <div className="max-w-7xl mx-auto">
        <br></br><br></br><br></br>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-yellow-500 uppercase tracking-tighter">Admin Control Panel</h1>
            <p className="text-gray-500 text-sm">Managing Exodia 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-gray-500 hover:text-red-500 text-xs font-semibold uppercase tracking-widest transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab System */}
        <div className="flex flex-wrap gap-4 md:gap-8 border-b border-white/10 mb-8 pb-1">
          {['approval', 'merch', 'notification', 'advertisement'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize pb-3 px-1 text-sm font-bold transition-all ${activeTab === tab ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* --- EVENT APPROVALS TAB --- */}
        {activeTab === 'approval' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Event Registrations 
                <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-0.5 rounded-full border border-yellow-500/20">
                  {registrations.length}
                </span>
              </h2>
              <button 
                onClick={exportRegistrationsCSV}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"
              >
                Export Approved Events CSV
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {loadingReg ? (
                <p className="text-gray-500 italic">Fetching new entries...</p>
              ) : registrations.length === 0 ? (
                <div className="bg-zinc-900/50 border border-dashed border-white/10 p-12 rounded-2xl text-center">
                  <p className="text-gray-500">All clear! No pending event registrations.</p>
                </div>
              ) : registrations.map((reg) => (
                <div key={reg.id} className="bg-zinc-900 border border-white/5 p-5 rounded-2xl flex flex-col lg:flex-row gap-6 items-center hover:border-white/20 transition-colors">
                  
                  {/* Proof Image Thumbnail */}
                  <div className="relative group shrink-0">
                    <img 
                      src={reg.proof_url} 
                      alt="Payment Proof" 
                      className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-xl border border-white/10 shadow-xl group-hover:opacity-75 transition-all" 
                    />
                    <a 
                      href={reg.proof_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-xl text-xs font-bold"
                    >
                      View Full
                    </a>
                  </div>

                  {/* Information Grid */}
                  <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Applicant</p>
                      <p className="font-bold text-white text-base leading-tight">{reg.full_name}</p>
                      <p className="text-gray-400 text-xs">{reg.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Institute</p>
                      <p className="text-gray-300 font-medium truncate max-w-[150px]">{reg.institute_name}</p>
                      <p className="text-gray-400 text-xs">{reg.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Payment Details</p>
                      <p className="text-green-400 font-bold text-lg">₹{reg.total_amount}</p>
                      <p className="text-gray-500 text-xs">Size: {reg.contingent_size}</p>
                    </div>
                    <div className="space-y-1 col-span-2 md:col-span-1">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Transaction ID</p>
                      <p className="font-mono text-[11px] text-yellow-200/70 break-all bg-white/5 p-2 rounded-lg">{reg.transaction_id}</p>
                    </div>
                  </div>

                  {/* Approval Actions */}
                  <div className="flex flex-row lg:flex-col gap-3 shrink-0">
                    <button 
                      onClick={() => handleApprove(reg)} 
                      className="w-12 h-12 flex items-center justify-center bg-green-500/10 text-green-500 border border-green-500/20 rounded-full hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-900/10"
                      title="Approve"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleReject(reg)} 
                      className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-900/10"
                      title="Reject"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MERCHANDISE TAB --- */}
        {activeTab === 'merch' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Merch Orders 
                <span className="bg-purple-500/10 text-purple-400 text-xs px-2 py-0.5 rounded-full border border-purple-500/20">
                  {merchOrders.length}
                </span>
              </h2>
              <button 
                onClick={exportMerchCSV}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"
              >
                Export Approved Merch CSV
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {loadingMerch ? (
                <p className="text-gray-500 italic">Fetching new entries...</p>
              ) : merchOrders.length === 0 ? (
                <div className="bg-zinc-900/50 border border-dashed border-white/10 p-12 rounded-2xl text-center">
                  <p className="text-gray-500">All clear! No pending merch orders.</p>
                </div>
              ) : merchOrders.map((order) => (
                <div key={order.id} className="bg-zinc-900 border border-white/5 p-5 rounded-2xl flex flex-col lg:flex-row gap-6 items-center hover:border-white/20 transition-colors">
                  
                  {/* Proof Image Thumbnail */}
                  <div className="relative group shrink-0">
                    <img 
                      src={order.proof_url} 
                      alt="Payment Proof" 
                      className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-xl border border-white/10 shadow-xl group-hover:opacity-75 transition-all" 
                    />
                    <a 
                      href={order.proof_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-xl text-xs font-bold"
                    >
                      View Full
                    </a>
                  </div>

                  {/* Information Grid */}
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Buyer Details</p>
                      <p className="font-bold text-white text-base leading-tight">{order.full_name}</p>
                      <p className="text-gray-400 text-xs">{order.email}</p>
                      <p className="text-gray-400 text-xs">{order.phone}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Items Ordered</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                        {Array.isArray(order.items_ordered) ? (
                          order.items_ordered.map((item: any, idx: number) => (
                            <div key={idx} className="bg-white/5 p-2 rounded border border-white/5 text-xs">
                              <span className="text-purple-300 font-semibold">{item.item}</span>
                              <div className="text-gray-400 mt-1">
                                Size: {item.size1} {item.size2 && `| 2nd Size: ${item.size2}`}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-red-400">Invalid Item Data</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Payment Details</p>
                      <p className="text-green-400 font-bold text-lg">₹{order.total_amount}</p>
                      <p className="font-mono text-[11px] text-yellow-200/70 break-all bg-white/5 p-2 rounded-lg mt-2">{order.transaction_id}</p>
                    </div>
                  </div>

                  {/* Approval Actions */}
                  <div className="flex flex-row lg:flex-col gap-3 shrink-0">
                    <button 
                      onClick={() => handleMerchApprove(order)} 
                      className="w-12 h-12 flex items-center justify-center bg-green-500/10 text-green-500 border border-green-500/20 rounded-full hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-900/10"
                      title="Approve Order"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleMerchReject(order)} 
                      className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-900/10"
                      title="Reject Order"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- NOTIFICATIONS TAB --- */}
        {activeTab === 'notification' && <NotificationTab />}

        {/* --- ADVERTISEMENT TAB --- */}
        {activeTab === 'advertisement' && <AdvertisementTab />}
      </div>
    </div>
  );
}
