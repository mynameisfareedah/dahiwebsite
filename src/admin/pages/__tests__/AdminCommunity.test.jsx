import { act, fireEvent, render, screen } from '@testing-library/react';
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
  {
    id: 'contact-3',
    email: 'unsubscribed@example.test',
    fields: { FirstName: 'Unsubscribed', LastName: 'Person' },
    status: 'UNSUBSCRIBED',
    createdAt: '2026-10-03T00:00:00Z',
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

    expect(await screen.findAllByText('confirmed@example.test')).toHaveLength(2);
    expect(screen.getAllByText('Confirmed Person')).toHaveLength(2);
    expect(screen.getAllByText('Confirmed', { selector: 'span' })).toHaveLength(2);
    expect(screen.getAllByText('Webinars and events')).toHaveLength(2);
    expect(screen.getAllByText('Pending', { selector: 'span' })).toHaveLength(2);
    expect(screen.getAllByText('Unsubscribed', { selector: 'span' })).toHaveLength(2);
    expect(screen.getAllByRole('article')).toHaveLength(testContacts.length);
    expect(screen.getByRole('tab', { name: 'Newsletter Subscribers' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Newsletter Subscribers' })).toBeVisible();
    expect(document.getElementById('community-panel')).toHaveAttribute('hidden');
    expect(newsletterSubscriberService.getSubscribers).toHaveBeenCalledWith({ limit: 25, cursor: null });

    fireEvent.click(screen.getByRole('tab', { name: 'Community Members' }));
    expect(screen.getByRole('tab', { name: 'Community Members' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByText('Registered Member')).toBeInTheDocument();
    expect(communityMemberService.getCommunityMembers).toHaveBeenCalledTimes(1);
  });

  it('filters the loaded page by subscriber status and searches its contacts', async () => {
    render(<AdminCommunity />);
    await screen.findAllByText('confirmed@example.test');

    fireEvent.change(screen.getByLabelText('Subscription status'), { target: { value: 'PENDING' } });
    expect(screen.queryAllByText('confirmed@example.test')).toHaveLength(0);
    expect(screen.getAllByText('pending@example.test')).toHaveLength(2);

    fireEvent.change(screen.getByLabelText('Search this page'), { target: { value: 'confirmed' } });
    expect(screen.queryAllByText('pending@example.test')).toHaveLength(0);
    expect(screen.getByText('No subscribers match')).toBeInTheDocument();
  });

  it('filters unsubscribed contacts and displays the provider status label', async () => {
    render(<AdminCommunity />);
    await screen.findAllByText('confirmed@example.test');

    fireEvent.change(screen.getByLabelText('Subscription status'), { target: { value: 'UNSUBSCRIBED' } });

    expect(screen.getAllByText('unsubscribed@example.test')).toHaveLength(2);
    expect(screen.getAllByText('Unsubscribed', { selector: 'span' })).toHaveLength(2);
    expect(screen.queryAllByText('confirmed@example.test')).toHaveLength(0);
    expect(screen.queryAllByText('pending@example.test')).toHaveLength(0);
  });

  it('uses unavailable subscriber statistics after a failed request', async () => {
    newsletterSubscriberService.getSubscribers.mockRejectedValue(new Error('Provider request failed.'));
    render(<AdminCommunity />);

    expect(await screen.findByText('Provider request failed.')).toBeInTheDocument();
    expect(screen.getByLabelText('Contacts on this page value')).toHaveTextContent('—');
    expect(screen.getByLabelText('Confirmed value')).toHaveTextContent('—');
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.queryByText('0 shown')).not.toBeInTheDocument();
    expect(screen.queryByText('No subscribers on this page')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('keeps subscriber counts unavailable while the initial request is pending', async () => {
    let resolveRequest;
    newsletterSubscriberService.getSubscribers.mockReturnValue(new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    render(<AdminCommunity />);

    expect(screen.getByLabelText('Contacts on this page value')).toHaveTextContent('—');
    expect(screen.getByText('Loading contacts…')).toBeInTheDocument();
    expect(screen.queryByText('0 shown')).not.toBeInTheDocument();

    await act(async () => {
      resolveRequest({ contacts: [], nextCursor: null });
    });

    expect(await screen.findByText('No subscribers on this page')).toBeInTheDocument();
    expect(screen.getByLabelText('Contacts on this page value')).toHaveTextContent('0');
  });

  it('shows zero counts when a successful provider response contains no contacts', async () => {
    newsletterSubscriberService.getSubscribers.mockResolvedValue({ contacts: [], nextCursor: null });
    render(<AdminCommunity />);

    expect(await screen.findByText('No subscribers on this page')).toBeInTheDocument();
    expect(screen.getByLabelText('Contacts on this page value')).toHaveTextContent('0');
    expect(screen.getByLabelText('Confirmed value')).toHaveTextContent('0');
    expect(screen.getByText('0 shown')).toBeInTheDocument();
    expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();
  });

  it('keeps subscriber preferences available in expandable details', async () => {
    render(<AdminCommunity />);
    await screen.findAllByText('confirmed@example.test');

    const preferenceSummary = screen.getByText('Preferences (1)');
    expect(preferenceSummary.closest('details')).not.toHaveAttribute('open');
    fireEvent.click(preferenceSummary);

    expect(preferenceSummary.closest('details')).toHaveAttribute('open');
  });

  it('supports keyboard navigation between the accessible tabs', async () => {
    render(<AdminCommunity />);
    await screen.findAllByText('confirmed@example.test');
    const newsletterTab = screen.getByRole('tab', { name: 'Newsletter Subscribers' });

    newsletterTab.focus();
    fireEvent.keyDown(newsletterTab, { key: 'ArrowRight' });

    expect(screen.getByRole('tab', { name: 'Community Members' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Community Members' })).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Community Members' })).toBeVisible();

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Community Members' }), { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'Newsletter Subscribers' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Newsletter Subscribers' })).toHaveAttribute('aria-selected', 'true');
  });

  it('refreshes only the active data source and keeps the current subscriber cursor', async () => {
    newsletterSubscriberService.getSubscribers
      .mockResolvedValueOnce({ contacts: [testContacts[0]], nextCursor: 'page-two' })
      .mockResolvedValueOnce({ contacts: [testContacts[1]], nextCursor: null })
      .mockResolvedValueOnce({ contacts: [testContacts[1]], nextCursor: null });
    render(<AdminCommunity />);

    await screen.findAllByText('confirmed@example.test');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findAllByText('pending@example.test');
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await screen.findAllByText('pending@example.test');
    expect(newsletterSubscriberService.getSubscribers).toHaveBeenLastCalledWith({
      limit: 25,
      cursor: 'page-two',
    });
    expect(communityMemberService.getCommunityMembers).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('tab', { name: 'Community Members' }));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(communityMemberService.getCommunityMembers).toHaveBeenCalledTimes(2);
    expect(newsletterSubscriberService.getSubscribers).toHaveBeenCalledTimes(3);
  });

  it('explains an empty member list without presenting it as a newsletter count', async () => {
    communityMemberService.getCommunityMembers.mockResolvedValue({ success: true, data: [] });
    render(<AdminCommunity />);

    fireEvent.click(screen.getByRole('tab', { name: 'Community Members' }));

    expect(await screen.findByText('Your community is ready to grow')).toBeInTheDocument();
    expect(screen.getByText('Supabase records')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh member list' })).toBeInTheDocument();
  });

  it('uses provider cursors to navigate forward and back without loading all contacts', async () => {
    newsletterSubscriberService.getSubscribers
      .mockResolvedValueOnce({ contacts: [testContacts[0]], nextCursor: 'fixture-page-two' })
      .mockResolvedValueOnce({ contacts: [testContacts[1]], nextCursor: null })
      .mockResolvedValueOnce({ contacts: [testContacts[0]], nextCursor: 'fixture-page-two' });
    render(<AdminCommunity />);

    expect(await screen.findAllByText('confirmed@example.test')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findAllByText('pending@example.test')).toHaveLength(2);
    expect(newsletterSubscriberService.getSubscribers).toHaveBeenNthCalledWith(2, {
      limit: 25,
      cursor: 'fixture-page-two',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(await screen.findAllByText('confirmed@example.test')).toHaveLength(2);
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
    fireEvent.click(screen.getByRole('tab', { name: 'Community Members' }));
    expect(screen.getByText('Member request failed.')).toBeInTheDocument();
  });
});
