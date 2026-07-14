import { Link } from 'react-router-dom';

function CTAButton({ children, href, onClick, variant = 'primary', className = '' }) {
  const baseClasses = 'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5';
  const variants = {
    primary: 'bg-dahiPrimary text-white hover:bg-dahiSecondary',
    secondary: 'border border-dahiPrimary bg-white text-dahiPrimary hover:bg-dahiPrimary/5',
    accent: 'border border-dahiAccent bg-white text-dahiAccent hover:bg-dahiAccent/10',
  };

  if (href) {
    return (
      <Link to={href} onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export default CTAButton;
