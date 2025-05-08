// HTML is served from an inlined template; no static assets binding
import { INDEX_HTML } from './html-template.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Make .ics optional in the URL
    let pathname = url.pathname.replace(/^\/|\/?\.?ics$/g, "");

    // Handle root path: serve inlined index HTML with origin & random-seed injection and edge caching
    if (!pathname) {
      const cache = caches.default;
      const cacheKey = new Request(request.url, request);
      const cached = await cache.match(cacheKey);
      if (cached) return cached;

      // Use inlined HTML template
      let html = INDEX_HTML.replace(/\$\{url\.origin\}/g, url.origin);
      const seed = Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      html = html.replace(/random-seed-value/g, seed);

      const res = new Response(html, { headers: { "Content-Type": "text/html" } });
      ctx.waitUntil(cache.put(cacheKey, res.clone()));
      return res;
    }

    const useSaltOnly = (env.SEED_VALUE_ONLY || "").toLowerCase() === "true";
    const seed = useSaltOnly ? (env.SEED_VALUE || "default-seed") : pathname;

    const calendar = generateICS({
      seedSalt: seed,
      blockProbability: clamp(parseFloat(env.BLOCK_PROBABILITY || "0.5"), 0.01, 0.99),
      calendarName: env.CALENDAR_NAME || "Blocker.day",
      timezone: env.TIMEZONE || "America/Toronto",
      blockHours: validateBlockHours(parseInt(env.BLOCK_HOURS || "3")),
      totalDays: clamp(parseInt(env.TOTAL_DAYS || "14"), 1, 21),
    });

    return new Response(calendar, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": `attachment; filename="${seed}.ics"`,
      },
    });
  }
};

function generateICS({ seedSalt, blockProbability, calendarName, timezone, blockHours, totalDays }) {
  // Get current date in local time with time set to midnight
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Create a base domain for UIDs from the seed
  // This ensures UIDs are stable but unique per calendar
  const seedHash = hashString(seedSalt).toString(16);
  const uidDomain = `${seedHash}@blocker.day`;
  
  const events = [];

  // Use date strings with timezone properly specified for ICS file
  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    // Create date for this day at midnight
    const currentDate = new Date(now);
    currentDate.setDate(currentDate.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
    
    // Generate deterministic seed for this date and salt
    const daySeed = hashString(seedSalt + dateStr);
    const rng = mulberry32(daySeed);

    // Generate possible time blocks for this day
    const blocksPerDay = 24 / blockHours;
    for (let i = 0; i < blocksPerDay; i++) {
      if (rng() < blockProbability) {
        // Format dates directly in yyyymmddThhmmss format required for TZID in ICS
        const startHour = i * blockHours;
        const endHour = startHour + blockHours;
        
        // Create properly formatted date strings for ICS file with correct hour
        const icsDate = dateStr.replace(/-/g, ''); // yyyymmdd
        const startTime = `${icsDate}T${String(startHour).padStart(2, '0')}0000`; // yyyymmddThhmmss
        const endTime = `${icsDate}T${String(endHour).padStart(2, '0')}0000`;
        
        // Generate a deterministic UID for this event based on seed, date and time block
        // This ensures UIDs are stable but unique across regenerations of the same calendar
        const eventIdSeed = hashString(`${seedSalt}-${dateStr}-${startHour}`);
        const eventId = eventIdSeed.toString(16);

        events.push(`
BEGIN:VEVENT
UID:${eventId}-${uidDomain}
DTSTAMP:${formatDateUTC(new Date())}
DTSTART;TZID=${timezone}:${startTime}
DTEND;TZID=${timezone}:${endTime}
SUMMARY:${calendarName}
TRANSP:OPAQUE
STATUS:BUSY
END:VEVENT`);
      }
    }
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cloudflare Worker//Blocker.day Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${calendarName}
X-WR-TIMEZONE:${timezone}
${buildVTimezone(timezone)}
${events.join("\n")}
END:VCALENDAR`;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function formatDateLocal(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0].slice(0, 15);
}

function formatDateUTC(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function clamp(num, min, max) {
  return isNaN(num) ? min : Math.max(min, Math.min(num, max));
}

function validateBlockHours(h) {
  return (h && 24 % h === 0) ? h : 3;
}

function buildVTimezone(tzid) {
  if (tzid !== "America/Toronto") return "";
  return `
BEGIN:VTIMEZONE
TZID:America/Toronto
X-LIC-LOCATION:America/Toronto
BEGIN:DAYLIGHT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE`;
}