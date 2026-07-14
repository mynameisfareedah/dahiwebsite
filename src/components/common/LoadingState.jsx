function LoadingState({ message = 'Loading content...' }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-dahiPrimary border-t-transparent" />
      <p className="mt-4">{message}</p>
    </div>
  );
}

export default LoadingState;
