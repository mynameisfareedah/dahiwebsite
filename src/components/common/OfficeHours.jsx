import { Clock3, MessageCircleMore } from 'lucide-react';

function OfficeHours() {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-white p-3 text-dahiPrimary shadow-sm">
          <Clock3 size={18} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">When you can reach us</h3>
          <p className="text-sm text-slate-600">We are here to support and respond to your enquiries.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1rem] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">Office hours</p>
          <p className="mt-2 text-slate-700">Monday – Saturday</p>
          <p className="text-slate-700">8:00 AM – 5:00 PM (WAT)</p>
        </div>
        <div className="rounded-[1rem] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dahiSecondary">Response time</p>
          <div className="mt-2 flex items-center gap-2 text-slate-700">
            <MessageCircleMore size={16} className="text-dahiPrimary" />
            <span>We aim to respond within 1–2 business days.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficeHours;
