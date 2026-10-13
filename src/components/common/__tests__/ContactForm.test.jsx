import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { createMessageMock } = vi.hoisted(() => ({
  createMessageMock: vi.fn(),
}));

vi.mock('../../../services/messageService', () => ({
  messageService: {
    createMessage: createMessageMock,
  },
}));

import ContactForm from '../ContactForm';

describe('ContactForm - Real Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMessageMock.mockResolvedValue({
      success: true,
      data: { id: 'message-1' },
      error: null,
    });
  });

  async function fillValidForm(user) {
    await user.type(screen.getByLabelText(/full name/i), 'Amina Yusuf');
    await user.type(screen.getByLabelText(/email address/i), 'amina@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '+2348012345678');
    await user.type(screen.getByLabelText(/subject/i), 'Partnership request');
    await user.selectOptions(screen.getByLabelText(/reason for contact/i), 'Partnership');
    await user.type(
      screen.getByRole('textbox', { name: /message/i }),
      'We would like to partner on community outreach.'
    );
  }

  it('renders the form with default reason', () => {
    render(<ContactForm />);

    expect(screen.getByRole('form', { name: 'Contact form' })).toBeInTheDocument();
    expect(screen.getByLabelText('Reason for Contact')).toHaveValue('General Enquiry');
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(await screen.findByText('Please enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Please share a little more detail.')).toBeInTheDocument();
    expect(createMessageMock).not.toHaveBeenCalled();
  });

  it('submits successfully and resets the form', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    await waitFor(() => {
      expect(createMessageMock).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText(/Thank you! Your message has been received/i)).toBeInTheDocument();
    expect(createMessageMock).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Amina Yusuf',
      email: 'amina@example.com',
      phone: '+2348012345678',
      subject: 'Partnership request',
      message: 'We would like to partner on community outreach.',
      category: 'partnership',
      status: 'new',
    }));
    expect(screen.getByLabelText(/full name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('');
    expect(screen.getByRole('textbox', { name: /message/i })).toHaveValue('');
  });

  it('shows error status when submit fails', async () => {
    const user = userEvent.setup();
    createMessageMock.mockResolvedValueOnce({
      success: false,
      data: null,
      error: { message: 'Insert failed' },
    });

    render(<ContactForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(
      await screen.findByText(/We could not submit your message right now/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Docadi\.healthintiative@gmail\.com/)).toBeInTheDocument();
  });

  it('shows loading state during submit', async () => {
    const user = userEvent.setup();

    let resolveInsert;
    createMessageMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveInsert = resolve;
        })
    );

    render(<ContactForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(screen.getByRole('button', { name: /Sending.../i })).toBeDisabled();

    resolveInsert({ success: true, data: { id: 'message-1' }, error: null });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument();
    });
  });

  it('supports attachment selection and includes filename in payload', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const file = new window.File(['proof'], 'document.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText(/upload supporting file/i), file);

    expect(await screen.findByText(/Selected file:/i)).toBeInTheDocument();
    expect(screen.getByText('document.pdf')).toBeInTheDocument();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    await waitFor(() => {
      expect(createMessageMock).toHaveBeenCalledTimes(1);
    });

    const payload = createMessageMock.mock.calls[0][0];
    expect(payload).toMatchObject({
      name: 'Amina Yusuf',
      email: 'amina@example.com',
      subject: 'Partnership request',
      status: 'new',
    });
    expect(payload.message).toContain('Attachment: document.pdf');
  });

  it('uses the provided initialReason prop', () => {
    render(<ContactForm initialReason="Volunteer" />);

    expect(screen.getByLabelText('Reason for Contact')).toHaveValue('Volunteer');
  });

  it('has attachment input accept restrictions configured', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/upload supporting file/i)).toHaveAttribute(
      'accept',
      '.pdf,.doc,.docx,.jpg,.jpeg,.png'
    );
  });
});
