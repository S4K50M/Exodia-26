import { useEffect, useState, useRef } from 'react';
import supabase from '../utils/supabase';
import gsap from 'gsap';

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return

    // Fetch live notifications from Supabase
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setNotifications(data);
    };

    fetchNotifications();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Slide in from right and fade in overlay
      gsap.to(sidebarRef.current, { x: 0, duration: 0.6, ease: 'power3.out' });
      gsap.to(overlayRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.4 });
    } else {
      // Slide out to right
      gsap.to(sidebarRef.current, { x: '100%', duration: 0.5, ease: 'power3.in' });
      gsap.to(overlayRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.4 });
    }
  }, [isOpen]);

  return (
    <>
      {/* Blurring Overlay */}
      <div 
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] opacity-0 pointer-events-none transition-all"
      />

      {/* Sidebar Panel */}
      <div 
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-zinc-950/80 backdrop-blur-2xl border-l border-white/10 z-[101] translate-x-full shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 uppercase tracking-tighter">
            Announcements
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {notifications.length === 0 ? (
            <p className="text-gray-500 italic text-center mt-10">No new updates yet.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="relative pl-4 border-l-2 border-yellow-500/50 group">
                <p className="text-[10px] font-mono text-yellow-500/60 uppercase mb-1">
                  {new Date(n.created_at).toLocaleDateString()}
                </p>
                <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                  {n.heading}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mt-1">
                  {n.body}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-black/20 text-[10px] text-center text-gray-500 uppercase tracking-widest">
          Exodia 2026 • IIT Mandi
        </div>
      </div>
    </>
  );
}
