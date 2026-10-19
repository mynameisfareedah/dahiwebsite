import { useEffect, useState } from 'react';
import { ArrowUp, Share2 } from 'lucide-react';

const CIRCLE_RADIUS = 20;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

function ShareProgressControls({ hidden = false }) {
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let animationFrame = 0;

    const updateProgress = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const nextProgress = scrollableHeight > 0
          ? Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100))
          : 0;
        setProgress(Math.round(nextProgress));
      });
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  useEffect(() => {
    if (!feedback) return undefined;

    const timeout = window.setTimeout(() => setFeedback(''), 2400);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const copyPageUrl = async () => {
    const pageUrl = window.location.href;

    if (window.navigator.clipboard?.writeText) {
      try {
        await window.navigator.clipboard.writeText(pageUrl);
        return;
      } catch {
        // Continue with the legacy clipboard path when clipboard permissions deny the API.
      }
    }

    const temporaryInput = document.createElement('textarea');
    temporaryInput.value = pageUrl;
    temporaryInput.setAttribute('readonly', '');
    temporaryInput.style.position = 'fixed';
    temporaryInput.style.opacity = '0';
    document.body.appendChild(temporaryInput);
    temporaryInput.select();
    const copied = document.execCommand('copy');
    temporaryInput.remove();

    if (!copied) {
      throw new Error('The browser could not copy the page URL.');
    }
  };

  const handleShare = async () => {
    setFeedback('');

    if (typeof window.navigator.share === 'function') {
      try {
        await window.navigator.share({
          title: document.title,
          url: window.location.href,
        });
        setFeedback('Page shared.');
        return;
      } catch (error) {
        if (error && typeof error === 'object' && error.name === 'AbortError') {
          setFeedback('Share cancelled.');
          return;
        }
      }
    }

    try {
      await copyPageUrl();
      setFeedback('Page link copied.');
    } catch {
      setFeedback('Could not copy the link. Copy the page URL from your browser.');
    }
  };

  const handleBackToTop = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="share-progress-controls" hidden={hidden}>
      <button
        type="button"
        className="share-progress-controls__button"
        onClick={handleShare}
        aria-label="Share this page"
        title="Share this page"
      >
        <Share2 size={19} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="share-progress-controls__button share-progress-controls__progress"
        onClick={handleBackToTop}
        aria-label={`Back to top. Page ${progress}% scrolled`}
        title="Back to top"
      >
        <svg className="share-progress-controls__ring" viewBox="0 0 48 48" aria-hidden="true">
          <circle className="share-progress-controls__ring-track" cx="24" cy="24" r={CIRCLE_RADIUS} />
          <circle
            className="share-progress-controls__ring-value"
            cx="24"
            cy="24"
            r={CIRCLE_RADIUS}
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={CIRCLE_CIRCUMFERENCE * (1 - progress / 100)}
          />
        </svg>
        <ArrowUp size={18} aria-hidden="true" />
      </button>
      <span className="share-progress-controls__feedback" role="status" aria-live="polite">
        {feedback}
      </span>
    </div>
  );
}

export default ShareProgressControls;
