import { Link } from 'react-router-dom';

function NewsletterLink({ children, className, onClick, ...linkProps }) {
  return (
    <Link
      to="/#newsletter"
      className={className}
      onClick={onClick}
      {...linkProps}
    >
      {children}
    </Link>
  );
}

export default NewsletterLink;
