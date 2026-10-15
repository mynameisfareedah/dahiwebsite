import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  getVolunteerApplications: vi.fn(),
  html2canvas: vi.fn(),
  savedFiles: [],
  addedImages: [],
}));

vi.mock('../../hooks/useDataManagement', () => ({
  usePagination: (items) => ({
    currentItems: items,
    currentPage: 1,
    totalPages: 1,
    goToPage: vi.fn(),
  }),
  useSearch: (items) => ({
    searchQuery: '',
    setSearchQuery: vi.fn(),
    filtered: items,
  }),
  useSorting: (items) => ({ sorted: items }),
  useToast: () => ({ addToast: mocks.addToast }),
}));

vi.mock('../../services/volunteerService', () => ({
  volunteerService: {
    getVolunteerApplications: mocks.getVolunteerApplications,
  },
}));

vi.mock('../../components', () => ({
  PageHeader: () => null,
  SearchBar: () => null,
  FilterBar: () => null,
  EmptyState: () => null,
  Pagination: () => null,
  StatusBadge: () => null,
  Modal: ({ isOpen, children }) => (isOpen ? children : null),
  LoadingSpinner: () => null,
}));

vi.mock('html2canvas', () => ({
  default: mocks.html2canvas,
  error: null,
}));

vi.mock('jspdf', async (importOriginal) => {
  const original = await importOriginal();
  class TestJsPDF extends original.jsPDF {
    constructor(...args) {
      super(...args);
      this.getImageProperties = () => ({ width: 800, height: 1200 });
      this.addImage = (...imageArgs) => mocks.addedImages.push(imageArgs);
      this.save = (filename) => mocks.savedFiles.push(filename);
    }
  }

  return {
    ...original,
    error: null,
    default: TestJsPDF,
    jsPDF: TestJsPDF,
  };
});

import AdminVolunteerApplications from '../AdminVolunteerApplications';

const syntheticApplications = [
  {
    id: 'synthetic-one',
    full_name: 'Synthetic Volunteer One',
    email: 'one@example.invalid',
    skills: ['health education', 'community outreach'],
    status: 'Pending',
  },
  {
    id: 'synthetic-two',
    full_name: 'Synthetic Volunteer Two',
    email: 'two@example.invalid',
    skills: ['event support'],
    status: 'Pending',
  },
];

describe('volunteer application PDF exports with synthetic records', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getVolunteerApplications.mockResolvedValue({
      success: true,
      data: syntheticApplications,
    });
    mocks.html2canvas.mockResolvedValue({
      toDataURL: () => 'data:image/png;base64,synthetic-image',
    });
    mocks.savedFiles.length = 0;
    mocks.addedImages.length = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports the full synthetic application list as a PDF', async () => {
    render(<AdminVolunteerApplications />);
    await screen.findByText('Synthetic Volunteer One');

    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));

    await waitFor(() => {
      expect(mocks.savedFiles[0]).toMatch(/^volunteer-applications-.*\.pdf$/);
    });
    expect(mocks.html2canvas).toHaveBeenCalledTimes(2);
    expect(mocks.addedImages).toHaveLength(2);
    expect(mocks.addToast).toHaveBeenCalledWith('Exported PDF successfully.', 'success');
  });

  it('exports one selected synthetic application as a PDF', async () => {
    render(<AdminVolunteerApplications />);
    await screen.findByText('Synthetic Volunteer One');

    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[0]);
    const exportButtons = await screen.findAllByRole('button', { name: 'Export PDF' });
    fireEvent.click(exportButtons[1]);

    await waitFor(() => {
      expect(mocks.savedFiles).toContain('application-synthetic-one.pdf');
    });
    expect(mocks.html2canvas).toHaveBeenCalledTimes(1);
    expect(mocks.addedImages).toHaveLength(1);
    expect(mocks.addToast).toHaveBeenCalledWith(
      'Exported application PDF successfully.',
      'success'
    );
  });
});
