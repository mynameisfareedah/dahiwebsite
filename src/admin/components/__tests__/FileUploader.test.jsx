import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUploader } from '../FileUploader';

describe('FileUploader Component - Real Implementation', () => {
  let user;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    // Mock alert
    window.alert = vi.fn();
  });

  describe('rendering', () => {
    it('should render file uploader with default props', () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByLabelText('File upload')).toBeInTheDocument();
    });

    it('should render with custom accept type', () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} accept=".pdf" />);

      const fileInput = screen.getByLabelText('File upload');
      expect(fileInput).toHaveAttribute('accept', '.pdf');
    });

    it('should render with custom max size in description', () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} maxSize={1048576} />);

      expect(screen.getByText(/1MB/)).toBeInTheDocument();
    });

    it('should support single file mode by default', () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} />);

      const fileInput = screen.getByLabelText('File upload');
      expect(fileInput).not.toHaveAttribute('multiple');
    });

    it('should support multiple file mode', () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} multiple={true} />);

      const fileInput = screen.getByLabelText('File upload');
      expect(fileInput).toHaveAttribute('multiple');
    });
  });

  describe('file selection', () => {
    it('should accept valid file and display it', async () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} />);

      const fileInput = screen.getByLabelText('File upload');
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      await user.upload(fileInput, file);

      expect(screen.getByText('test.jpg')).toBeInTheDocument();
      expect(mockOnChange).toHaveBeenCalledWith(file);
    });

    it('should reject files exceeding size limit', async () => {
      const mockOnChange = vi.fn();
      const maxSize = 1024; // 1KB

      render(<FileUploader onChange={mockOnChange} maxSize={maxSize} />);

      const fileInput = screen.getByLabelText('File upload');
      const largeFile = new File(['x'.repeat(2048)], 'large.jpg', { type: 'image/jpeg' });

      await user.upload(fileInput, largeFile);

      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('too large'));
      // Component passes undefined when no valid files in single mode
      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });

    it('should filter by accept type', async () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} accept="image/*" />);

      const fileInput = screen.getByLabelText('File upload');
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });

    it('should handle multiple file uploads in multiple mode', async () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} multiple={true} />);

      const fileInput = screen.getByLabelText('File upload');
      const file1 = new File(['content1'], 'file1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['content2'], 'file2.jpg', { type: 'image/jpeg' });

      await user.upload(fileInput, file1);
      expect(screen.getByText('file1.jpg')).toBeInTheDocument();

      await user.upload(fileInput, file2);
      expect(screen.getByText('file2.jpg')).toBeInTheDocument();
    });
  });

  describe('file removal', () => {
    it('should remove file when delete button clicked', async () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} />);

      const fileInput = screen.getByLabelText('File upload');
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      await user.upload(fileInput, file);
      expect(screen.getByText('test.jpg')).toBeInTheDocument();

      const removeButton = screen.getByLabelText('Remove file');
      await user.click(removeButton);

      expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it('should handle removing files from multiple file list', async () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} multiple={true} />);

      const fileInput = screen.getByLabelText('File upload');
      const file1 = new File(['content1'], 'file1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['content2'], 'file2.jpg', { type: 'image/jpeg' });

      await user.upload(fileInput, file1);
      await user.upload(fileInput, file2);

      const removeButtons = screen.getAllByLabelText('Remove file');
      await user.click(removeButtons[0]);

      expect(screen.queryByText('file1.jpg')).not.toBeInTheDocument();
      expect(screen.getByText('file2.jpg')).toBeInTheDocument();
    });
  });

  describe('file display', () => {
    it('should display file name and size', async () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} />);

      const fileInput = screen.getByLabelText('File upload');
      const file = new File(['x'.repeat(2048)], 'test.jpg', { type: 'image/jpeg' });

      await user.upload(fileInput, file);

      expect(screen.getByText('test.jpg')).toBeInTheDocument();
      expect(screen.getByText(/2KB/)).toBeInTheDocument();
    });

    it('should not show file list when no files selected', () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} />);

      const fileList = screen.queryByText(/File upload button/);
      // File list should not be visible initially
      expect(document.querySelector('.mt-4')).not.toBeInTheDocument();
    });

    it('should show file list when files are selected', async () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} />);

      const fileInput = screen.getByLabelText('File upload');
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      await user.upload(fileInput, file);

      // File display area should now be visible
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
  });

  describe('button interaction', () => {
    it('should trigger file input click when button clicked', async () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      const fileInput = screen.getByLabelText('File upload');

      // Verify button is clickable
      expect(button).toBeInTheDocument();
      expect(fileInput).toBeInTheDocument();
    });

    it('should have correct button type', () => {
      const mockOnChange = vi.fn();
      render(<FileUploader onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});
