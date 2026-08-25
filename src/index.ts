#!/usr/bin/env node
/**
 * fatenava-mcp — MCP server for casting destiny charts via the free FateNava API.
 *
 * Three deterministic engines behind one tool:
 *   - BaZi (Four Pillars of Destiny, 八字) with True Solar Time correction
 *   - Zi Wei Dou Shu (Purple Star Astrology, 紫微斗數)
 *   - Western astrology natal chart (tropical zodiac, Placidus houses)
 *
 * The API is free and anonymous: no account, no API key, nothing is stored.
 * Charts are computed deterministically from birth data — the numbers are not
 * AI-generated. Interpretation is left to the calling model.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_BASE = process.env.FATENAVA_API_BASE ?? 'https://fatenava.com';
const COMPUTE_URL = `${API_BASE}/api/chart/compute`;
const VERSION = '0.1.0';

const SYSTEMS = ['bazi', 'ziwei', 'astro'] as const;
type System = (typeof SYSTEMS)[number];

// ── input schema ────────────────────────────────────────────────────────────
// Two ways to specify a birth (exactly one is required):
//   1. `text`  — one free-form line, e.g. "1995-08-10 12:00 Taipei female".
//                The API parses the date, time, place (geocoding + timezone)
//                and gender from it.
//   2. structured fields — explicit date/time/gender plus coordinates.
const inputShape = {
  text: z
    .string()
    .min(4)
    .max(200)
    .optional()
    .describe(
      'One-line birth description: date, time (or omit if unknown), birthplace, gender. ' +
        'Example: "1995-08-10 12:00 Taipei female". City names in English, Chinese, Japanese or Korean are accepted. ' +
        'Use EITHER this field OR the structured fields below.',
    ),
  year: z.number().int().min(1).max(9999).optional().describe('Birth year (structured input)'),
  month: z.number().int().min(1).max(12).optional(),
  day: z.number().int().min(1).max(31).optional(),
  hour: z.number().int().min(0).max(23).optional().describe('Birth hour 0-23; pass with birthTimeKnown=false if unknown'),
  minute: z.number().int().min(0).max(59).optional(),
  birthTimeKnown: z
    .boolean()
    .optional()
    .describe('Set false when the exact birth time is unknown — BaZi still returns three pillars; hour-dependent parts are omitted honestly'),
  gender: z.enum(['male', 'female']).optional().describe('Required with structured input'),
  longitude: z.number().min(-180).max(180).optional().describe('Birthplace longitude (structured input); used for True Solar Time correction'),
  latitude: z.number().min(-90).max(90).optional(),
  timeZoneId: z.string().optional().describe('IANA timezone of the birthplace, e.g. "Asia/Taipei" (structured input)'),
  systems: z
    .array(z.enum(SYSTEMS))
    .optional()
    .describe('Which chart systems to return: "bazi", "ziwei", "astro". Default: all three.'),
};

// ── helpers ─────────────────────────────────────────────────────────────────
type Json = Record<string, unknown>;

function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true };
}

async function callCompute(body: Json): Promise<{ status: number; data: Json }> {
  const res = await fetch(COMPUTE_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': `fatenava-mcp/${VERSION}`,
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Json;
  return { status: res.status, data };
}

// ── server ──────────────────────────────────────────────────────────────────
const server = new McpServer({ name: 'fatenava-mcp', version: VERSION });

server.registerTool(
  'cast_chart',
  {
    title: 'Cast destiny charts (BaZi / Zi Wei / Western astrology)',
    description:
      'Cast up to three deterministic destiny charts from one birth: BaZi (Four Pillars, with True Solar Time correction), ' +
      'Zi Wei Dou Shu (Purple Star Astrology), and a Western natal chart (tropical zodiac, Placidus houses). ' +
      'Free and anonymous — no account, nothing stored. ' +
      'Input is either a one-line `text` birth description, or structured fields (year/month/day/hour/minute + gender + longitude/latitude + timeZoneId). ' +
      'Returns structured JSON per system: field names in English; traditional terms (stems & branches, palace and star names) in their native Chinese characters — translate them for the user as needed. ' +
      'The chart data is computed, not AI-generated; interpretation is up to you. Full reading tools at https://fatenava.com',
    inputSchema: inputShape,
  },
  async (args) => {
    // Build the API request: text path or structured path.
    let body: Json;
    if (args.text) {
      body = { text: args.text };
    } else {
      const required = ['year', 'month', 'day', 'gender', 'longitude', 'latitude'] as const;
      const missing = required.filter((k) => args[k] === undefined);
      if (missing.length > 0) {
        return errorResult(
          `Missing required structured fields: ${missing.join(', ')}. ` +
            'Either pass a one-line `text` birth description, or provide year/month/day (+hour/minute), gender, longitude, latitude and ideally timeZoneId.',
        );
      }
      body = {
        year: args.year,
        month: args.month,
        day: args.day,
        hour: args.hour ?? 12,
        minute: args.minute ?? 0,
        birthTimeKnown: args.birthTimeKnown ?? (args.hour !== undefined),
        gender: args.gender,
        longitude: args.longitude,
        latitude: args.latitude,
        ...(args.timeZoneId ? { timeZoneId: args.timeZoneId } : {}),
      };
    }

    let status: number;
    let data: Json;
    try {
      ({ status, data } = await callCompute(body));
    } catch (err) {
      return errorResult(`Network error calling FateNava API: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (status === 422) {
      return errorResult(
        `The API could not understand the birth input (HTTP 422): ${JSON.stringify(data)}. ` +
          'Check the date/time format and that the birthplace is a recognizable city.',
      );
    }
    if (status !== 200) {
      return errorResult(`FateNava API returned HTTP ${status}: ${JSON.stringify(data).slice(0, 300)}`);
    }

    // Trim to requested systems; pass through slot errors honestly.
    const wanted: readonly System[] = args.systems && args.systems.length > 0 ? args.systems : SYSTEMS;
    const charts: Json = {};
    for (const s of wanted) charts[s] = data[s] ?? { ok: false, reason: 'missing from API response' };

    const result = {
      birth: data.birth,
      timeKnown: data.timeKnown,
      charts,
      _source: {
        provider: 'FateNava',
        url: 'https://fatenava.com',
        note: 'Deterministic chart computation (not AI-generated). Free full readings and AI interpretation at the website.',
      },
    };
    return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
