import React, { useState } from 'react';
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

const mockCommunity = [
  {
    id: 1,
    name: 'Amina Hassan',
    email: 'amina@email.com',
    engagement: 'high',
    posts: 24,
    joinDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Layla Mahmoud',
    email: 'layla@email.com',
    engagement: 'medium',
    posts: 12,
    joinDate: '2024-02-20',
  },
  {
    id: 3,
    name: 'Sara El-Din',
    email: 'sara@email.com',
    engagement: 'high',
    posts: 35,
    joinDate: '2023-12-10',
  },
  {
    id: 4,
    name: 'Nadia Hassan',
    email: 'nadia@email.com',
    engagement: 'low',
    posts: 3,
    joinDate: '2024-06-01',
  },
];

export default function AdminCommunity() {
  const [members, setMembers] = useState(mockCommunity);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    (m) => m.engagement === 'high'
  ).length;
  const totalPosts = members.reduce((sum, m) => sum + m.posts, 0);

  const handleDelete = (member) => {
    setDeleteConfirm({ id: member.id, name: member.name });
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setMembers(members.filter((m) => m.id !== deleteConfirm.id));
    addToast('Community member removed', 'success');
    setDeleteConfirm(null);
    setIsLoading(false);
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
          <p className="text-2xl font-bold text-white mt-2">{totalPosts}</p>
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
                      Engagement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Posts
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
                        <span
                          className={`px-3 py-1 rounded-full text-sm capitalize ${engagementColor(
                            member.engagement
                          )}`}
                        >
                          {member.engagement}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <TrendingUp size={16} />
                          {member.posts}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(member.joinDate).toLocaleDateString()}
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
