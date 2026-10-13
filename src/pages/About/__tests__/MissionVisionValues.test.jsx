import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MissionVisionValues from '../../../components/common/MissionVisionValues';
import { coreValues, missionStatement, visionStatement } from '../../../data/missionVisionValues';

describe('approved mission, vision, and core values', () => {
  it('stores the exact approved mission, vision, and six values as structured paragraphs', () => {
    expect(missionStatement.paragraphs).toEqual([
      'To empower Muslim women and girls with the knowledge, confidence and support they need to understand their bodies, make informed health decisions and take an active role in their wellbeing.',
      "Through accessible, evidence-based and faith-conscious health education, the Doc Adi Health Initiative (DAHI) seeks to bridge gaps in women's health knowledge, challenge the silence and stigma surrounding sensitive health conversations, and create supportive spaces where women and girls can ask questions without fear or judgement.",
      'We are committed to making reliable health information understandable, culturally relevant and respectful of Islamic values, with particular attention to menstruation, puberty, reproductive health, menopause, disease prevention and healthy living.',
      'By educating and empowering women, we aim to strengthen families, improve health awareness and contribute to healthier, better-informed communities in Nigeria and beyond.',
    ]);
    expect(visionStatement.paragraphs).toEqual([
      'We envision a future where every Muslim woman and girl, regardless of her background, location or stage of life, has access to trustworthy health information and feels confident discussing her health, understanding her body and seeking appropriate medical care.',
      "A future where conversations about menstruation, reproductive health, menopause and other aspects of women's wellbeing are approached with openness, dignity and compassion rather than silence, shame or misinformation.",
      'We aspire to see communities where faith and reliable medical knowledge are understood as complementary sources of guidance, enabling women to make informed health decisions without feeling that they must compromise their religious values.',
      'Ultimately, we envision generations of informed, confident and empowered women whose knowledge positively influences their families, strengthens their communities and contributes to a healthier society.',
    ]);
    expect(coreValues.map((value) => value.paragraphs)).toEqual([
      [
        'We believe every woman deserves access to accurate, reliable and understandable health information. Our educational approach is grounded in credible medical evidence, professional knowledge and responsible health communication.',
        'We are committed to simplifying complex health topics, addressing misconceptions and helping women distinguish trustworthy medical information from misinformation, so they can make informed choices about their health and wellbeing.',
      ],
      [
        "We recognise that every woman's health journey is shaped by unique experiences, concerns and circumstances. We approach these experiences with empathy, kindness, sensitivity and understanding.",
        'Whether discussing menstruation, fertility, pregnancy, menopause or other sensitive matters, we strive to create a welcoming environment where women feel heard, respected and supported without fear of criticism or judgement.',
      ],
      [
        'We recognise that faith plays an important role in shaping the values, decisions and everyday experiences of many Muslim women.',
        'We are committed to providing health education that respects Islamic beliefs, cultural considerations and personal circumstances while remaining grounded in sound medical evidence.',
        'We believe women should be able to access reliable health knowledge and seek appropriate healthcare without feeling that they must choose between their faith and their wellbeing.',
      ],
      [
        'Every woman and girl deserves to be treated with dignity, regardless of her age, background, health condition or personal circumstances.',
        "We seek to challenge the shame, stigma and silence that often surround women's health by encouraging respectful conversations and creating opportunities to learn without embarrassment.",
        'We value privacy, sensitivity and the right of every woman to receive information that supports her ability to make informed decisions.',
      ],
      [
        'We believe knowledge is a powerful foundation for confidence, independence and informed decision-making.',
        'By equipping women and girls with practical health education, we aim to help them understand normal bodily changes, recognise warning signs, ask meaningful questions and know when to seek professional medical attention.',
        'Our goal is not simply to share information, but to support women in becoming active, informed participants in decisions concerning their health.',
      ],
      [
        'We believe that empowering a woman through health education can positively influence the wellbeing of her family and wider community.',
        'We value collaboration, shared learning and community participation as important ways to improve health awareness and encourage healthier practices.',
        'Through educational resources, community outreach and meaningful partnerships, we aim to contribute to communities where women support one another, families are better informed and health education becomes a shared responsibility.',
      ],
    ]);
  });

  it('preserves the approved statement paragraph boundaries and renders every paragraph separately', () => {
    render(
      <MemoryRouter>
        <MissionVisionValues />
      </MemoryRouter>,
    );

    const section = document.getElementById('mission-vision-values');
    expect(section).toHaveAttribute('tabindex', '-1');
    expect(within(section).getByRole('heading', { name: missionStatement.title })).toBeInTheDocument();
    expect(within(section).getByRole('heading', { name: visionStatement.title })).toBeInTheDocument();
    for (const paragraph of missionStatement.paragraphs) {
      expect(within(section).getByText(paragraph).tagName).toBe('P');
    }
    for (const paragraph of visionStatement.paragraphs) {
      expect(within(section).getByText(paragraph).tagName).toBe('P');
    }

    expect(missionStatement.paragraphs).toHaveLength(4);
    expect(visionStatement.paragraphs).toHaveLength(4);
    expect(within(section).queryByText(/Proposed wording for review|Draft statements for review|Proposed core values/i)).not.toBeInTheDocument();
  });

  it('renders all six approved core value titles and each paragraph as separate copy', () => {
    render(
      <MemoryRouter>
        <MissionVisionValues />
      </MemoryRouter>,
    );

    const section = document.getElementById('mission-vision-values');
    expect(coreValues.map((value) => value.title)).toEqual([
      'EVIDENCE-BASED EDUCATION',
      'COMPASSION',
      'FAITH-CONSCIOUS EDUCATION',
      'DIGNITY AND RESPECT',
      'EMPOWERMENT THROUGH KNOWLEDGE',
      'COMMUNITY WELLBEING',
    ]);
    expect(within(section).getAllByRole('article')).toHaveLength(8);

    coreValues.forEach((value) => {
      expect(within(section).getByRole('heading', { name: value.title })).toBeInTheDocument();
      value.paragraphs.forEach((paragraph) => {
        expect(within(section).getByText(paragraph).tagName).toBe('P');
      });
    });
  });

  it('renders only short summaries and a working About anchor in homepage mode', () => {
    render(
      <MemoryRouter>
        <MissionVisionValues compact />
      </MemoryRouter>,
    );

    expect(screen.getByText(missionStatement.summary)).toBeInTheDocument();
    expect(screen.getByText(visionStatement.summary)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore Our Mission & Values' })).toHaveAttribute(
      'href',
      '/about#mission-vision-values',
    );
    expect(screen.queryByText(missionStatement.paragraphs[0])).not.toBeInTheDocument();
    expect(screen.queryByText(visionStatement.paragraphs[0])).not.toBeInTheDocument();
    coreValues.forEach((value) => {
      expect(screen.getByText(value.title)).toBeInTheDocument();
      value.paragraphs.forEach((paragraph) => {
        expect(screen.queryByText(paragraph)).not.toBeInTheDocument();
      });
    });
  });
});
