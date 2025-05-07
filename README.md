# Blocker.day

Blocker.day is a Cloudflare Worker that generates a `.ics` calendar feed with random (but deterministic) blocks of unavailable time.

Blocker.day can quickly populate otherwise empty or sparse scheduling calendars, including Cal.com, Calendly, Doodle, OneCal, Savvycal, and others.

## Features

- random but deterministic availability for each block of time
- `seed value` is set via environment variable (default) or URL
- configurable via [environment variables](#environment-variables)
- serves `.ics` files on the fly
- time blocks always begin at midnight (00:00) in the specified timezone
- defaults to `America/Toronto` timezone


## Demo

Add or subscribe to any of the following calendars in your calendar or scheduling app:

### [blocker.day/random-seed-value](/random-seed-value)
### [blocker.day/random-seed-value.ics](/random-seed-value.ics)

In both examples, the seed is `random-seed-value` and the default [environment variables](#environment-variables) are used: 3 hour blocks of time, begingin at [midnight in Toronto](https://time.is/Toronto), with 50% availabilty, over 14 days.

## Deploy

### Option 1: Deploy with Cloudflare

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/andesco/blocker.day)

### Option 2: Deploy with Wrangler

1. Clone this repo:

```bash
git clone https://github.com/andesco/blocker.day.git
cd blocker.day
```

4. Customize environment variables in `wrangler.toml` as needed. Example:

```toml wrangler.toml
BLOCK_PROBABILITY = "0.25"
TIMEZONE = "America/Vancouver"
BLOCK_HOURS = "4"
TOTAL_DAYS = "21"
```

3. Install Cloudflare’s Wrangler CLI, login, and deply:

```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

Your worker will be available here:
`https://<worker-name>.<your-account>.workers.dev`


## Usage

- `/` displays usage information and instructions
- `/{seed}` or `/{seed}.ics` generates a calendar using the seed from the path

example:
    - `https://x.y.workers.dev/calendar-name`
    - `https://x.y.workers.dev/calendar-name.ics`
	- seed: `calendar-name`
	
 example:
	- `https://blocker.day/random-seed-value`
	- `https://blocker.day/random-seed-value.ics`
	- seed: `random-seed-value`
  
 
 ## Environment Variables
 
 | Variable            | Description | Default |
 |--------------------|-------------|---------|
 | `SEED_VALUE`        | fallback/default seed | `default-seed` |
 | `BLOCK_PROBABILITY` | probability (0.01–0.99) of an exisiting time block | `0.5` |
 | `CALENDAR_NAME`    | calendar name displayed in apps | `Blocked` |
 | `TIMEZONE`         | [IANA timezone][iana1] from [list of identifiers][wiki1] | `America/Toronto` |
 | `BLOCK_HOURS`      | numbers of hours in a block of time:<br />1, 2, 3, 4, 6, 8, 12, 24 | `3` |
 | `TOTAL_DAYS`       | number of days: 1–21 | `14` |
 | `SEED_VALUE_ONLY`   | URL seeds are ignored if `true` | `false` |


> When `SEED_VALUE_ONLY` is `true`, the worker will ignore the URL path or .ics filename and use `SEED_VALUE` as the seed.

   [iana1]: https://www.iana.org/time-zones
   [wiki1]: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  