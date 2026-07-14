function ErrorState({ message = 'We could not load this content right now.', onRetry }) {
  return (
    <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
      <p className="font-semibold">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700">
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
