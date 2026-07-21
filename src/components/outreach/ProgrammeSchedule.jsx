import SectionHeading from '../common/SectionHeading';

function ProgrammeSchedule({ schedule }) {
  return (
    <section className="section-shell max-w-7xl space-y-8">
      <SectionHeading
        eyebrow="What To Expect"
        title="Programme Schedule"
        description="Here's how we'll spend our time together on the day of the outreach."
      />

      <div className="soft-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {schedule.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b border-slate-200 last:border-0 ${
                    index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                  }`}
                >
                  <td className="px-6 py-4 sm:px-8">
                    <div className="font-bold text-dahiPrimary">{item.time}</div>
                  </td>
                  <td className="px-6 py-4 sm:px-8">
                    <div className="font-semibold text-slate-900">{item.activity}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 sm:p-8">
        <span className="font-semibold text-slate-900">Note:</span> All times are subject to change. Final schedule will be confirmed in the registration email.
      </div>
    </section>
  );
}

export default ProgrammeSchedule;
