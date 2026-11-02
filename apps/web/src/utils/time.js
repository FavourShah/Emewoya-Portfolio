/**
 * Get current time details for a given timezone and relative to the visitor
 * @param {string} targetTimezone - IANA timezone, e.g. 'Africa/Lagos'
 * @returns {object}
 */
export function getTimeDetails(targetTimezone = 'Africa/Lagos') {
  const now = new Date();

  // Target city name (e.g. Lagos)
  const cityName = targetTimezone.includes('/')
    ? targetTimezone.split('/')[1].replace(/_/g, ' ')
    : targetTimezone;

  // Time in target timezone (24h format HH:mm:ss)
  let targetTime = '--:--:--';
  let targetHour = 12;
  try {
    targetTime = now.toLocaleTimeString('en-GB', {
      timeZone: targetTimezone,
      hour12: false,
    });
    targetHour = parseInt(
      now.toLocaleString('en-GB', {
        timeZone: targetTimezone,
        hour: '2-digit',
        hour12: false,
      }),
      10
    );
  } catch (e) {
    targetTime = now.toLocaleTimeString('en-GB', { hour12: false });
  }

  const isDaytime = targetHour >= 6 && targetHour < 18;
  const daytimeLabel = `${isDaytime ? 'Daytime' : 'Night'} in ${cityName}`;

  // Visitor local time and timezone
  let visitorTime = '--:--';
  try {
    visitorTime = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (e) {
    visitorTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  let visitorZone = 'your time';
  try {
    visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'your time';
  } catch (e) {
    visitorZone = 'your time';
  }

  // Offset calculation using Intl
  let offsetMessage = 'We are on the same clock.';
  try {
    // Get epoch representations of formatted dates in both zones
    const targetIso = now.toLocaleString('en-US', { timeZone: targetTimezone });
    const localIso = now.toLocaleString('en-US');

    const targetDate = new Date(targetIso);
    const localDate = new Date(localIso);

    const diffMinutes = Math.round((targetDate.getTime() - localDate.getTime()) / (1000 * 60));
    const diffHours = diffMinutes / 60;

    if (diffMinutes === 0) {
      offsetMessage = 'We are on the same clock.';
    } else {
      const absDiff = Math.abs(diffHours);
      const formattedDiff = absDiff % 1 === 0 ? absDiff : absDiff.toFixed(1);
      const relation = diffHours > 0 ? 'ahead of' : 'behind';
      offsetMessage = `${cityName} is ${formattedDiff}h ${relation} you.`;
    }
  } catch (e) {
    offsetMessage = 'We are on the same clock.';
  }

  return {
    targetTime,
    cityName,
    daytimeLabel,
    visitorTime,
    visitorZone,
    offsetMessage,
  };
}

