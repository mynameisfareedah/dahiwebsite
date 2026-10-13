import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import founderBiography from '../../../data/founderBiography';
import { coreValues, missionStatement, visionStatement } from '../../../data/missionVisionValues';
import AboutPage from '../../About/AboutPage';
import AboutPreview from '../../../components/home/AboutPreview';
import TeamPage from '../TeamPage';
import MeetDocAdi from '../../../components/home/MeetDocAdi';
import Navbar from '../../../components/layout/Navbar';
import Sidebar from '../../../components/layout/Sidebar';

vi.mock('../../../hooks/useSupabaseData', () => ({
  useSupabaseData: () => ({
    data: [
      {
        id: '581c3ac4-2631-4497-b348-cb12e51d38b8',
        full_name: 'DR ADIYAT OLAMIDE DELE-SALAWU',
        role: 'FOUNDER & MEDICAL LEAD',
        profile_image: '/founder-profile.jpg',
        bio: 'Existing founder team profile biography.',
        display_order: 1,
      },
      {
        id: 'team-member',
        full_name: 'DAHI Team Member',
        role: 'Programs Coordinator',
        profile_image: '/team-member.jpg',
        bio: 'Existing team member biography.',
        display_order: 2,
      },
      {
        id: 'team-member-2',
        full_name: 'Second DAHI Team Member',
        role: 'Community Engagement Lead',
        profile_image: '/team-member-2.jpg',
        bio: 'Second existing team member biography.',
        display_order: 3,
      },
      {
        id: 'team-member-3',
        full_name: 'Third DAHI Team Member',
        role: 'Outreach Coordinator',
        profile_image: '/team-member-3.jpg',
        bio: 'Third existing team member biography.',
        display_order: 4,
      },
      {
        id: 'team-member-4',
        full_name: 'Fourth DAHI Team Member',
        role: 'Medical Writer',
        profile_image: '/team-member-4.jpg',
        bio: 'Fourth existing team member biography.',
        display_order: 5,
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

function renderInRouter(ui) {
  return render(<MemoryRouter initialEntries={['/team']}>{ui}</MemoryRouter>);
}

describe('Our Story & Team page', () => {
  it('renders the supplied founder biography and professional qualifications in full', () => {
    renderInRouter(<TeamPage />);

    expect(founderBiography.sections.map((section) => section.heading)).toEqual([
      'The woman behind the mission',
      'The experience behind the work',
      'The vision behind DAHI',
    ]);
    expect(founderBiography.sections.map((section) => section.paragraphs.length)).toEqual([6, 3, 4]);

    const founderSection = document.getElementById('founder');
    expect(founderSection).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('heading', { name: 'Our Story & Team', level: 1 })).toBeInTheDocument();
    expect(within(founderSection).getByRole('heading', { name: 'Meet the Founder', level: 2 })).toBeInTheDocument();
    expect(within(founderSection).getByRole('heading', { name: founderBiography.name })).toBeInTheDocument();
    expect(within(founderSection).getByText(founderBiography.introduction)).toBeInTheDocument();

    founderBiography.sections.forEach((section) => {
      expect(within(founderSection).getByRole('heading', { name: section.heading })).toBeInTheDocument();
      section.paragraphs.forEach((paragraph) => {
        expect(within(founderSection).getByText(paragraph)).toBeInTheDocument();
      });
    });

    expect(within(founderSection).getByText(/qualified as a medical doctor in 2005 and has 21 years of experience/)).toBeInTheDocument();
    expect(within(founderSection).getByText(/Master of Public Health \(International\).*University of Birmingham/)).toBeInTheDocument();
    expect(within(founderSection).getByText(/MRCGP.*DRCOG.*DFSRH.*BSLM/)).toBeInTheDocument();
    expect(within(founderSection).getByRole('img', { name: founderBiography.name })).toHaveAttribute('src', '/founder-profile.jpg');
  });

  it('preserves the existing team profiles, photos, roles, and biographies', () => {
    renderInRouter(<TeamPage />);

    const teamSection = document.getElementById('team-heading').parentElement.parentElement;
    expect(within(teamSection).getByRole('heading', { name: 'The Team Behind DAHI' })).toBeInTheDocument();
    expect(within(teamSection).queryByRole('heading', { name: 'Dr Adiyat Olamide Dele-Salawu' })).not.toBeInTheDocument();
    expect(within(teamSection).queryByText('Existing founder team profile biography.')).not.toBeInTheDocument();
    expect(within(teamSection).getByRole('heading', { name: 'DAHI Team Member' })).toBeInTheDocument();
    expect(within(teamSection).getByText('Programs Coordinator')).toBeInTheDocument();
    expect(within(teamSection).getByText('Existing team member biography.')).toBeInTheDocument();
    expect(within(teamSection).getByRole('img', { name: 'Profile photo of DAHI Team Member' })).toHaveAttribute('src', '/team-member.jpg');
    expect(within(teamSection).getByRole('heading', { name: 'Second DAHI Team Member' })).toBeInTheDocument();
    expect(within(teamSection).getByText('Second existing team member biography.')).toBeInTheDocument();
    expect(within(teamSection).getByRole('img', { name: 'Profile photo of Second DAHI Team Member' })).toHaveAttribute('src', '/team-member-2.jpg');
    expect(within(teamSection).getByRole('heading', { name: 'Third DAHI Team Member' })).toBeInTheDocument();
    expect(within(teamSection).getByText('Third existing team member biography.')).toBeInTheDocument();
    expect(within(teamSection).getByRole('img', { name: 'Profile photo of Third DAHI Team Member' })).toHaveAttribute('src', '/team-member-3.jpg');
    expect(within(teamSection).getByRole('heading', { name: 'Fourth DAHI Team Member' })).toBeInTheDocument();
    expect(within(teamSection).getByText('Fourth existing team member biography.')).toBeInTheDocument();
    expect(within(teamSection).getByRole('img', { name: 'Profile photo of Fourth DAHI Team Member' })).toHaveAttribute('src', '/team-member-4.jpg');
    expect(within(teamSection).getAllByRole('article')).toHaveLength(4);
  });

  it('labels both navigation surfaces Our Story & Team while retaining /team', () => {
    renderInRouter(
      <>
        <Navbar />
        <Sidebar mobileOpen setMobileOpen={() => {}} />
      </>,
    );

    const storyLinks = screen.getAllByRole('link', { name: 'Our Story & Team' });
    expect(storyLinks).toHaveLength(3);
    storyLinks.forEach((link) => expect(link).toHaveAttribute('href', '/team'));
  });

  it('uses the approved homepage founder introduction and story destination', () => {
    renderInRouter(<MeetDocAdi />);

    expect(screen.getByRole('heading', { name: founderBiography.name })).toBeInTheDocument();
    expect(screen.getByText(/Growing up surrounded by women, Dr Adiyat noticed/)).toBeInTheDocument();
    expect(screen.getByText(/Her journey through medical school and 21 years of medical practice/)).toBeInTheDocument();
    expect(screen.getByText(/Today, as the founder of Doc Adi Health Initiative/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read Her Story' })).toHaveAttribute('href', '/team#founder');
  });

  it('shows concise homepage mission summaries and links to the full About content', () => {
    renderInRouter(<AboutPreview />);

    expect(screen.getByText(missionStatement.summary)).toBeInTheDocument();
    expect(screen.getByText(visionStatement.summary)).toBeInTheDocument();
    expect(screen.queryByText(missionStatement.paragraphs[0])).not.toBeInTheDocument();
    expect(screen.queryByText(visionStatement.paragraphs[0])).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore Our Mission & Values' })).toHaveAttribute(
      'href',
      '/about#mission-vision-values',
    );
  });

  it('renders all approved mission, vision, and core values on the About page without review labels', () => {
    renderInRouter(
      <AboutPage />,
    );

    expect(screen.getByRole('heading', { name: 'OUR MISSION' })).toBeInTheDocument();
    missionStatement.paragraphs.forEach((paragraph) => {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'OUR VISION' })).toBeInTheDocument();
    visionStatement.paragraphs.forEach((paragraph) => {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    });
    coreValues.forEach((value) => {
      expect(screen.getByRole('heading', { name: value.title })).toBeInTheDocument();
      value.paragraphs.forEach((paragraph) => {
        expect(screen.getByText(paragraph)).toBeInTheDocument();
      });
    });
    expect(screen.queryByText(/Proposed wording for review|Draft statements for review|Proposed core values/i)).not.toBeInTheDocument();
  });
});
