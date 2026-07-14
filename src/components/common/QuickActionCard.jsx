import { Link } from 'react-router-dom';

function QuickActionCard({ title, description, href, to }) {
  const content = (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-slate-600">{description}</p>
      <div className="mt-5 text-sm font-semibold text-dahiPrimary">Learn more →</div>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return (
    <a href={href} target="_blank" rel="noopener" className="block">
      {content}
    </a>
  );
}

export default QuickActionCard;
