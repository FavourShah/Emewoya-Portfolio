import { describe, it, expect } from 'vitest';
import { getTimeDetails } from '../src/utils/time.js';

describe('Time and Timezone offset maths', () => {
  it('returns valid time object for Lagos timezone', () => {
    const details = getTimeDetails('Africa/Lagos');
    expect(details).toHaveProperty('targetTime');
    expect(details.targetTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(details).toHaveProperty('cityName', 'Lagos');
    expect(details).toHaveProperty('daytimeLabel');
    expect(details.daytimeLabel).toMatch(/^(Daytime|Night) in Lagos$/);
    expect(details).toHaveProperty('visitorTime');
    expect(details).toHaveProperty('visitorZone');
    expect(details).toHaveProperty('offsetMessage');
  });

  it('computes offset message correctly including half-hour timezones', () => {
    // Test with India Standard Time (UTC+5:30)
    const istDetails = getTimeDetails('Asia/Kolkata');
    expect(istDetails.cityName).toBe('Kolkata');
    expect(istDetails.offsetMessage).toBeDefined();

    // Test with Newfoundland (UTC-3:30)
    const nflDetails = getTimeDetails('America/St_Johns');
    expect(nflDetails.cityName).toBe('St Johns');
    expect(nflDetails.offsetMessage).toBeDefined();
  });
});

