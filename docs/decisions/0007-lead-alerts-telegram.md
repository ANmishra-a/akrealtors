# 0007 — Lead alerts: Telegram bot over WhatsApp Cloud API

**Status:** Accepted (user's explicit choice)

## Context

The design brief promises a callback "within the hour, usually five
minutes" — that promise only holds if a human actually sees the lead
immediately. Three options were put to the user:

1. **Telegram bot** — free, instant push notification, ~10-minute setup,
   no business verification (recommended by default).
2. **WhatsApp Business Cloud API** — on-brand since the site is
   WhatsApp-first, but requires Meta Business verification, a dedicated
   phone number, and per-conversation cost past the free tier.
3. **Email only** — simplest, but too slow to reliably hit "five
   minutes."

The user chose **Telegram**.

## Decision

`sendTelegramAlert()` (`src/lib/lead.ts`) posts a formatted message to a
Telegram chat via the Bot API's `sendMessage` endpoint, called from
`/api/lead` after a lead passes validation. It **fails open**: if
`TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` aren't set, or the Telegram API
call itself fails, the lead submission still succeeds and is still
written to `LEADS_KV` (0006) — a notification outage must never look
like a broken contact form to the buyer on the other end.

## Consequences

- Setup is one bot creation (via @BotFather) plus one chat id lookup —
  documented in the README — no Meta Business verification, no
  dedicated phone number.
- If the business later wants WhatsApp-native alerts (e.g. because the
  team lives in WhatsApp day-to-day and doesn't want to check Telegram
  separately), that's a straightforward swap: `sendTelegramAlert`'s
  call site in `/api/lead.ts` is the only place that would change.
- `LEADS_KV` (0006) is the actual durable record; Telegram is
  best-effort notification on top of it, not the source of truth.
