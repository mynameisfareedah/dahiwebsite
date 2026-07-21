import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

function VolunteerApplicationForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    state: '',
    country: '',
    occupation: '',
    skills: '',
    availability: '',
    interest: '',
    experience: '',
    motivation: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.full_name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('volunteer_applications').insert([
        {
          ...formData,
          status: 'Pending',
        },
      ]);

      if (error) {
        console.error('Error submitting application:', error);
        toast.error('Failed to submit application. Please try again.');
      } else {
        toast.success('Application submitted successfully! We\'ll be in touch soon.');
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          gender: '',
          state: '',
          country: '',
          occupation: '',
          skills: '',
          availability: '',
          interest: '',
          experience: '',
          motivation: '',
        });
      }
    } catch (error) {
      console.error('========== SUPABASE ERROR ==========');
      console.error(error);
      console.log('Message:', error?.message);
      console.log('Details:', error?.details);
      console.log('Hint:', error?.hint);
      console.log('Code:', error?.code);
      toast.error(error?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="application-form" className="section-shell max-w-7xl space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Apply now</span>
        <h2 className="mt-4 section-title">Volunteer Application Form</h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Ready to make a difference? Fill out the form below and join the DAHI volunteer community.
        </p>
      </div>

      <div className="soft-card p-8 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name and Email */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-slate-900">
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition placeholder:text-slate-500 focus:border-dahiPrimary focus:outline-none focus:ring-1 focus:ring-dahiPrimary"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-900">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition placeholder:text-slate-500 focus:border-dahiPrimary focus:outline-none focus:ring-1 focus:ring-dahiPrimary"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          {/* Phone and Gender */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-900">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition placeholder:text-slate-500 focus:border-dahiPrimary focus:outline-none focus:ring-1 focus:ring-dahiPrimary"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-semibold text-slate-900">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition focus:border-dahiPrimary focus:outline-none focus:ring-1 focus:ring-dahiPrimary"
              >
                <option value="">Select...</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* State and Country */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="state" className="block text-sm font-semibold text-slate-900">
                State/Province
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition placeholder:text-slate-500 focus:border-dahiPrimary focus:outline-none focus:ring-1 focus:ring-dahiPrimary"
                placeholder="e.g., Lagos"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-semibold text-slate-900">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition placeholder:text-slate-500 focus:border-dahiPrimary focus:outline-none focus:ring-1 focus:ring-dahiPrimary"
                placeholder="e.g., Nigeria"
              />
            </div>
          </div>

          {/* Occupation */}
          <div>
            <label htmlFor="occupation" className="block text-sm font-semibold text-slate-900">
              Current Occupation
            </label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition placeholder:text-slate-500 focus:border-dahiPrimary focus:outline-none focus:ring-1 focus:ring-dahiPrimary"
              placeholder="e.g., Healthcare Professional, Student, etc."
            />
          </div>

          {/* Skills */}
          <div>
            <label htmlFor="skills" className="block text-sm font-semibold text-slate-900">
              Relevant Skills
            </label>
            <textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              rows="3"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition placeholder:text-slate-500 focus:border-dahiPrimary focus:outline-none focus:ring-1 focus:ring-dahiPrimary"
              placeholder="e.g., event coordination, content writing, social media, design, etc."
            ></textarea>
          </div>

          {/* Availability */}
          <div>
            <label htmlFor="availability" className="block text-sm font-semibold text-slate-900">
              Time Availability
            </label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition focus:border-dahiPrimary focus:outline-none focus:ring-1 focus:ring-dahiPrimary"
            >
              <option value="">Select...</option>
              <option value="Few hours per month">Few hours per month</option>
              <option value="1-2 days per week">1-2 days per week</option>
              <option value="3-4 days per week">3-4 days per week</option>
              <option value="Full-time equivalent">Full-time equivalent</option>
            </select>
          </div>

          {/* Interest */}
          <div>
            <label htmlFor="interest" className="block text-sm font-semibold text-slate-900">
              Areas of Interest
            </label>
            <textarea
              id="interest"
              name="interest"
              value={formData.interest}
              onChange={handleChange}
              rows="3"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition placeholder:text-slate-500 focus:border-dahiPrimary focus:outline-none focus:ring-1 focus:ring-dahiPrimary"
              placeholder="Which volunteer opportunities interest you most?"
            ></textarea>
          </div>

          {/* Experience */}
          <div>
            <label htmlFor="experience" className="block text-sm font-semibold text-slate-900">
              Relevant Experience
            </label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows="3"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition placeholder:text-slate-500 focus:border-dahiPrimary focus:outline-none focus:ring-1 focus:ring-dahiPrimary"
              placeholder="Tell us about any relevant volunteer or professional experience"
            ></textarea>
          </div>

          {/* Motivation */}
          <div>
            <label htmlFor="motivation" className="block text-sm font-semibold text-slate-900">
              Why do you want to volunteer with DAHI?
            </label>
            <textarea
              id="motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
              rows="4"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition placeholder:text-slate-500 focus:border-dahiPrimary focus:outline-none focus:ring-1 focus:ring-dahiPrimary"
              placeholder="Share your motivation and what draws you to our mission"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-dahiPrimary px-6 py-3 font-semibold text-white transition hover:bg-dahiSecondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default VolunteerApplicationForm;
