import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import {
  PageHeader,
  SearchBar,
  Pagination,
  EmptyState,
  Modal,
} from '../components';
import {
  usePagination,
  useSearch,
  useSorting,
  useToast,
} from '../hooks/useDataManagement';

const mockMessages = [
  {
    id: 1,
    sender: 'Amina Hassan',
    subject: 'Program inquiry',
    preview: 'I am interested in learning more about...',
    date: '2026-07-25',
    isRead: false,
    category: 'inquiry',
    fullMessage: 'I am interested in learning more about the women health programs offered by DAHI.',
  },
  {
    id: 2,
    sender: 'Layla Mahmoud',
    subject: 'Volunteer opportunity',
    preview: 'I would like to volunteer for...',
    date: '2026-07-24',
    isRead: true,
    category: 'volunteer',
    fullMessage: 'I would like to volunteer for the community outreach programs.',
  },
  {
    id: 3,
    sender: 'Contact Form Submission',
    subject: 'Support request',
    preview: 'I need help with...',
    date: '2026-07-23',
    isRead: true,
    category: 'support',
    fullMessage: 'I need help with accessing some of your health resources.',
  },
  {
    id: 4,
    sender: 'Sara El-Din',
    subject: 'Event feedback',
    preview: 'Great event yesterday!...',
    date: '2026-07-22',
    isRead: false,
    category: 'feedback',
    fullMessage: 'Great event yesterday! I learned a lot and would love to attend more.',
  },
];

export default function AdminMessages() {
  const [messages, setMessages] = useState(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const { addToast } = useToast();

  const { searchQuery, setSearchQuery, filtered: searchedMessages } = useSearch(
    messages,
    ['sender', 'subject', 'category']
  );
  const { sorted: sortedMessages } = useSorting(searchedMessages);
  const { currentItems, currentPage, totalPages, goToPage } = usePagination(
    sortedMessages,
    10
  );

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const handleMarkAsRead = (messageId) => {
    setMessages(
      messages.map((m) =>
        m.id === messageId ? { ...m, isRead: true } : m
      )
    );
    addToast('Message marked as read', 'success');
  };

  const handleDelete = (messageId) => {
    setMessages(messages.filter((m) => m.id !== messageId));
    setShowDetail(false);
    addToast('Message deleted', 'success');
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      handleMarkAsRead(message.id);
    }
    setShowDetail(true);
  };

  const categoryColor = (category) => {
    switch (category) {
      case 'inquiry':
        return 'bg-blue-900 text-blue-100';
      case 'volunteer':
        return 'bg-green-900 text-green-100';
      case 'support':
        return 'bg-yellow-900 text-yellow-100';
      case 'feedback':
        return 'bg-purple-900 text-purple-100';
      default:
        return 'bg-gray-700 text-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <PageHeader
            title="Messages"
            subtitle="Manage inquiries and communications"
          />
        </div>
        {unreadCount > 0 && (
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium">
            {unreadCount} unread
          </div>
        )}
      </div>

      <SearchBar
        placeholder="Search messages by sender, subject..."
        value={searchQuery}
        onSearch={setSearchQuery}
      />

      {currentItems.length === 0 && searchQuery === '' ? (
        <EmptyState
          icon={MessageSquare}
          title="No messages yet"
          description="Messages from your community will appear here"
        />
      ) : currentItems.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No messages found"
          description="Try adjusting your search query"
        />
      ) : (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-700">
              {currentItems.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 cursor-pointer hover:bg-gray-800 transition ${
                    !message.isRead ? 'bg-gray-800 border-l-4 border-blue-600' : ''
                  }`}
                  onClick={() => handleViewMessage(message)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {message.sender}
                      </p>
                      <p className="text-gray-400 text-sm truncate">
                        {message.subject}
                      </p>
                    </div>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${categoryColor(
                        message.category
                      )}`}
                    >
                      {message.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm truncate mb-2">
                    {message.preview}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(message.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              itemsPerPage={10}
              totalItems={sortedMessages.length}
            />
          </div>
        </>
      )}

      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={selectedMessage?.subject || 'Message'}
        size="lg"
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded p-4">
              <p className="text-sm text-gray-400">From:</p>
              <p className="text-white font-medium">{selectedMessage.sender}</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded p-4">
              <p className="text-sm text-gray-400 mb-2">Category:</p>
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${categoryColor(
                  selectedMessage.category
                )}`}
              >
                {selectedMessage.category}
              </span>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded p-4">
              <p className="text-sm text-gray-400 mb-2">Message:</p>
              <p className="text-gray-200">{selectedMessage.fullMessage}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(selectedMessage.id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDetail(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
