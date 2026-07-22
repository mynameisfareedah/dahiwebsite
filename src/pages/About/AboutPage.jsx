import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { impactStats } from '../../data/siteContent';
import SEO from '../../components/common/SEO';
import SectionHeading from '../../components/common/SectionHeading';
import TeamCard from '../../components/common/TeamCard';
import CTASection from '../../components/common/CTASection';
import AboutHero from '../../components/about/AboutHero';
import StorySection from '../../components/about/StorySection';
import TimelineSection from '../../components/about/TimelineSection';
import MissionVisionCard from '../../components/about/MissionVisionCard';
import ValueCard from '../../components/about/ValueCard';
import ServiceCard from '../../components/about/ServiceCard';
import ApproachCard from '../../components/about/ApproachCard';
import ImpactCounter from '../../components/about/ImpactCounter';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

function AboutPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState('');
  const values = [
    { icon: 'fa-solid fa-hand-holding-heart', title: 'Compassion', description: 'We believe health education should be delivered with empathy, understanding, and respect. Every woman’s health journey is unique, and we strive to create a supportive environment where women feel heard and valued.' },
    { icon: 'fa-solid fa-shield-halved', title: 'Integrity', description: 'We are committed to providing trustworthy and responsible health information. Accuracy, honesty, and transparency guide the resources we create and the conversations we facilitate.' },
    { icon: 'fa-solid fa-star', title: 'Excellence', description: 'We aim for quality in everything we do—from our educational materials and webinars to our community engagement initiatives. We continuously seek ways to improve and provide meaningful experiences.' },
    { icon: 'fa-solid fa-graduation-cap', title: 'Education', description: 'We believe knowledge is a powerful tool for improving health outcomes. Through education, women can better understand their bodies, recognise health concerns, and make informed choices.' },
    { icon: 'fa-solid fa-users', title: 'Community', description: 'We believe meaningful change happens through connection and collaboration. We create spaces where women can learn, share experiences, and support one another.' },
    { icon: 'fa-solid fa-rocket', title: 'Empowerment', description: 'Our goal is to help women build confidence in understanding and managing their health by providing the knowledge and resources they need.' },
  ];

  const services = [
    { icon: 'fa-solid fa-female', title: 'Women’s Health Education', description: 'We provide accessible health education that addresses important topics affecting women throughout different stages of life.' },
    { icon: 'fa-solid fa-video', title: 'Health Education Webinars', description: 'Through expert-led webinars and discussions, DAHI creates opportunities for women to learn directly from healthcare professionals.' },
    { icon: 'fa-solid fa-book-open', title: 'Educational Resources', description: 'We develop digital resources, guides, and educational materials that allow women to access reliable health information whenever they need it.' },
    { icon: 'fa-solid fa-bullhorn', title: 'Health Awareness Campaigns', description: 'We support awareness initiatives that encourage preventive healthcare, early detection, and healthier lifestyle choices.' },
    { icon: 'fa-solid fa-handshake', title: 'Community Engagement', description: 'We build supportive communities where women can connect, learn, share experiences, and access valuable health information.' },
  ];

  const approaches = [
    { icon: 'fa-solid fa-stethoscope', title: 'Evidence-Based', description: 'We prioritise reliable health information from trusted sources and healthcare professionals.' },
    { icon: 'fa-solid fa-universal-access', title: 'Accessible', description: 'We communicate health topics in simple and understandable ways.' },
    { icon: 'fa-solid fa-screwdriver-wrench', title: 'Practical', description: 'We focus on information women can apply in their daily lives.' },
    { icon: 'fa-solid fa-comments', title: 'Community-Focused', description: 'We encourage conversations and connections that help women feel supported.' },
    { icon: 'fa-solid fa-arrows-rotate', title: 'Continuous', description: 'We listen, learn, and improve our programmes based on community needs.' },
  ];

  const whyChoose = [
    { icon: 'fa-solid fa-circle-info', title: 'Accessible Health Education', description: 'Making health information easier to understand and more approachable for everyday life.' },
    { icon: 'fa-solid fa-check-double', title: 'Evidence-Based Content', description: 'Prioritising accurate and responsible information that reflects current best practice.' },
    { icon: 'fa-solid fa-heart-circle-check', title: 'Community-Centred Approach', description: 'Supporting meaningful conversations and shared learning experiences.' },
    { icon: 'fa-solid fa-file-lines', title: 'Practical Resources', description: 'Creating useful tools for everyday health decisions and ongoing learning.' },
    { icon: 'fa-solid fa-lightbulb', title: 'Continuous Learning', description: 'Improving based on feedback, lived experience, and community needs.' },
  ];

  useEffect(() => {
    let isMounted = true;

    const loadTeamMembers = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setTeamMembers([]);
        setTeamError('');
        setTeamLoading(false);
        return;
      }

      setTeamLoading(true);
      setTeamError('');

      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (error) {
          setTeamError(error.message || 'Unable to load team members.');
          setTeamMembers([]);
        } else {
          setTeamMembers(data || []);
        }
      } catch (err) {
        if (!isMounted) return;
        setTeamError(err?.message || 'Unable to load team members.');
        setTeamMembers([]);
      } finally {
        if (isMounted) {
          setTeamLoading(false);
        }
      }
    };

    loadTeamMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <SEO title="About Doc Adi Health Initiative" description="Learn about DAHI's mission, story, values, impact, and how to get involved in women’s health education." />
      <AboutHero />

      <section className="section-shell max-w-7xl space-y-8">
        <StorySection />
        <TimelineSection />

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Who we are" title="A health education organisation focused on women’s wellbeing" description="Doc Adi Health Initiative (DAHI) is a health education organisation focused on improving women’s access to reliable and practical health information." />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.25rem] border border-slate-200 p-6">
              <p className="text-lg leading-8 text-slate-600">
                We recognise that good health begins with awareness, understanding, and the ability to make informed choices. Through our programmes and resources, we aim to support women at different stages of life by providing education on important health topics in a simple, respectful, and accessible way.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 p-6">
              <p className="text-lg leading-8 text-slate-600">
                Our work focuses on creating learning opportunities through digital platforms, community engagement, educational resources, and conversations that encourage women to prioritise their health. DAHI is more than an information platform—we are building a community where women feel supported, informed, and empowered.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <MissionVisionCard icon="fa-solid fa-bullseye" title="Mission" description="Our mission is to empower women with accessible, evidence-based health education, practical resources, and supportive communities that promote informed decisions and healthier lives." accent="bg-dahiPrimary/10 text-dahiPrimary" />
          <MissionVisionCard icon="fa-solid fa-eye" title="Vision" description="Our vision is a future where every woman has the knowledge, confidence, and support needed to take control of her health." accent="bg-dahiSecondary/10 text-dahiSecondary" />
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Core values" title="The principles that guide everything we do" description="Our values shape the way we create resources, host conversations, and build relationships with the women and communities we serve." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {values.map((value) => (
              <ValueCard key={value.title} icon={value.icon} title={value.title} description={value.description} />
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="What we do" title="Supporting women through education, resources, and community connection" description="DAHI focuses on improving women’s health awareness through education, resources, and community-based initiatives." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.title} icon={service.icon} title={service.title} description={service.description} />
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Why women’s health matters" title="Awareness can change health outcomes" description="Women’s health plays an important role in the well-being of individuals, families, and communities." />
          <div className="mt-8 rounded-[1.3rem] border border-slate-200 bg-slate-50 p-7 text-lg leading-8 text-slate-600">
            Early awareness and preventive health education can help women recognise potential concerns, seek timely support, and make informed decisions about their health. At DAHI, we believe that empowering women with knowledge is one of the most important steps towards creating healthier communities.
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Our approach" title="Education, accessibility, and community support at the centre" description="Our approach is centred around education, accessibility, and community support." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {approaches.map((approach) => (
              <ApproachCard key={approach.title} icon={approach.icon} title={approach.title} description={approach.description} />
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Our impact" title="Every resource and conversation contributes to meaningful change" description="Through our initiatives, we continue to create opportunities for women to access knowledge, engage with health information, and become more confident in making decisions about their well-being." />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {impactStats.map((stat) => (
              <ImpactCounter key={stat.title} value={stat.value} label={stat.title} />
            ))}
          </div>
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Meet the team" title="The people behind DAHI" description="DAHI is powered by a dedicated team of individuals passionate about improving women’s health through education and community engagement." />
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Our team works together across different areas including programme coordination, digital systems, content development, outreach, and community support. Together, we are committed to building meaningful health education experiences that serve women and communities.
          </p>
          {teamLoading ? (
            <div className="mt-8 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Loading team members...</div>
          ) : teamError ? (
            <div className="mt-8 rounded-[1.25rem] border border-rose-200 bg-rose-50 p-8 text-center text-rose-600">Unable to load team members right now.</div>
          ) : teamMembers.length === 0 ? (
            <div className="mt-8 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Team profiles will appear here once content is published.</div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {teamMembers.map((member) => {
                const isFounder = (member.role || '').toLowerCase().includes('founder');
                return (
                  <TeamCard
                    key={member.id || member.full_name || member.name}
                    name={member.full_name || member.name}
                    role={member.role}
                    initials={(member.full_name || member.name || 'DA').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                    profileImage={member.profile_image || member.photo_url}
                    description={isFounder ? undefined : member.bio || member.description}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="soft-card p-8 sm:p-10">
          <SectionHeading eyebrow="Why choose DAHI" title="A trusted partner for practical health education" description="We create supportive spaces where women can learn, ask questions, and feel empowered to act on what matters for their wellbeing." />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {whyChoose.map((item) => (
              <div key={item.title} className="rounded-[1.25rem] border border-slate-200 p-6 transition hover:border-dahiPrimary/40 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-xl text-dahiPrimary">
                  <i className={item.icon}></i>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <CTASection eyebrow="Join the movement" title="Be Part of the Movement" description={
          <>
            <p>Improving women’s health requires collective effort. Whether you are seeking reliable health information, interested in volunteering, looking to collaborate, or supporting our mission, there is a place for you at DAHI.</p>
            <p className="mt-4">Together, we can create communities where women are informed, empowered, and confident in making decisions about their health.</p>
          </>
        } actions={[
          <Link key="resources" to="/resources" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dahiPrimary transition hover:-translate-y-0.5">Join the Community</Link>,
          <Link key="volunteer" to="/volunteer" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Volunteer</Link>,
          <Link key="donate" to="/donate" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Support DAHI</Link>,
          <Link key="contact" to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Contact Us</Link>,
        ]} />
      </section>
    </>
  );
}

export default AboutPage;
