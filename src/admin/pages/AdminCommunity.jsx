import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Mail, RefreshCw, Users } from 'lucide-react';
import {
  PageHeader,
  ConfirmDeleteModal,
  SearchBar,
  Pagination,
  LoadingSpinner,
} from '../components';
import {
  usePagination,
  useSearch,
  useSorting,
  useToast,
} from '../hooks/useDataManagement';
import { communityMemberService } from '../services/communityMemberService';
import { newsletterSubscriberService } from '../services/newsletterSubscriberService';

const SUBSCRIBER_PAGE_SIZE = 25;
const COMMUNITY_TAB = 'community';
const NEWSLETTER_TAB = 'newsletter';

function SummaryCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p aria-label={`${label} value`} className="mt-2 text-2xl font-bold text-white">{value}</p>
          {detail && <p className="mt-1 text-xs text-gray-500">{detail}</p>}
        </div>
        <span className="rounded-lg bg-rose-950/60 p-2 text-rose-300">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

function subscriberStatusLabel(status) {
  return {
    SUBSCRIBED: 'Confirmed',
    PENDING: 'Pending',
    UNSUBSCRIBED: 'Unsubscribed',
  }[status] || 'Unknown';
}

export default function AdminCommunity() {
  const [members, setMembers] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState(NEWSLETTER_TAB);
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberNextCursor, setSubscriberNextCursor] = useState(null);
  const [subscriberCursors, setSubscriberCursors] = useState([null]);
  const [subscriberPage, setSubscriberPage] = useState(0);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberStatus, setSubscriberStatus] = useState('');
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(true);
  const [subscriberError, setSubscriberError] = useState(null);
  const [hasLoadedSubscribers, setHasLoadedSubscribers] = useState(false);
  const tabRefs = React.useRef([]);

  const isMountedRef = React.useRef(true);
  const subscriberRequestRef = React.useRef(0);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadSubscribers = useCallback(async (cursor = null) => {
    const requestId = ++subscriberRequestRef.current;
    setIsLoadingSubscribers(true);
    setSubscriberError(null);
    try {
      const result = await newsletterSubscriberService.getSubscribers({
        limit: SUBSCRIBER_PAGE_SIZE,
        cursor,
      });
      if (!isMountedRef.current || requestId !== subscriberRequestRef.current) return;
      setSubscribers(result.contacts);
      setSubscriberNextCursor(result.nextCursor);
      setHasLoadedSubscribers(true);
    } catch (error) {
      if (!isMountedRef.current || requestId !== subscriberRequestRef.current) return;
      setSubscriberError(error.message || 'Newsletter subscribers could not be loaded.');
      setSubscribers([]);
      setSubscriberNextCursor(null);
    } finally {
      if (isMountedRef.current && requestId === subscriberRequestRef.current) {
        setIsLoadingSubscribers(false);
      }
    }
  }, []);

  useEffect(() => {
    async function loadInitialSubscribers() {
      await loadSubscribers();
    }

    loadInitialSubscribers();
  }, [loadSubscribers]);

  const loadMembers = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsFetching(true);
      setFetchError(null);
    }
    try {
      const result = await communityMemberService.getCommunityMembers();
      if (!isMountedRef.current) return;

      if (result.success) {
        setMembers(result.data || []);
        setFetchError(null);
      } else {
        setFetchError(result.error?.message || 'Failed to load community members');
        setMembers([]);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setFetchError(error.message || 'An error occurred while loading community members');
        setMembers([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsFetching(false);
      }
    }
  }, []);

  useEffect(() => {
    async function loadInitialMembers() {
      await loadMembers();
    }

    loadInitialMembers();
  }, [loadMembers]);

  const { addToast } = useToast();
  const { searchQuery, setSearchQuery, filtered: searchedMembers } = useSearch(
    members,
    ['name', 'email']
  );
  const { sorted: sortedMembers } = useSorting(searchedMembers);
  const { currentItems, currentPage, totalPages, goToPage } = usePagination(
    sortedMembers,
    10
  );

  const highEngagementCount = members.filter(
    (m) => m.engagement_score >= 50
  ).length;
  const activeMemberCount = members.filter((member) => member.status === 'active').length;
  const visibleSubscribers = subscribers.filter((subscriber) => {
    const search = subscriberSearch.trim().toLowerCase();
    const fields = subscriber.fields || {};
    const name = [fields.FirstName, fields.LastName].filter(Boolean).join(' ');
    const matchesSearch = !search || `${name} ${subscriber.email}`.toLowerCase().includes(search);
    const matchesStatus = !subscriberStatus || subscriber.status === subscriberStatus;
    return matchesSearch && matchesStatus;
  });
  const subscriberStatusCounts = {
    SUBSCRIBED: subscribers.filter((subscriber) => subscriber.status === 'SUBSCRIBED').length,
    PENDING: subscribers.filter((subscriber) => subscriber.status === 'PENDING').length,
    UNSUBSCRIBED: subscribers.filter((subscriber) => subscriber.status === 'UNSUBSCRIBED').length,
  };
  const subscriberCountsUnavailable = isLoadingSubscribers || !!subscriberError || !hasLoadedSubscribers;

  const selectTab = (tab) => {
    setActiveTab(tab);
    tabRefs.current[tab === NEWSLETTER_TAB ? 0 : 1]?.focus();
  };

  const handleTabKeyDown = (event) => {
    const tabs = [NEWSLETTER_TAB, COMMUNITY_TAB];
    const currentIndex = tabs.indexOf(activeTab);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    selectTab(tabs[nextIndex]);
  };

  const goToSubscriberPage = async (page) => {
    const cursor = subscriberCursors[page];
    if (typeof cursor !== 'string' && cursor !== null) return;
    setSubscriberPage(page);
    await loadSubscribers(cursor);
  };

  const goToNextSubscriberPage = async () => {
    if (!subscriberNextCursor) return;
    const nextPage = subscriberPage + 1;
    setSubscriberCursors((current) => [...current.slice(0, nextPage), subscriberNextCursor]);
    setSubscriberPage(nextPage);
    await loadSubscribers(subscriberNextCursor);
  };

  const handleDelete = (member) => {
    setDeleteConfirm({ id: member.id, name: member.name });
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const result = await communityMemberService.deleteCommunityMember(deleteConfirm.id);
      if (!isMountedRef.current) return;
      
      if (result.success) {
        setMembers(members.filter((m) => m.id !== deleteConfirm.id));
        addToast('Community member removed', 'success');
      } else {
        addToast(`Error removing member: ${result.error?.message || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      if (isMountedRef.current) {
        addToast(`Error removing member: ${err.message || 'Unknown error'}`, 'error');
      }
    } finally {
      if (isMountedRef.current) {
        setDeleteConfirm(null);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Community Management"
        subtitle="Manage newsletter subscribers and registered community members in one place."
      />

      <div
        role="tablist"
        aria-label="Community management sections"
        onKeyDown={handleTabKeyDown}
        className="grid grid-cols-2 gap-1 rounded-xl border border-gray-800 bg-gray-900 p-1"
      >
        {[
          { id: NEWSLETTER_TAB, label: 'Newsletter Subscribers', icon: Mail },
          { id: COMMUNITY_TAB, label: 'Community Members', icon: Users },
        ].map(({ id, label, icon: Icon }, index) => (
          <button
            key={id}
            ref={(element) => { tabRefs.current[index] = element; }}
            id={`${id}-tab`}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`${id}-panel`}
            tabIndex={activeTab === id ? 0 : -1}
            onClick={() => setActiveTab(id)}
            className={`inline-flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-center text-xs font-semibold leading-tight transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dahiPrimary sm:min-h-11 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm sm:whitespace-nowrap ${
              activeTab === id
                ? 'bg-dahiPrimary text-white shadow'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <section
        id="newsletter-panel"
        role="tabpanel"
        aria-labelledby="newsletter-tab"
        hidden={activeTab !== NEWSLETTER_TAB}
        className="space-y-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Newsletter Subscribers</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-700">
              EmailOctopus is the source of truth. Counts, search, and status filters apply to the current provider page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadSubscribers(subscriberCursors[subscriberPage])}
            disabled={isLoadingSubscribers}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${isLoadingSubscribers ? 'animate-spin' : ''}`} />
            {isLoadingSubscribers ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Contacts on this page"
            value={subscriberCountsUnavailable ? '—' : subscribers.length}
            detail={`Provider page ${subscriberPage + 1}`}
            icon={Mail}
          />
          <SummaryCard
            label="Confirmed"
            value={subscriberCountsUnavailable ? '—' : subscriberStatusCounts.SUBSCRIBED}
            detail="On this provider page"
            icon={Users}
          />
          <SummaryCard
            label="Pending"
            value={subscriberCountsUnavailable ? '—' : subscriberStatusCounts.PENDING}
            detail="On this provider page"
            icon={Users}
          />
          <SummaryCard
            label="Unsubscribed"
            value={subscriberCountsUnavailable ? '—' : subscriberStatusCounts.UNSUBSCRIBED}
            detail="On this provider page"
            icon={Users}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm font-medium text-gray-300">
            Search this page
            <input
              type="search"
              value={subscriberSearch}
              onChange={(event) => setSubscriberSearch(event.target.value)}
              placeholder="Search name or email"
              className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-white placeholder:text-gray-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </label>
          <label className="text-sm font-medium text-gray-300 sm:w-52">
            Subscription status
            <select
              value={subscriberStatus}
              onChange={(event) => setSubscriberStatus(event.target.value)}
              className="mt-1.5 block min-h-11 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="">All statuses</option>
              <option value="SUBSCRIBED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="UNSUBSCRIBED">Unsubscribed</option>
            </select>
          </label>
          <p className={`text-sm sm:pb-2 ${subscriberCountsUnavailable ? 'text-gray-300' : 'text-gray-700'}`}>
            {isLoadingSubscribers
              ? 'Loading contacts…'
              : subscriberError || !hasLoadedSubscribers
                ? 'Unavailable'
                : `${visibleSubscribers.length} shown`}
          </p>
        </div>

        {isLoadingSubscribers ? (
          <LoadingSpinner text="Loading newsletter subscribers..." />
        ) : subscriberError ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
            <p>{subscriberError}</p>
            <button
              type="button"
              onClick={() => loadSubscribers(subscriberCursors[subscriberPage])}
              className="mt-3 rounded-lg bg-dahiPrimary px-3 py-2 text-sm font-semibold text-white hover:brightness-90"
            >
              Retry
            </button>
          </div>
        ) : visibleSubscribers.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-dahiPrimary">
              <Mail aria-hidden="true" className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {subscribers.length === 0 ? 'No subscribers on this page' : 'No subscribers match'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-700">
              {subscribers.length === 0
                ? 'No contacts were returned for this EmailOctopus page.'
                : 'Try a different name, email, or status.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {visibleSubscribers.map((subscriber) => {
                const fields = subscriber.fields || {};
                const name = [fields.FirstName, fields.LastName].filter(Boolean).join(' ');
                const preferences = [
                  ...(Array.isArray(fields.UpdateCategories)
                    ? fields.UpdateCategories
                    : [fields.UpdateCategories].filter(Boolean)),
                  ...(Array.isArray(fields.HealthInterests)
                    ? fields.HealthInterests
                    : [fields.HealthInterests].filter(Boolean)),
                ];
                const statusLabel = subscriberStatusLabel(subscriber.status);
                return (
                  <article
                    key={subscriber.id || subscriber.email}
                    className="rounded-xl border border-gray-800 bg-gray-900 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-white">{name || 'Name not provided'}</h3>
                        <p className="mt-1 break-all text-sm text-gray-400">{subscriber.email || '—'}</p>
                      </div>
                      <span
                        aria-label={`Status: ${statusLabel}`}
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          subscriber.status === 'SUBSCRIBED' ? 'bg-green-950 text-green-300' :
                            subscriber.status === 'PENDING' ? 'bg-amber-950 text-amber-300' :
                              subscriber.status === 'UNSUBSCRIBED' ? 'bg-gray-800 text-gray-300' :
                                'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">Added {formatDate(subscriber.createdAt)}</p>
                    <details className="mt-3 border-t border-gray-800 pt-3 text-sm text-gray-300">
                      <summary className="cursor-pointer font-medium text-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-400">
                        Preferences {preferences.length > 0 ? `(${preferences.length})` : ''}
                      </summary>
                      <p className="mt-2">{preferences.length ? preferences.join(', ') : 'No preferences provided.'}</p>
                    </details>
                  </article>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-gray-800 bg-gray-900 md:block">
              <table className="w-full text-left">
                <thead className="border-b border-gray-700 bg-gray-800">
                  <tr>
                    {['Subscriber', 'Status', 'Added', 'Preferences'].map((heading) => (
                      <th key={heading} scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-300">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {visibleSubscribers.map((subscriber) => {
                    const fields = subscriber.fields || {};
                    const name = [fields.FirstName, fields.LastName].filter(Boolean).join(' ');
                    const preferences = [
                      ...(Array.isArray(fields.UpdateCategories)
                        ? fields.UpdateCategories
                        : [fields.UpdateCategories].filter(Boolean)),
                      ...(Array.isArray(fields.HealthInterests)
                        ? fields.HealthInterests
                        : [fields.HealthInterests].filter(Boolean)),
                    ];
                    const statusLabel = subscriberStatusLabel(subscriber.status);
                    return (
                      <tr key={subscriber.id || subscriber.email} className="transition hover:bg-gray-800/60">
                        <td className="px-5 py-4">
                          <p className="font-medium text-white">{name || 'Name not provided'}</p>
                          <p className="mt-1 text-sm text-gray-400">{subscriber.email || '—'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            aria-label={`Status: ${statusLabel}`}
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              subscriber.status === 'SUBSCRIBED' ? 'bg-green-950 text-green-300' :
                                subscriber.status === 'PENDING' ? 'bg-amber-950 text-amber-300' :
                                  subscriber.status === 'UNSUBSCRIBED' ? 'bg-gray-800 text-gray-300' :
                                    'bg-gray-800 text-gray-400'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-300">{formatDate(subscriber.createdAt)}</td>
                        <td className="px-5 py-4 text-sm text-gray-300">
                          <details className="max-w-xs">
                            <summary className="cursor-pointer font-medium text-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-400">
                              {preferences.length ? `View preferences (${preferences.length})` : 'No preferences'}
                            </summary>
                            {preferences.length > 0 && <p className="mt-2">{preferences.join(', ')}</p>}
                          </details>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!isLoadingSubscribers && !subscriberError && (subscriberPage > 0 || subscriberNextCursor) && (
          <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
            <span className="text-sm text-gray-400">Provider page {subscriberPage + 1}</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={subscriberPage === 0}
                onClick={() => goToSubscriberPage(subscriberPage - 1)}
                className="min-h-10 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!subscriberNextCursor}
                onClick={goToNextSubscriberPage}
                className="min-h-10 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      <section
        id="community-panel"
        role="tabpanel"
        aria-labelledby="community-tab"
        hidden={activeTab !== COMMUNITY_TAB}
        className="space-y-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Community Members</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-700">
              Supabase is the source of truth for registered community members, separate from newsletter contacts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadMembers(true)}
            disabled={isFetching}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard label="Total members" value={isFetching ? '—' : members.length} detail="Supabase records" icon={Users} />
          <SummaryCard label="Active members" value={isFetching ? '—' : activeMemberCount} detail="Current records" icon={Heart} />
          <SummaryCard label="High engagement" value={isFetching ? '—' : highEngagementCount} detail="Engagement score 50+" icon={Heart} />
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <SearchBar
            placeholder="Search community members..."
            value={searchQuery}
            onSearch={setSearchQuery}
          />
        </div>

        {isFetching ? (
          <LoadingSpinner text="Loading community members..." />
        ) : fetchError ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
            <p>{fetchError}</p>
            <button
              type="button"
              onClick={() => loadMembers(true)}
              className="mt-3 rounded-lg bg-dahiPrimary px-3 py-2 text-sm font-semibold text-white hover:brightness-90"
            >
              Retry
            </button>
          </div>
        ) : currentItems.length === 0 && searchQuery === '' ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-dahiPrimary">
              <Heart aria-hidden="true" className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Your community is ready to grow</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-700">
              There are no community member records yet. This list is managed separately from newsletter subscriptions.
            </p>
            <button
              type="button"
              onClick={() => loadMembers(true)}
              className="mt-5 rounded-lg border border-dahiPrimary px-4 py-2 text-sm font-semibold text-dahiPrimary transition hover:bg-purple-50"
            >
              Refresh member list
            </button>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-dahiPrimary">
              <Heart aria-hidden="true" className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No members found</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-700">
              Try adjusting your search to find a community member.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700 bg-gray-800">
                  <tr>
                    {['Name', 'Email', 'Engagement Score', 'Location', 'Status', 'Joined', 'Actions'].map((heading) => (
                      <th key={heading} scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-300">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentItems.map((member) => (
                    <tr key={member.id} className="transition hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{member.name}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{member.email}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-900 px-3 py-1 text-sm text-blue-100">
                          {member.engagement_score || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {member.city && member.country
                          ? `${member.city}, ${member.country}`
                          : member.city || member.country || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-sm capitalize ${
                          member.status === 'active' ? 'bg-green-900 text-green-100' :
                            member.status === 'inactive' ? 'bg-yellow-900 text-yellow-100' :
                              'bg-red-900 text-red-100'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-300">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          type="button"
                          onClick={() => handleDelete(member)}
                          className="rounded-lg bg-red-600 px-3 py-2 text-white transition hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              itemsPerPage={10}
              totalItems={sortedMembers.length}
            />
          </div>
        )}

        <ConfirmDeleteModal
          isOpen={!!deleteConfirm}
          title="Remove Community Member"
          message={`Are you sure you want to remove "${deleteConfirm?.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
}
