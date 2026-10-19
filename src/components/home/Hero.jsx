import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section id="hero" className="home-hero">
      <div className="home-hero-banner">
        <div aria-hidden="true" className="home-hero-overlay" />
        <div className="home-hero-content">
          <p className="home-hero-enter home-hero-enter--1 home-hero-eyebrow">Doc Adi Health Initiative (DAHI)</p>
          <h1 className="home-hero-enter home-hero-enter--2 home-hero-title">
            Trusted Health Education for <span className="home-hero-title__highlight">Muslim Women</span>
          </h1>
          <p className="home-hero-enter home-hero-enter--3 home-hero-description">
            Evidence-based health education, practical resources, and community outreach helping Muslim women and girls make informed decisions about their health and wellbeing.
          </p>
          <div className="home-hero-enter home-hero-enter--4 home-hero-actions">
            <Link to="/resources" className="home-hero-button home-hero-button--primary">Explore Resources <span aria-hidden="true">→</span></Link>
            <Link to="/about" className="home-hero-button home-hero-button--secondary">Learn About DAHI <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
