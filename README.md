# Blocker.day

Blocker.day is a Cloudflare Worker that generates a `.ics` calendar feed with random (but deterministic) blocks of unavailable time.

Blocker.day can quickly populate an otherwise empty or sparse calendar or scheduling app, including [Cal.com](https://cal.com) and [SavvyCal](https://savvycal.com).

## Features

- generates a consistent `.ics` calendar file based on `seed_value`
- randomized but deterministic availability for each time block
- time blocks begin each day at midnight (00:00) in the timezone specified

## Add or Subscribe

Add or subscribe in your calendar or scheduling app:

### [blocker.day/random-seed-value](http://blocker.day/random-seed-value)
### [blocker.day/random-seed-value.ics](http://blocker.day/random-seed-value.ics)

In these examples, the seed is `random-seed-value` and default settings are used. To change these settings, deploy your own app to Cloudflare and set your [environment variables](#environment-variables).

## Deploy

### Option 1: Deploy to Cloudflare

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/andesco/blocker.day)

### Option 2: Manual Deployment

1. Clone this repo:

```bash
git clone https://github.com/andesco/blocker.day.git
cd blocker.day
```

2. Customize environment variables in `wrangler.toml` as needed. Example:

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



## Usage

Add or subscribe to a calendar by adding `/{seed}` or `/{seed}.ics` to your worker subdomain, a custom domain, or blocker.day:

**your worker** <br/>
- `https://blocker.username.workers.dev/calendar`<br />
- `https://blocker.personal.com/calendar.ics`<br />

**blocker.day** <br/>
- `https://blocker.day/random-seed-value` <br />
- `https://blocker.day/random-seed-value.ics` <br/>
- `https://blocker.day/your-name.ics`

The calendar feed displays consistent blocks of time based on the seed. To get a new set of randomized (but deterministic) blocks of time, change the seed:

1. update the URL path or .ics filename; or
2. set `SEED_VALUE_ONLY` to `true` and update `SEED_VALUE`.

 
 ## Environment Variables
 
 | Variable            | Description | Default |
 |--------------------|-------------|---------|
 | `SEED_VALUE`        | default seed:<br/>text | `default-seed` |
 | `SEED_VALUE_ONLY`   | always use `SEED_VALUE`:<br/>true, false| `false` |
 | `BLOCK_PROBABILITY` | probability of a time block:<br/>0.00–1.00  | `0.50` |
 | `CALENDAR_NAME`    | calendar name displayed in apps:<br/>text | `Blocked` |
 | `TIMEZONE`         | IANA timezone:<br/>[timezone identifier][wiki1] | `America/Toronto` |
 | `BLOCK_HOURS`      | hours in each block of time:<br />1, 2, 3, 4, 6, 8, 12, 24 | `3` |
 | `TOTAL_DAYS`       | number of days:<br/>1–21 | `14` |



   [iana1]: https://www.iana.org/time-zones
   [wiki1]: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  