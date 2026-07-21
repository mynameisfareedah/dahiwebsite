function CTASection({ eyebrow, title, description, actions, theme = 'default' }) {
  const themeClasses = theme === 'dark'
    ? 'text-white'
    : 'text-white';

  const themeStyle = theme === 'dark'
    ? { backgroundColor: '#0f172a' }
    : { backgroundImage: 'linear-gradient(90deg, var(--dahi-primary), var(--dahi-secondary))', backgroundColor: 'var(--dahi-primary)' };

  return (
    <section className="section-shell max-w-7xl">
      <div className={`soft-card overflow-hidden p-8 sm:p-10 lg:p-12 ${themeClasses}`} style={themeStyle}>
        <div className="max-w-3xl">
          <span className={`eyebrow ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-white/15 text-white'}`}>{eyebrow}</span>
          <h2 className="mt-4 text-3xl font-black">{title}</h2>
          <div className={`mt-4 text-lg leading-8 ${theme === 'dark' ? 'text-slate-300' : 'text-white/90'}`}>{description}</div>
        </div>
        {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>}
      </div>
    </section>
  );
}

export default CTASection;
