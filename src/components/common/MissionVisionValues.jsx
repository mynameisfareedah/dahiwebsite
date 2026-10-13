import { Link } from 'react-router-dom';
import SectionHeading from './SectionHeading';
import {
  coreValues,
  missionStatement,
  visionStatement,
} from '../../data/missionVisionValues';

function MissionVisionValues({ compact = false }) {
  if (compact) {
    return (
      <section className="soft-card p-6 sm:p-8" aria-label="Our mission and values">
        <SectionHeading
          eyebrow="Our shared purpose"
          title="Our Mission & Values"
          description="A concise summary of the purpose and values guiding DAHI’s work."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-[1.25rem] border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">Mission</h3>
            <p className="mt-2 leading-7 text-slate-600">{missionStatement.summary}</p>
          </article>
          <article className="rounded-[1.25rem] border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">Vision</h3>
            <p className="mt-2 leading-7 text-slate-600">{visionStatement.summary}</p>
          </article>
        </div>
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Core values">
          {coreValues.map((value) => (
            <span key={value.title} className="rounded-full bg-dahiPrimary/10 px-3 py-1.5 text-sm font-semibold text-dahiPrimary">
              {value.title}
            </span>
          ))}
        </div>
        <Link
          to="/about#mission-vision-values"
          className="mt-6 inline-flex items-center justify-center rounded-full border border-dahiPrimary px-5 py-2.5 text-sm font-semibold text-dahiPrimary transition hover:bg-dahiPrimary/5"
        >
          Explore Our Mission &amp; Values
        </Link>
      </section>
    );
  }

  return (
    <section id="mission-vision-values" tabIndex={-1} className="scroll-mt-24 soft-card p-8 sm:p-10">
      <SectionHeading
        eyebrow="Our shared purpose"
        title="Our Mission, Vision and Core Values"
        description="The commitments that guide DAHI’s health education and community work."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[1.25rem] border border-slate-200 p-6">
          <h3 className="text-xl font-semibold text-slate-900">{missionStatement.title}</h3>
          <div className="mt-4 space-y-4 text-base leading-8 text-slate-600">
            {missionStatement.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </article>
        <article className="rounded-[1.25rem] border border-slate-200 p-6">
          <h3 className="text-xl font-semibold text-slate-900">{visionStatement.title}</h3>
          <div className="mt-4 space-y-4 text-base leading-8 text-slate-600">
            {visionStatement.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </article>
      </div>
      <div className="mt-8">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">Our Core Values</h3>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {coreValues.map((value) => (
            <article key={value.title} className="soft-card p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dahiPrimary/10 text-xl text-dahiPrimary" aria-hidden="true">
                <i className={value.icon}></i>
              </div>
              <h4 className="mt-5 text-xl font-semibold text-slate-900">{value.title}</h4>
              <div className="mt-3 space-y-3 text-slate-600">
                {value.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MissionVisionValues;
