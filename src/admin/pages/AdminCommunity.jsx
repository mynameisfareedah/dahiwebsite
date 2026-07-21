import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp } from 'lucide-react';
import {
  PageHeader,
  ConfirmDeleteModal,
  EmptyState,
  SearchBar,
  Pagination,
} from '../components';
import {
  usePagination,
  useSearch,
  useSorting,
  useToast,
} from '../hooks/useDataManagement';
import { communityMemberService } from '../services/communityMemberService';

export default function AdminCommunity() {
  const [members, setMembers] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const isMountedRef = React.useRef(true);
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  const engagementColor = (level) => {
    switch (level) {
      case 'high':
        return 'bg-green-900 text-green-100';
      case 'medium':
        return 'bg-yellow-900 text-yellow-100';
      case 'low':
        return 'bg-gray-700 text-gray-100';
      default:
        return 'bg-gray-700 text-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Community Management"
        subtitle="Manage community members and engagement"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Members</p>
          <p className="text-2xl font-bold text-white mt-2">{members.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Active Members</p>
          <p className="text-2xl font-bold text-white mt-2">{members.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">High Engagement</p>
          <p className="text-2xl font-bold text-white mt-2">
            {highEngagementCount}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Posts</p>
          <p className="text-2xl font-bold text-white mt-2">-</p>
        </div>
      </div>

      <SearchBar
        placeholder="Search community members..."
        value={searchQuery}
        onSearch={setSearchQuery}
      />

      {currentItems.length === 0 && searchQuery === '' ? (
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
    </div>
  );
}
