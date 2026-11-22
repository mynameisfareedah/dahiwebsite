import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import TestimonialsPage from '../TestimonialsPage';
import { getPublishedTestimonialCategories, publishableTestimonials, testimonials } from '../../../data/testimonials';
import { pendingTestimonials } from '../../../data/pendingTestimonials';

vi.mock('../../../components/common/SEO', () => ({ default: () => null }));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/voices']}>
      <TestimonialsPage />
    </MemoryRouter>,
  );
}

describe('TestimonialsPage', () => {
  it('renders the requested heading, introduction, and verified text-only testimonials', () => {
    renderPage();

    expect(testimonials).toHaveLength(18);
    expect(publishableTestimonials).toHaveLength(18);
    expect(new Set(publishableTestimonials.map((testimonial) => testimonial.id)).size).toBe(18);
    expect(new Set(publishableTestimonials.map((testimonial) => testimonial.quote)).size).toBe(18);
    expect(screen.getByRole('heading', { level: 1, name: 'DAHI Voices' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Real Experiences. Meaningful Reflections.' })).toBeInTheDocument();
    expect(screen.getByText('Hear directly from members of the DAHI community as they share their experiences with our educational programmes, online quizzes, and health resources.')).toBeInTheDocument();
    expect(document.querySelectorAll('.home-testimonial-card')).toHaveLength(18);
    for (const testimonial of publishableTestimonials) {
      const card = screen.getByText(testimonial.quote).closest('article');
      expect(card).toBeInTheDocument();
      expect(within(card).getByText(testimonial.attribution)).toBeInTheDocument();
    }
    for (const field of ['email', 'phone', 'respondentName']) {
      expect(publishableTestimonials.every((testimonial) => !(field in testimonial))).toBe(true);
    }
    expect(screen.getByText('The webinar was well-structured, and the delivery made every topic easy to understand.')).toBeInTheDocument();
    expect(screen.getByText('I enjoyed every part of the webinar. It was engaging from beginning to end.')).toBeInTheDocument();
    expect(screen.getByText('The information was presented in a way that was easy to understand and apply.')).toBeInTheDocument();
    expect(screen.getByText('Jazak Allahu Khayran for the quiz. I enjoyed taking part.')).toBeInTheDocument();
    expect(screen.getByText('Thank you for that wonderful presentation yesterday. I was late but still learnt some things.')).toBeInTheDocument();
    expect(screen.getByText('May Allah the exalted bless you abundantly and reward you for all your efforts.')).toBeInTheDocument();
    expect(screen.getByText('The detailed way the session was held and the easy to understand delivery.')).toBeInTheDocument();
    expect(screen.getByText('I was very impressed with and grateful for the sessions')).toBeInTheDocument();
    expect(screen.getByText('Quite insightful and hope this can be done periodically')).toBeInTheDocument();
    expect(screen.getByText('This is an eye opener make it more regular and for men to listen I made sure my husband listened too')).toBeInTheDocument();
    expect(screen.getByText('The need to take control and action about my health')).toBeInTheDocument();
    expect(screen.getByText("prioritise my 'women's' health in accordance with Allah's guidance")).toBeInTheDocument();
    expect(screen.getByText('You are doing a great job ma,may Allah reward you with the best of both worlds')).toBeInTheDocument();
    expect(screen.queryByText("It's actually a very clear guide, yeah.")).not.toBeInTheDocument();
    expect(document.querySelectorAll('img')).toHaveLength(0);
  });

  it('renders the four anonymous Aberdeen session testimonials without featuring them on the homepage', () => {
    renderPage();

    const aberdeenTestimonials = testimonials.filter(({ id }) => id.startsWith('aberdeen-menstruation-outreach-'));
    expect(aberdeenTestimonials).toHaveLength(4);

    for (const testimonial of aberdeenTestimonials) {
      expect(testimonial).toMatchObject({
        category: 'Educational Sessions',
        attribution: 'Aberdeen Session Participant',
        context: 'Teenage Menstruation Education Outreach · Aberdeen',
        status: 'verified',
        featuredOnHome: false,
      });
      expect(testimonial).not.toHaveProperty('respondentName');
      expect(testimonial).not.toHaveProperty('image');

      const card = screen.getByText(testimonial.quote).closest('article');
      expect(card).toBeInTheDocument();
      expect(within(card).getByText(testimonial.attribution)).toBeInTheDocument();
      expect(within(card).getByText(testimonial.context)).toBeInTheDocument();
    }

    expect(screen.getByText('She did really well and explained everything really well. She also answered all the questions very well. She also gave examples of what she was talking about and let the students do demonstrations about what we were talking about.')).toBeInTheDocument();
    expect(screen.getByText('Thank you for telling us all about this. I did feel comfortable. You should come again. It really helped me.')).toBeInTheDocument();
    expect(screen.getByText("I think she is really good because she made us feel very comfortable and asked us about our day and then slowly got to the point. It was really comfortable and she explained things other people can't explain. She told us stories so we wouldn't be shy or uncomfortable. I would say I want this doctor again because she was really sweet and I hope she comes again.")).toBeInTheDocument();
    expect(screen.getByText('It was useful, and the lady was nice and made us comfortable enough to speak to her openly.')).toBeInTheDocument();
  });

  it('filters populated categories accessibly and hides categories without verified entries', async () => {
    const user = userEvent.setup();
    renderPage();

    const filterGroup = screen.getByRole('group', { name: 'Filter DAHI Voices' });
    const allButton = screen.getByRole('button', { name: 'All DAHI Voices' });
    expect(allButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Books & Resources' })).not.toBeInTheDocument();

    const educationalSessionsButton = screen.getByRole('button', { name: 'Educational Sessions' });
    educationalSessionsButton.focus();
    expect(educationalSessionsButton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(educationalSessionsButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Online Quiz' }));
    expect(screen.getByText('Jazak Allahu Khayran for the quiz. I enjoyed taking part.')).toBeInTheDocument();
    expect(screen.queryByText('Thank you for that wonderful presentation yesterday. I was late but still learnt some things.')).not.toBeInTheDocument();
    expect(within(filterGroup).getByRole('button', { name: 'Online Quiz' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Community Appreciation' }));
    expect(screen.getByText('May Allah the exalted bless you abundantly and reward you for all your efforts.')).toBeInTheDocument();
    expect(screen.queryByText('Jazak Allahu Khayran for the quiz. I enjoyed taking part.')).not.toBeInTheDocument();

    await user.click(allButton);
    expect(screen.getByText('Thank you for that wonderful presentation yesterday. I was late but still learnt some things.')).toBeInTheDocument();
  });

  it('excludes pending entries and automatically adds newly verified categories to available filters', () => {
    const [pendingTestimonial] = pendingTestimonials;

    expect(pendingTestimonial).toMatchObject({
      quote: "It's actually a very clear guide, yeah.",
      context: 'Sunnah Reset',
      verificationNote: 'Audio transcription; verify against the original recording before publication.',
    });
    expect(publishableTestimonials).not.toContain(pendingTestimonial);
    expect(getPublishedTestimonialCategories([...publishableTestimonials, pendingTestimonial])).not.toContain('Books & Resources');
    expect(getPublishedTestimonialCategories([
      ...publishableTestimonials,
      { ...pendingTestimonial, status: 'verified' },
    ])).toContain('Books & Resources');
  });
});
