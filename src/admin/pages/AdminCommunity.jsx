import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import {
  PageHeader,
  ConfirmDeleteModal,
  EmptyState,
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
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberNextCursor, setSubscriberNextCursor] = useState(null);
  const [subscriberCursors, setSubscriberCursors] = useState([null]);
  const [subscriberPage, setSubscriberPage] = useState(0);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberStatus, setSubscriberStatus] = useState('');
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(true);
  const [subscriberError, setSubscriberError] = useState(null);

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

  // Load community members from Supabase
  useEffect(() => {
    const loadMembers = async () => {
      setIsFetching(true);
      setFetchError(null);
      try {
        const result = await communityMemberService.getCommunityMembers();
        if (!isMountedRef.current) return;
        
        if (result.success) {
          setMembers(result.data || []);
        } else {
          setFetchError(result.error?.message || 'Failed to load community members');
          setMembers([]);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setFetchError(err.message || 'An error occurred while loading community members');
          setMembers([]);
        }
      } finally {
        if (isMountedRef.current) {
          setIsFetching(false);
        }
      }
    };

    loadMembers();
  }, []);

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
    const name = [subscriber.fields.FirstName, subscriber.fields.LastName].filter(Boolean).join(' ');
    const matchesSearch = !search || `${name} ${subscriber.email}`.toLowerCase().includes(search);
    const matchesStatus = !subscriberStatus || subscriber.status === subscriberStatus;
    return matchesSearch && matchesStatus;
  });

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
        subtitle="View newsletter subscribers and manage registered community members"
      />

      <section aria-labelledby="newsletter-subscribers-heading" className="space-y-4">
        <div>
          <h2 id="newsletter-subscribers-heading" className="text-xl font-bold text-white">Newsletter Subscribers</h2>
          <p className="mt-1 text-sm text-gray-400">
            EmailOctopus is the source of truth. Search and status filters apply to the current provider page.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm text-gray-400">Subscribers on this page</p>
            <p className="mt-2 text-2xl font-bold text-white">{isLoadingSubscribers ? '—' : subscribers.length}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm text-gray-400">Displayed after filters</p>
            <p className="mt-2 text-2xl font-bold text-white">{isLoadingSubscribers ? '—' : visibleSubscribers.length}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex-1 text-sm text-gray-300">
            Search this page
            <input
              type="search"
              value={subscriberSearch}
              onChange={(event) => setSubscriberSearch(event.target.value)}
              placeholder="Search name or email"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-gray-300">
            Status
            <select
              value={subscriberStatus}
              onChange={(event) => setSubscriberStatus(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
            >
              <option value="">All statuses</option>
              <option value="SUBSCRIBED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="UNSUBSCRIBED">Unsubscribed</option>
            </select>
          </label>
        </div>
        {isLoadingSubscribers ? (
          <LoadingSpinner text="Loading newsletter subscribers..." />
        ) : subscriberError ? (
          <div role="alert" className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-200">
            <p>{subscriberError}</p>
            <button
              type="button"
              onClick={() => loadSubscribers(subscriberCursors[subscriberPage])}
              className="mt-3 rounded bg-red-800 px-3 py-2 text-sm font-semibold hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : visibleSubscribers.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={subscribers.length === 0 ? 'No newsletter subscribers on this page' : 'No subscribers match'}
            description={subscribers.length === 0 ? 'No contacts were returned for this EmailOctopus page.' : 'Try a different name, email, or status.'}
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-900">
            <table className="w-full">
              <thead className="border-b border-gray-700 bg-gray-800">
                <tr>
                  {['Name', 'Email', 'Status', 'Added', 'Preferences'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-300">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {visibleSubscribers.map((subscriber) => {
                  const name = [subscriber.fields.FirstName, subscriber.fields.LastName].filter(Boolean).join(' ');
                  const preferences = [
                    ...(Array.isArray(subscriber.fields.UpdateCategories)
                      ? subscriber.fields.UpdateCategories
                      : [subscriber.fields.UpdateCategories].filter(Boolean)),
                    ...(Array.isArray(subscriber.fields.HealthInterests)
                      ? subscriber.fields.HealthInterests
                      : [subscriber.fields.HealthInterests].filter(Boolean)),
                  ];
                  return (
                    <tr key={subscriber.id || subscriber.email}>
                      <td className="px-4 py-3 text-white">{name || '—'}</td>
                      <td className="px-4 py-3 text-gray-300">{subscriber.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-300">{subscriberStatusLabel(subscriber.status)}</td>
                      <td className="px-4 py-3 text-gray-300">{formatDate(subscriber.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-300">{preferences.length ? preferences.join(', ') : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!isLoadingSubscribers && !subscriberError && (subscriberPage > 0 || subscriberNextCursor) && (
          <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
            <span className="text-sm text-gray-400">Provider page {subscriberPage + 1}</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={subscriberPage === 0}
                onClick={() => goToSubscriberPage(subscriberPage - 1)}
                className="rounded bg-gray-800 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!subscriberNextCursor}
                onClick={goToNextSubscriberPage}
                className="rounded bg-gray-800 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="community-members-heading" className="space-y-4">
        <div>
          <h2 id="community-members-heading" className="text-xl font-bold text-white">Community Members</h2>
          <p className="mt-1 text-sm text-gray-400">
            Registered community member records, managed separately from newsletter subscriptions.
          </p>
        </div>
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Members</p>
          <p className="text-2xl font-bold text-white mt-2">{isFetching ? '—' : members.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Active Members</p>
          <p className="text-2xl font-bold text-white mt-2">{isFetching ? '—' : activeMemberCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">High Engagement</p>
          <p className="text-2xl font-bold text-white mt-2">
            {isFetching ? '—' : highEngagementCount}
          </p>
        </div>
      </div>

      <SearchBar
        placeholder="Search community members..."
        value={searchQuery}
        onSearch={setSearchQuery}
      />

      {isFetching ? (
        <LoadingSpinner text="Loading community members..." />
      ) : fetchError ? (
        <div role="alert" className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-200">{fetchError}</div>
      ) : currentItems.length === 0 && searchQuery === '' ? (
        <EmptyState
          icon={Heart}
          title="No community members"
          description="Members will appear here as they join"
        />
      ) : currentItems.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No members found"
          description="Try adjusting your search"
        />
      ) : (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Engagement Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentItems.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-800 transition"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{member.name}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{member.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm bg-blue-900 text-blue-100">
                          {member.engagement_score || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {member.city && member.country 
                          ? `${member.city}, ${member.country}` 
                          : member.city || member.country || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm capitalize ${
                          member.status === 'active' ? 'bg-green-900 text-green-100' :
                          member.status === 'inactive' ? 'bg-yellow-900 text-yellow-100' :
                          'bg-red-900 text-red-100'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDelete(member)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
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
        </>
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
