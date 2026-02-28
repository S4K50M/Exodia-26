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
 * MAIN ADMIN PAGE COMPONENT
 */
export function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('approval');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- REPLACE THIS WITH YOUR ADMIN EMAIL ---
  const ADMIN_EMAIL = "setiasaksham15@gmail.com";

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user.email === ADMIN_EMAIL) fetchRegistrations();
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('registrations').select('*');
    if (!error) setRegistrations(data || []);
    setLoading(false);
  };

  const handleApprove = async (reg: any) => {
    // 1. Move to 'registered' table
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

    // 2. THE CLEANUP (Only for Tick)
    // Delete Image from Storage
    const fileName = reg.proof_url.split('/').pop();
    await supabase.storage.from('payment_proofs').remove([fileName]);

    // Delete Row from registrations table
    await supabase.from('registrations').delete().eq('id', reg.id);
    
    // 3. Pop out of UI immediately
    setRegistrations(prev => prev.filter(item => item.id !== reg.id));
  };

  const handleReject = (reg: any) => {
    // For Cross: DO NOT delete from Supabase.
    // Just remove from the local array so it disappears from the screen.
    setRegistrations(prev => prev.filter(item => item.id !== reg.id));
  };


  const exportToCSV = async () => {
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
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Exodia_Final_List_${new Date().toISOString().split('T')[0]}.csv`);
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
            <p className="text-gray-500 text-sm">Managing Exodia 2026 Registrations</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-gray-500 hover:text-red-500 text-xs font-semibold uppercase tracking-widest transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab System */}
        <div className="flex gap-8 border-b border-white/10 mb-8 pb-1">
          {['approval', 'registered-list', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize pb-3 px-1 text-sm font-bold transition-all ${activeTab === tab ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'approval' ? (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              Pending Approvals 
              <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-0.5 rounded-full border border-yellow-500/20">
                {registrations.length}
              </span>
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <p className="text-gray-500 italic">Fetching new entries...</p>
              ) : registrations.length === 0 ? (
                <div className="bg-zinc-900/50 border border-dashed border-white/10 p-12 rounded-2xl text-center">
                  <p className="text-gray-500">All clear! No pending registrations.</p>
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
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-zinc-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-medium tracking-tight uppercase opacity-30">Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  );
}