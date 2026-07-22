import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminResources from '../AdminResources';

const { getResourcesMock, createResourceMock, updateResourceMock, deleteResourceMock } = vi.hoisted(() => ({
  getResourcesMock: vi.fn(),
  createResourceMock: vi.fn(),
  updateResourceMock: vi.fn(),
  deleteResourceMock: vi.fn(),
}));

vi.mock('../../services/resourceService', () => ({
  resourceService: {
    getResources: getResourcesMock,
    createResource: createResourceMock,
    updateResource: updateResourceMock,
    deleteResource: deleteResourceMock,
  },
}));

vi.mock('../../components', () => ({
  PageHeader: ({ title, subtitle, actionLabel, action }) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button onClick={action}>{actionLabel}</button>
    </div>
  ),
  EmptyState: ({ title, description, actionLabel, action }) => (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={action}>{actionLabel}</button>
    </div>
  ),
  LoadingSpinner: ({ text }) => <div>{text}</div>,
  StatusBadge: ({ status }) => <span>{status}</span>,
  Modal: ({ isOpen, title, children }) => (isOpen ? <div><h2>{title}</h2>{children}</div> : null),
}));

vi.mock('../../components/FormField', () => ({
  FormInput: ({ label, name, value, onChange, ...props }) => (
    <label>
      <span>{label}</span>
      <input name={name} value={value || ''} onChange={onChange} {...props} />
    </label>
  ),
  FormSelect: ({ label, children, ...props }) => (
    <label>
      <span>{label}</span>
      <select {...props}>{children}</select>
    </label>
  ),
  FormTextarea: ({ label, name, value, onChange, ...props }) => (
    <label>
      <span>{label}</span>
      <textarea name={name} value={value || ''} onChange={onChange} {...props} />
    </label>
  ),
}));

describe('AdminResources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getResourcesMock.mockResolvedValue({ success: true, data: [{
      id: 'resource-1',
      title: 'Health Guide',
      description: 'A guide',
      author: 'Ada',
      coverImage: 'https://cdn.example.com/old.png',
      category: 'general',
      resourceType: 'guide',
      resource_type: 'guide',
      externalUrl: 'https://example.com/resource',
      type: 'guide',
      featured: false,
      status: 'draft',
      createdAt: '2026-07-01',
      downloads: 0,
    }] });
    updateResourceMock.mockResolvedValue({ success: true, data: { id: 'resource-1', title: 'Health Guide' }});
    createResourceMock.mockResolvedValue({ success: true, data: { id: 'resource-2', title: 'New Resource' }});
    deleteResourceMock.mockResolvedValue({ success: true, data: true });
  });

  it('opens the edit form with the current cover image and submits a replacement file', async () => {
    render(<AdminResources />);

    await screen.findByText('Health Guide');

    fireEvent.click(screen.getByLabelText('Edit Health Guide'));

    expect(await screen.findByText('Edit Resource')).toBeInTheDocument();

    const file = new File(['img'], 'new-cover.png', { type: 'image/png' });
    const input = screen.getByLabelText(/cover image/i);
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(updateResourceMock).toHaveBeenCalled());

    const payload = updateResourceMock.mock.calls[0][1];
    expect(payload.coverImageFile).toBe(file);
    expect(payload.title).toBe('Health Guide');
  });
});
