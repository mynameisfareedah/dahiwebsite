import { Link } from 'react-router-dom';

function EventCTAButton({ href, onClick, children, variant = 'primary' }) {
  const baseClasses = 'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5';
  const variantClasses = variant === 'secondary'
    ? 'border border-dahiPrimary bg-white text-dahiPrimary hover:bg-dahiPrimary/5'
    : 'bg-dahiPrimary text-white hover:bg-dahiSecondary';

  if (href) {
    return (
      <Link to={href} onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
      {children}
    </button>
  );
}

export default EventCTAButton;
