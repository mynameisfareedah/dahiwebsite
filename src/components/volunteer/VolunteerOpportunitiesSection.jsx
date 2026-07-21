import { useEffect, useState } from 'react';
import { getActiveVolunteerOpportunities } from '../../services/supabase/volunteerService';
import LoadingState from '../common/LoadingState';
import toast from 'react-hot-toast';

function VolunteerOpportunitiesSection() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOpportunities = async () => {
      setLoading(true);
      const { data, error: fetchError } = await getActiveVolunteerOpportunities();

      if (fetchError) {
        setError(fetchError);
        console.error('Error loading opportunities:', fetchError);
      } else {
        setOpportunities(data || []);
      }
      setLoading(false);
    };

    loadOpportunities();
  }, []);

  if (loading) {
    return (
      <section className="section-shell max-w-7xl space-y-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Volunteer opportunities</span>
          <h2 className="mt-4 section-title">Ways You Can Help</h2>
        </div>
        <LoadingState />
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-shell max-w-7xl space-y-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Volunteer opportunities</span>
          <h2 className="mt-4 section-title">Ways You Can Help</h2>
        </div>
        <div className="rounded-[1.25rem] border border-red-200 bg-red-50 p-6 text-center">
          <div className="text-lg font-semibold text-red-900">Unable to load opportunities</div>
          <p className="mt-2 text-red-700">{error}</p>
        </div>
      </section>
    );
  }

  if (opportunities.length === 0) {
    return (
      <section className="section-shell max-w-7xl space-y-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Volunteer opportunities</span>
          <h2 className="mt-4 section-title">Ways You Can Help</h2>
        </div>
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-12 text-center">
          <i className="fa-solid fa-inbox text-4xl text-slate-400"></i>
          <div className="mt-4 text-lg font-semibold text-slate-900">No opportunities available</div>
          <p className="mt-2 text-slate-600">Check back soon for new volunteer opportunities!</p>
        </div>
      </section>
    );
  }

  return (
    <section id="opportunities" className="section-shell max-w-7xl space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Volunteer opportunities</span>
        <h2 className="mt-4 section-title">Ways You Can Help</h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Explore our current volunteer opportunities and find one that matches your skills and availability.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="soft-card overflow-hidden">
            {opportunity.image_url && (
              <img
                src={opportunity.image_url}
                alt={opportunity.title}
                loading="lazy"
                className="h-48 w-full object-cover"
              />
            )}
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{opportunity.title}</h3>
                  {opportunity.type && (
                    <div className="mt-2 flex gap-2">
                      <span className="rounded-full bg-dahiPrimary/10 px-3 py-1 text-xs font-semibold text-dahiPrimary">
                        {opportunity.type}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {opportunity.description && (
                <p className="mt-4 text-sm text-slate-600 line-clamp-3">{opportunity.description}</p>
              )}

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {opportunity.location && (
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-map-pin text-dahiPrimary"></i>
                    <span>{opportunity.location}</span>
                  </div>
                )}
                {opportunity.commitment && (
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-hourglass-half text-dahiPrimary"></i>
                    <span>{opportunity.commitment}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
                  toast.success(`Interested in "${opportunity.title}"? Fill out the form below to apply!`);
                }}
                className="mt-6 w-full rounded-full bg-dahiPrimary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-dahiSecondary"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default VolunteerOpportunitiesSection;
