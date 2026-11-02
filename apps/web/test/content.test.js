import { describe, it, expect } from 'vitest';
import defaultSeedData from '../src/data/content.seed.json';

describe('Public Site Data & Teaser Numbering', () => {
  it('correctly calculates total case studies and teaser numbering', () => {
    const published = defaultSeedData.projects;
    const teaserCount = defaultSeedData.teaserCount;
    const totalCount = published.length + teaserCount;

    expect(published.length).toBe(2);
    expect(teaserCount).toBe(3);
    expect(totalCount).toBe(5);

    // Numbering starts after published count
    const teaserNumbers = Array.from({ length: teaserCount }).map((_, i) =>
      String(published.length + i + 1).padStart(2, '0')
    );

    expect(teaserNumbers).toEqual(['03', '04', '05']);
  });

  it('guarantees bundled content seed has no leaked teaser titles', () => {
    for (const project of defaultSeedData.projects) {
      expect(project.slug).not.toMatch(/^teaser/);
      expect(project.title).not.toMatch(/^teaser/i);
    }
  });

  it('preserves required placeholders without inventing content', () => {
    expect(defaultSeedData.settings.email).toBe('[EMAIL]');
    expect(defaultSeedData.settings.linkedinUrl).toBe('[LINKEDIN]');
    expect(defaultSeedData.settings.githubUrl).toBe('[GITHUB]');
    expect(defaultSeedData.settings.twitterUrl).toBe('[X / TWITTER]');
  });
});

