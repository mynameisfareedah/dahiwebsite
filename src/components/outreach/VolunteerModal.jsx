import { useEffect, useRef, useState } from 'react';
import VolunteerForm from './VolunteerForm';

function VolunteerModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // allow mount then flip visible for CSS entry animation
      requestAnimationFrame(() => setVisible(true));

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const onKey = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', onKey);

      return () => {
        window.removeEventListener('keydown', onKey);
        document.body.style.overflow = prevOverflow;
      };
    }

    // when isOpen becomes false, start hide animation then unmount
    if (!isOpen && mounted) {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [isOpen, onClose, mounted]);

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 ${visible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-slate-950/70 transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="volunteer-modal-title"
        className={`relative w-full max-w-3xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 transform transition-all duration-200 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'} max-h-[85vh] overflow-auto`}
      >
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiPrimary">Volunteer Interest</p>
          <h3 id="volunteer-modal-title" className="mt-2 text-2xl font-bold text-slate-900">Share your interest with DAHI</h3>
          <p className="mt-2 text-sm text-slate-600">We would love to hear from you about how you would like to support this outreach.</p>
        </div>

        <div className="pb-6">
          <VolunteerForm onSuccess={onClose} onCancel={onClose} autoFocus />
        </div>
      </div>
    </div>
  );
}

export default VolunteerModal;
