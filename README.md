# fatenava-mcp

**English** | [繁體中文](./README.zh-Hant.md) | [简体中文](./README.zh-Hans.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)

[![fatenava-mcp MCP server](https://glama.ai/mcp/servers/fatenava/fatenava-mcp/badges/score.svg)](https://glama.ai/mcp/servers/fatenava/fatenava-mcp)
[![smithery badge](https://smithery.ai/badge/fatenava/fatenava-mcp)](https://smithery.ai/servers/fatenava/fatenava-mcp)

**Cast BaZi, Zi Wei Dou Shu, and Western astrology natal charts from any MCP-capable AI agent.**

One tool, three deterministic engines, zero setup: no account, no API key, nothing stored.
Powered by the free chart API of [FateNava](https://fatenava.com).

## What it does

Give it a birth (date, time, place, gender) and it returns structured chart data from up to three systems:

| System | What you get |
|---|---|
| **BaZi 八字** (Four Pillars of Destiny) | Four pillars (stems & branches), Day Master, Five-Elements distribution — computed with **True Solar Time** correction from the birthplace longitude |
| **Zi Wei Dou Shu 紫微斗數** (Purple Star Astrology) | Twelve palaces with major stars, Life Palace, transformations |
| **Western natal chart** | Tropical zodiac, Placidus houses: Ascendant, planets by sign/house, elements & modalities |

The numbers are **computed, not AI-generated** — the same birth always produces the same charts. Interpretation is left to your AI agent (or to [FateNava's free reading tools](https://fatenava.com)).

## Quick start

### Claude Code

```bash
claude mcp add fatenava -- npx -y fatenava-mcp
```

### Codex CLI

```toml
# ~/.codex/config.toml
[mcp_servers.fatenava]
command = "npx"
args = ["-y", "fatenava-mcp"]
```

### Cursor / generic MCP client

```json
{
  "mcpServers": {
    "fatenava": {
      "command": "npx",
      "args": ["-y", "fatenava-mcp"]
    }
  }
}
```

## Tool: `cast_chart`

Two ways to describe the birth — pick one:

**1. One-line text** (easiest; the API parses date, time, place and gender, and resolves the city to coordinates + timezone):

```json
{ "text": "1995-08-10 12:00 Taipei female" }
```

City names in English, Chinese, Japanese, or Korean are accepted.

**2. Structured fields**:

```json
{
  "year": 1995, "month": 8, "day": 10, "hour": 12, "minute": 0,
  "gender": "female",
  "longitude": 121.5, "latitude": 25.04, "timeZoneId": "Asia/Taipei"
}
```

Optional:

- `systems`: `["bazi", "ziwei", "astro"]` — pick a subset to keep the response small (default: all three).
- `birthTimeKnown: false` — when the exact hour is unknown. BaZi still returns three pillars; hour-dependent parts are omitted honestly instead of being guessed.

### Response shape

```jsonc
{
  "birth": { "date": "1995-08-10", "time": "12:00", "gender": "female", "place": "…" },
  "timeKnown": true,
  "charts": {
    "bazi":  { "ok": true, "view": { "dayMaster": {…}, "fourPillars": […], … } },
    "ziwei": { "ok": true, "view": { "palaces": […], … } },
    "astro": { "ok": true, "view": { "ascendant": {…}, "bodies": […], … } }
  }
}
```

Field names are English; traditional terms (heavenly stems, earthly branches, palace and star names) come in their native Chinese characters — ask your agent to translate them for the user.

## Notes & principles

- **Free & anonymous.** The underlying endpoint requires no login and stores nothing.
- **Deterministic.** Charts are calculated by tested engines; the AI layer only interprets.
- **Honest about limits.** Unknown birth time degrades gracefully instead of inventing an hour. Charts describe tendencies and themes — not fixed fate. Not medical, legal, or financial advice.
- Learn the concepts: [What is BaZi?](https://fatenava.com/en/articles/what-is-bazi/) · [What is a natal chart?](https://fatenava.com/en/articles/what-is-a-natal-chart/) · [What is Zi Wei Dou Shu?](https://fatenava.com/en/articles/what-is-ziwei/)
- Full readings, compatibility (synastry / 合婚) and AI Q&A: **[fatenava.com](https://fatenava.com)**

## Development

```bash
npm install
npm run build
node dist/index.js   # speaks MCP over stdio
```

`FATENAVA_API_BASE` env var overrides the API origin (for testing).

## License

[MIT](./LICENSE)
