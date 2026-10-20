import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export const outreachPhotos = [
  {
    source: '/OUTREACH/Community Audience & Participants.jfif',
    src: '/OUTREACH/gallery/community-audience-participants.webp',
    width: 1195,
    height: 896,
    alt: 'Women gathered during DAHI’s first community health outreach in Gwagwalada',
    caption: 'Community members gathered during the outreach',
  },
  {
    source: '/OUTREACH/Cross-Section of Participants.jfif',
    src: '/OUTREACH/gallery/cross-section-of-participants.webp',
    width: 1195,
    height: 896,
    alt: 'A cross-section of community participants at the outreach event',
    caption: 'Community participants at the outreach',
  },
  {
    source: '/OUTREACH/Community Members in Attendance.jfif',
    src: '/OUTREACH/gallery/community-members-in-attendance.webp',
    width: 896,
    height: 1195,
    alt: 'Community members attending DAHI’s women’s health outreach',
    caption: 'Community members in attendance',
  },
  {
    source: '/OUTREACH/Outreach Participants.jfif',
    src: '/OUTREACH/gallery/outreach-participants.webp',
    width: 896,
    height: 1195,
    alt: 'Participants at DAHI’s first community outreach',
    caption: 'Outreach Participants',
  },
  {
    source: '/OUTREACH/Health Education Session.jfif',
    src: '/OUTREACH/gallery/outreach-health-education.webp',
    width: 896,
    height: 1195,
    alt: 'Health education session during DAHI’s first community outreach',
    caption: 'Community Health Education',
  },
  {
    source: '/OUTREACH/Interactive Awareness Presentation.jfif',
    src: '/OUTREACH/gallery/outreach-health-awareness.webp',
    width: 896,
    height: 1195,
    alt: 'Interactive awareness presentation during the women’s health outreach',
    caption: 'Interactive Health Awareness',
  },
  {
    source: '/OUTREACH/Guest Facilitator Address.jfif',
    src: '/OUTREACH/gallery/guest-facilitator-address.webp',
    width: 896,
    height: 1195,
    alt: 'Guest facilitator addressing participants at the outreach',
    caption: 'Guest Facilitator Address',
  },
  {
    source: '/OUTREACH/Blood Pressure Screening.jfif',
    src: '/OUTREACH/gallery/outreach-health-screening.webp',
    width: 896,
    height: 1195,
    alt: 'Blood pressure screening during DAHI’s community health outreach',
    caption: 'Health Screening',
  },
  {
    source: '/OUTREACH/Vital Signs Screening.jfif',
    src: '/OUTREACH/gallery/vital-signs-screening.webp',
    width: 896,
    height: 1195,
    alt: 'Vital signs screening during the women’s health outreach',
    caption: 'Vital Signs Screening',
  },
  {
    source: '/OUTREACH/Interactive Counseling Session.jfif',
    src: '/OUTREACH/gallery/interactive-counseling-session.webp',
    width: 1195,
    height: 896,
    alt: 'Health counseling session during DAHI’s community outreach',
    caption: 'Interactive Health Counseling',
  },
  {
    source: '/OUTREACH/Community Outreach Team.jfif',
    src: '/OUTREACH/gallery/outreach-team-volunteers.webp',
    width: 896,
    height: 1195,
    alt: 'DAHI community outreach team members at the Gwagwalada event',
    caption: 'DAHI Outreach Team',
  },
  {
    source: '/OUTREACH/Dr. Adi alongside Dedicated Community Volunteers.jfif',
    src: '/OUTREACH/gallery/dr-adi-community-volunteers.webp',
    width: 1195,
    height: 896,
    alt: 'Dr. Adi alongside community health volunteers',
    caption: 'Dr. Adi with Community Volunteers',
  },
  {
    source: '/OUTREACH/Doc Adi and Health Screening Volunteers.jfif',
    src: '/OUTREACH/gallery/health-screening-volunteers.webp',
    width: 896,
    height: 1195,
    alt: 'Doc Adi and health screening volunteers supporting participants',
    caption: 'Health Screening Volunteers',
  },
  {
    source: "/OUTREACH/Community Care DAHI's Women's Health Program.jfif",
    src: '/OUTREACH/gallery/dahi-womens-health-program.webp',
    width: 1195,
    height: 896,
    alt: 'DAHI team supporting the community women’s health program',
    caption: 'DAHI Women’s Health Program',
  },
  {
    source: '/OUTREACH/Doc Adi and Event Coordinators.jfif',
    src: '/OUTREACH/gallery/event-coordinators.webp',
    width: 1195,
    height: 896,
    alt: 'Doc Adi with event coordinators during the outreach',
    caption: 'Doc Adi with Event Coordinators',
  },
  {
    source: '/OUTREACH/Outreach Items.png',
    src: '/OUTREACH/gallery/outreach-educational-materials.webp',
    width: 1122,
    height: 1402,
    alt: 'Educational pamphlets and health supplies prepared for outreach',
    caption: 'Outreach Educational Materials',
  },
  {
    source: '/OUTREACH/Floral Thank You Bag.png',
    src: '/OUTREACH/gallery/prepared-outreach-care-packages.webp',
    width: 941,
    height: 1672,
    alt: 'Packaged outreach items in a white floral thank-you bag',
    caption: 'Prepared Outreach Care Packages',
  },
];

function OutreachPhotoLoop() {
  const [unavailableSources, setUnavailableSources] = useState(() => new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const closeButtonRef = useRef(null);
  const triggerRef = useRef(null);
  const availablePhotos = outreachPhotos.filter((image) => !unavailableSources.has(image.src));
  const currentIndex = availablePhotos.length ? activeIndex % availablePhotos.length : 0;

  useEffect(() => {
    if (!selectedImage) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      } else if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    closeButtonRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [selectedImage]);

  const handleImageError = (source) => {
    setUnavailableSources((currentSources) => new Set(currentSources).add(source));
  };

  if (availablePhotos.length === 0) {
    return <p className="outreach-photo-loop-empty" role="status">Outreach photographs are temporarily unavailable.</p>;
  }

  const renderPhoto = (image, position) => {
    const isFeatured = position === 'featured';

    return (
      <button
        key={image.src}
        type="button"
        aria-label={`Open larger view: ${image.caption}`}
        aria-current={isFeatured ? 'true' : undefined}
        className={`outreach-photo-loop__card outreach-photo-loop__card--${position}`}
        onClick={(event) => {
          triggerRef.current = event.currentTarget;
          setSelectedImage(image);
        }}
      >
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          data-orientation={image.height > image.width ? 'portrait' : 'landscape'}
          loading="eager"
          decoding="async"
          onError={() => handleImageError(image.src)}
        />
        <span>{image.caption}</span>
      </button>
    );
  };

  const previousIndex = (currentIndex - 1 + availablePhotos.length) % availablePhotos.length;
  const nextIndex = (currentIndex + 1) % availablePhotos.length;
  const visiblePhotos = availablePhotos.length > 2
    ? [
        { image: availablePhotos[previousIndex], position: 'side-left' },
        { image: availablePhotos[currentIndex], position: 'featured' },
        { image: availablePhotos[nextIndex], position: 'side-right' },
      ]
    : availablePhotos.length === 2
      ? [
          { image: availablePhotos[currentIndex], position: 'featured' },
          { image: availablePhotos[nextIndex], position: 'side-right' },
        ]
      : [{ image: availablePhotos[currentIndex], position: 'featured' }];

  const moveToPhoto = (direction) => {
    setActiveIndex((index) => (index % availablePhotos.length + direction + availablePhotos.length) % availablePhotos.length);
  };

  return (
    <div className="outreach-photo-loop">
      <div className="outreach-photo-loop__toolbar">
        <div className="outreach-photo-loop__controls">
          <button type="button" className="outreach-photo-loop__nav-button" aria-label="Show previous outreach photograph" onClick={() => moveToPhoto(-1)}>
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <button type="button" className="outreach-photo-loop__nav-button" aria-label="Show next outreach photograph" onClick={() => moveToPhoto(1)}>
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        id="outreach-photo-loop"
        className="outreach-photo-loop__viewport"
        role="region"
        aria-label="DAHI community outreach photographs"
        tabIndex={0}
      >
        <div className="outreach-photo-loop__track">
          {visiblePhotos.map(({ image, position }) => renderPhoto(image, position))}
        </div>
      </div>

      {selectedImage && (
        <div
          className="outreach-photo-loop__backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="outreach-photo-dialog-title"
          onClick={() => setSelectedImage(null)}
        >
          <div className="outreach-photo-loop__dialog" onClick={(event) => event.stopPropagation()}>
            <button
              ref={closeButtonRef}
              type="button"
              className="outreach-photo-loop__close"
              aria-label="Close expanded outreach photograph"
              onClick={() => setSelectedImage(null)}
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
            <img src={selectedImage.src} alt={selectedImage.alt} width={selectedImage.width} height={selectedImage.height} />
            <p id="outreach-photo-dialog-title">{selectedImage.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default OutreachPhotoLoop;
