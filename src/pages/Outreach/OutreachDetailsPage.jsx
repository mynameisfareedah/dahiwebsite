import { useState } from 'react';
import { Calendar, MapPin, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import SectionHeading from '../../components/common/SectionHeading';
import CTASection from '../../components/common/CTASection';
import ActivityCard from '../../components/outreach/ActivityCard';
import { completedOutreach } from '../../data/siteContent';

const galleryImages = [
  // Community & Participants
  { section: 'Community & Awareness', src: '/OUTREACH/Community Audience & Participants.jfif', alt: 'Women gathered during DAHI\'s first community health outreach in Gwagwalada', caption: 'Community members gathered during the outreach' },
  { section: 'Community & Awareness', src: '/OUTREACH/Cross-Section of Participants.jfif', alt: 'Diverse cross-section of community participants at the outreach event', caption: 'Women representing diverse age groups in the community' },
  { section: 'Community & Awareness', src: '/OUTREACH/Community Members in Attendance.jfif', alt: 'Community members attending DAHI\'s women\'s health outreach', caption: 'Community members in attendance at the venue' },
  { section: 'Community & Awareness', src: '/OUTREACH/Outreach Participants.jfif', alt: 'Participants engaging during DAHI\'s first community outreach', caption: 'Participants at the outreach event' },

  // Health Education & Screening
  { section: 'Health Education & Screening', src: '/OUTREACH/Health Education Session.jfif', alt: 'Health education session during DAHI\'s first community outreach', caption: 'Health education session with participants' },
  { section: 'Health Education & Screening', src: '/OUTREACH/Interactive Awareness Presentation.jfif', alt: 'Interactive awareness presentation during the women\'s health outreach', caption: 'Interactive health awareness presentation' },
  { section: 'Health Education & Screening', src: '/OUTREACH/Guest Facilitator Address.jfif', alt: 'Guest facilitator addressing participants at the outreach', caption: 'Guest facilitator leading a health discussion' },
  { section: 'Health Education & Screening', src: '/OUTREACH/Blood Pressure Screening.jfif', alt: 'Blood pressure screening during DAHI\'s community health outreach', caption: 'Blood pressure screening for participants' },
  { section: 'Health Education & Screening', src: '/OUTREACH/Vital Signs Screening.jfif', alt: 'Vital signs screening during the women\'s health outreach', caption: 'Vital signs screening station' },
  { section: 'Health Education & Screening', src: '/OUTREACH/Interactive Counseling Session.jfif', alt: 'Health counseling session during the DAHI community outreach', caption: 'Interactive health counseling session' },

  // DAHI Team & Volunteers
  { section: 'DAHI Team & Volunteers', src: '/OUTREACH/Community Outreach Team.jfif', alt: 'DAHI community outreach team members at the Gwagwalada event', caption: 'DAHI outreach team coordinating the event' },
  { section: 'DAHI Team & Volunteers', src: '/OUTREACH/Dr. Adi alongside Dedicated Community Volunteers.jfif', alt: 'Dr. Adi working alongside community health volunteers', caption: 'Dr. Adi with dedicated community volunteers' },
  { section: 'DAHI Team & Volunteers', src: '/OUTREACH/Doc Adi and Health Screening Volunteers.jfif', alt: 'Doc Adi and health screening volunteers supporting participants', caption: 'Doc Adi with health screening volunteers' },
  { section: 'DAHI Team & Volunteers', src: '/OUTREACH/Community Care DAHI\'s Women\'s Health Program.jfif', alt: 'DAHI team demonstrating commitment to community women\'s health care', caption: 'DAHI team committed to community care' },
  { section: 'DAHI Team & Volunteers', src: '/OUTREACH/Doc Adi and Event Coordinators.jfif', alt: 'Doc Adi with event coordinators during the outreach', caption: 'Doc Adi with event coordinators' },
];

const impactThemes = [
  { icon: 'fa-solid fa-people-group', title: 'Community Outreach', description: 'Taking women’s health education beyond the screen and into communities.' },
  { icon: 'fa-solid fa-book-open', title: 'Health Education', description: 'Providing accessible information that helps women make informed health decisions.' },
  { icon: 'fa-solid fa-laptop-medical', title: 'Digital Resources', description: 'Creating webinars, educational resources, and practical materials women can access and share.' },
  { icon: 'fa-solid fa-shield-heart', title: 'Early Detection', description: 'Promoting awareness of preventive healthcare and the importance of seeking care early.' },
];

function OutreachDetailsPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const paragraphs = completedOutreach.fullDescription.split(/\n\n/);

  return (
    <>
      <SEO
        title="DAHI First Community Outreach"
        description="Learn about Doc Adi Health Initiative’s first community health outreach in Gwagwalada, Abuja, focused on women’s health awareness, early detection, and preventive healthcare."
        image="/OUTREACH/Community Audience & Participants.jfif"
        path="/outreach"
      />

      <section className="section-shell max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="eyebrow">Completed August 15, 2026</span>
            <h1 className="mt-5 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">Our First Community Outreach</h1>
            <p className="mt-5 text-2xl font-semibold leading-tight text-dahiPrimary">Silent Diseases in Women: Early Detection Saves Lives</p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">DAHI successfully moved its mission from primarily online education into community-based health outreach in Gwagwalada, Abuja.</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Calendar className="mt-1 h-5 w-5 shrink-0 text-dahiPrimary" />
                <div><div className="font-semibold text-slate-900">August 15, 2026</div><div className="text-sm text-slate-600">10:00 AM</div></div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-dahiPrimary" />
                <div><div className="font-semibold text-slate-900">Gwagwalada, Abuja</div><div className="text-sm text-slate-600">Nigeria</div></div>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/contact" className="inline-flex items-center justify-center rounded-full bg-dahiPrimary px-6 py-3 text-sm font-semibold text-white transition hover:bg-dahiSecondary">Support Future Outreach</Link>
              <Link to="/blog/first-community-outreach" className="inline-flex items-center justify-center rounded-full border border-dahiPrimary px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5">Read the Full Story</Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[1.5rem] border border-dahiPrimary/20 bg-white p-3 shadow-sm">
            <img src="/OUTREACH/Community Audience & Participants.jfif" alt="Women gathered during DAHI's first community health outreach in Gwagwalada" width="1195" height="896" className="h-auto w-full rounded-[1.1rem] object-cover" />
          </div>
        </div>
      </section>

      <section className="section-shell max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="soft-card p-8 sm:p-10">
            <SectionHeading eyebrow="About the outreach" title="A new chapter for DAHI" />
            <div className="mt-6 space-y-4 text-lg leading-8 text-slate-600">
              {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
          <div className="soft-card p-8 sm:p-10">
            <SectionHeading eyebrow="Why this matters" title="Awareness creates room for earlier action" description="The outreach was designed to promote awareness, encourage early detection, and provide accessible health information and preventive health education." />
            <div className="mt-7 rounded-2xl border border-dahiPrimary/20 bg-dahiPrimary/5 p-6 text-lg leading-8 text-slate-700">By bringing education and screening conversations into a community setting, DAHI created a welcoming space for women to ask questions, understand important health messages, and consider the next steps that may support their wellbeing.</div>
          </div>
        </div>
      </section>

      <section className="section-shell max-w-7xl">
        <SectionHeading eyebrow="What we did" title="Education, screening, and meaningful conversations" description="The outreach activities are based on the programme information already available in DAHI’s materials." />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {completedOutreach.plannedActivities.map((activity) => <ActivityCard key={activity.title} {...activity} />)}
        </div>
      </section>

      <section className="section-shell max-w-7xl">
        <SectionHeading eyebrow="Our impact" title="A mission that now reaches into communities" description="From health education to community outreach, DAHI is committed to making women’s health information more accessible, practical, and actionable." />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {impactThemes.map((item) => (
            <article key={item.title} className="soft-card p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-2xl text-dahiPrimary"><i className={item.icon}></i></div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell max-w-7xl">
        <SectionHeading eyebrow="Photo gallery" title="Moments From Our First Outreach" description="Highlights from our first community health outreach in Gwagwalada, Abuja." />
        <div className="mt-8 space-y-12">
          {['Community & Awareness', 'Health Education & Screening', 'DAHI Team & Volunteers'].map((section) => (
            <div key={section}>
              <h3 className="mb-6 text-2xl font-bold text-slate-900">{section}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {galleryImages
                  .filter((img) => img.section === section)
                  .map((image) => (
                    <button
                      key={image.src}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className="group overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white text-left shadow-sm transition hover:shadow-md"
                      aria-label={`Open larger view: ${image.alt}`}
                    >
                      <div className="overflow-hidden bg-slate-100">
                        <img src={image.src} alt={image.alt} loading="lazy" className="h-80 w-full object-cover transition duration-300 group-hover:scale-[1.05]" />
                      </div>
                      {image.caption && <div className="p-4 text-sm font-medium text-slate-700">{image.caption}</div>}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <CTASection eyebrow="Looking ahead" title="Help DAHI take trusted health education further" description="DAHI’s first outreach is a beginning. Support future community-based education, awareness, and preventive health initiatives by connecting with the team." actions={[
        <Link key="contact" to="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Contact DAHI</Link>,
        <Link key="volunteer" to="/volunteer" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Volunteer</Link>,
      ]} />

      {selectedImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-label="Expanded outreach image" onClick={() => setSelectedImage(null)}>
          <div className="relative max-h-[90vh] max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSelectedImage(null)} className="absolute right-2 top-2 rounded-full bg-white p-2 text-slate-900 shadow-lg" aria-label="Close expanded image"><X className="h-5 w-5" /></button>
            <img src={selectedImage.src} alt={selectedImage.alt} className="max-h-[90vh] max-w-full rounded-xl object-contain" />
          </div>
        </div>
      )}
    </>
  );
}

export default OutreachDetailsPage;
