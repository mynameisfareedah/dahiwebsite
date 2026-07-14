import { useSupabaseData } from '../../hooks/useSupabaseData';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

function SupabaseContent({ table, render, select = '*', emptyMessage = 'No content available yet.' }) {
  const { data, isLoading, error, refetch } = useSupabaseData(table, select);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message || 'Unable to load content right now.'} onRetry={() => refetch()} />;
  if (!data?.length) return <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">{emptyMessage}</div>;

  return <>{render(data)}</>;
}

export default SupabaseContent;
