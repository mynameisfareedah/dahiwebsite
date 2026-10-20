import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminCommunity from '../AdminCommunity';
import { communityMemberService } from '../../services/communityMemberService';
import { newsletterSubscriberService } from '../../services/newsletterSubscriberService';

vi.mock('../../services/communityMemberService', () => ({
  communityMemberService: {
    getCommunityMembers: vi.fn(),
    deleteCommunityMember: vi.fn(),
  },
}));

vi.mock('../../services/newsletterSubscriberService', () => ({
  newsletterSubscriberService: { getSubscribers: vi.fn() },
}));

vi.mock('../../hooks/useDataManagement', async () => {
  const React = await import('react');
  return {
    useSearch(items, keys) {
      const [searchQuery, setSearchQuery] = React.useState('');
      const filtered = items.filter((item) => keys.some((key) => (
        String(item[key] || '').toLowerCase().includes(searchQuery.toLowerCase())
      )));
      return { searchQuery, setSearchQuery, filtered };
    },
    useSorting(items) {
      return { sorted: items };
    },
    usePagination(items, pageSize) {
      const [currentPage, setCurrentPage] = React.useState(1);
      return {
        currentItems: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        currentPage,
        totalPages: Math.ceil(items.length / pageSize),
        goToPage: setCurrentPage,
      };
    },
    useToast() {
      return { addToast: vi.fn() };
    },
  };
});

vi.mock('../../components', () => ({
  PageHeader: ({ title }) => <h1>{title}</h1>,
  ConfirmDeleteModal: () => null,
  EmptyState: ({ title, description }) => <div><strong>{title}</strong><p>{description}</p></div>,
  SearchBar: ({ value, onSearch, placeholder }) => (
    <input aria-label={placeholder} value={value} onChange={(event) => onSearch(event.target.value)} />
  ),
  Pagination: () => null,
  LoadingSpinner: ({ text }) => <p>{text}</p>,
}));

const testContacts = [
  {
    id: 'contact-1',
    email: 'confirmed@example.test',
    fields: { FirstName: 'Confirmed', LastName: 'Person', UpdateCategories: ['Webinars and events'] },
    status: 'SUBSCRIBED',
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 'contact-2',
    email: 'pending@example.test',
    fields: { FirstName: 'Pending', LastName: 'Person' },
    status: 'PENDING',
    createdAt: '2026-10-02T00:00:00Z',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  communityMemberService.getCommunityMembers.mockResolvedValue({
    success: true,
    data: [{
      id: 'member-1',
      name: 'Registered Member',
      email: 'member@example.test',
      engagement_score: 12,
      status: 'active',
      joined_at: '2026-09-01T00:00:00Z',
    }],
  });
  communityMemberService.deleteCommunityMember.mockResolvedValue({ success: true });
  newsletterSubscriberService.getSubscribers.mockResolvedValue({
    contacts: testContacts,
    nextCursor: null,
  });
});

describe('AdminCommunity newsletter subscriber integration', () => {
  it('shows provider subscribers separately from Supabase community members', async () => {
    render(<AdminCommunity />);

    expect(await screen.findByText('confirmed@example.test')).toBeInTheDocument();
    expect(screen.getByText('Confirmed Person')).toBeInTheDocument();
    expect(screen.getByText('Confirmed', { selector: 'td' })).toBeInTheDocument();
    expect(screen.getByText('Webinars and events')).toBeInTheDocument();
    expect(screen.getByText('Pending', { selector: 'td' })).toBeInTheDocument();
    expect(screen.getByText('Registered Member')).toBeInTheDocument();
    expect(screen.getByText('Newsletter Subscribers')).toBeInTheDocument();
    expect(screen.getByText('Community Members')).toBeInTheDocument();
    expect(newsletterSubscriberService.getSubscribers).toHaveBeenCalledWith({ limit: 25, cursor: null });
  });

  it('filters the loaded page by subscriber status and searches its contacts', async () => {
    render(<AdminCommunity />);
    await screen.findByText('confirmed@example.test');

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'PENDING' } });
    expect(screen.queryByText('confirmed@example.test')).not.toBeInTheDocument();
    expect(screen.getByText('pending@example.test')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search this page'), { target: { value: 'confirmed' } });
    expect(screen.queryByText('pending@example.test')).not.toBeInTheDocument();
    expect(screen.getByText('No subscribers match')).toBeInTheDocument();
  });

  it('uses provider cursors to navigate forward and back without loading all contacts', async () => {
    newsletterSubscriberService.getSubscribers
      .mockResolvedValueOnce({ contacts: [testContacts[0]], nextCursor: 'fixture-page-two' })
      .mockResolvedValueOnce({ contacts: [testContacts[1]], nextCursor: null })
      .mockResolvedValueOnce({ contacts: [testContacts[0]], nextCursor: 'fixture-page-two' });
    render(<AdminCommunity />);

    expect(await screen.findByText('confirmed@example.test')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('pending@example.test')).toBeInTheDocument();
    expect(newsletterSubscriberService.getSubscribers).toHaveBeenNthCalledWith(2, {
      limit: 25,
      cursor: 'fixture-page-two',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(await screen.findByText('confirmed@example.test')).toBeInTheDocument();
    expect(newsletterSubscriberService.getSubscribers).toHaveBeenNthCalledWith(3, {
      limit: 25,
      cursor: null,
    });
  });

  it('shows subscriber and member loading errors instead of a false empty state', async () => {
    newsletterSubscriberService.getSubscribers.mockRejectedValue(new Error('Subscriber request failed.'));
    communityMemberService.getCommunityMembers.mockResolvedValue({
      success: false,
      data: null,
      error: { message: 'Member request failed.' },
    });

    render(<AdminCommunity />);

    expect(await screen.findByText('Subscriber request failed.')).toBeInTheDocument();
    expect(screen.getByText('Member request failed.')).toBeInTheDocument();
  });
});
