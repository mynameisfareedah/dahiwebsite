function EventPoster({ image, alt, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-[1.25rem] border border-dahiPrimary/20 bg-slate-50 p-2 shadow-sm ${className}`}>
      <img
        src={image}
        alt={alt}
        loading="lazy"
        className="h-56 w-full rounded-[1rem] object-contain bg-white sm:h-72 md:h-80"
      />
    </div>
  );
}

export default EventPoster;
