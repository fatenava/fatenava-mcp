# fatenava-mcp

[English](./README.md) | [繁體中文](./README.zh-Hant.md) | [简体中文](./README.zh-Hans.md) | [日本語](./README.ja.md) | **한국어**

[![fatenava-mcp MCP server](https://glama.ai/mcp/servers/fatenava/fatenava-mcp/badges/score.svg)](https://glama.ai/mcp/servers/fatenava/fatenava-mcp)
[![smithery badge](https://smithery.ai/badge/fatenava/fatenava-mcp)](https://smithery.ai/servers/fatenava/fatenava-mcp)

**MCP를 지원하는 어떤 AI 에이전트에서든 사주(팔자)·자미두수·서양 점성술 출생 차트를 바로 뽑아 보세요.**

하나의 도구, 세 가지 결정론적 엔진, 설정 제로: 계정 불필요, API 키 불필요, 어떤 데이터도 저장하지 않습니다.
[FateNava](https://fatenava.com/ko/?utm_source=fatenava-mcp&utm_medium=readme)의 무료 차트 API로 구동됩니다.

## 기능

출생 정보(날짜·시각·장소·성별)를 입력하면 최대 세 체계의 구조화된 차트 데이터를 반환합니다:

| 체계 | 내용 |
|---|---|
| **사주(팔자)** | 사주 간지, 일간, 오행 분포——출생지 경도 기반 **진태양시** 보정 |
| **자미두수** | 십이궁과 주성, 명궁, 사화 |
| **서양 점성술 출생 차트** | 트로피컬 방식·Placidus 하우스: 상승점(ASC), 행성의 별자리/하우스 배치, 원소와 모달리티 |

차트 수치는 **AI 생성이 아닌 결정론적 계산**입니다——같은 출생 정보는 언제나 같은 차트를 냅니다. 해석은 당신의 AI 에이전트(또는 [FateNava의 무료 풀이 도구](https://fatenava.com/ko/?utm_source=fatenava-mcp&utm_medium=readme))에 맡기세요.

## 빠른 시작

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

### Cursor / 일반 MCP 클라이언트

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

## 도구: `cast_chart`

출생 정보는 두 가지 방식 중 하나로 지정합니다:

**1. 한 줄 텍스트**(가장 간단. API가 날짜·시각·장소·성별을 해석하고 도시명을 좌표+시간대로 변환):

```json
{ "text": "1995-08-10 12:00 서울 여" }
```

도시명은 한국어·영어·중국어·일본어를 지원합니다.

**2. 구조화 필드**:

```json
{
  "year": 1995, "month": 8, "day": 10, "hour": 12, "minute": 0,
  "gender": "female",
  "longitude": 126.98, "latitude": 37.57, "timeZoneId": "Asia/Seoul"
}
```

선택 파라미터:

- `systems`: `["bazi", "ziwei", "astro"]` —— 필요한 체계만 받아 응답을 줄입니다(기본값: 전부).
- `birthTimeKnown: false` —— 정확한 태어난 시각을 모를 때. 사주는 연·월·일 세 기둥을 반환하고, 시각에 의존하는 부분은 지어내지 않고 정직하게 생략합니다.

### 응답 구조

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

필드명은 영어이며, 간지·궁·별 등 전통 용어는 한자 원문으로 반환됩니다.

## 원칙

- **무료·익명.** 로그인 불필요, 아무것도 저장하지 않습니다.
- **결정론적.** 차트는 검증된 엔진이 계산하고 AI는 해석만 담당합니다.
- **한계에 정직.** 태어난 시각을 모르면 추측하는 대신 정직하게 생략합니다. 차트가 그리는 것은 경향과 과제이지 **정해진 운명이 아닙니다**. 의료·법률·투자 조언은 하지 않습니다.
- 개념 입문: [사주(팔자)란?](https://fatenava.com/ko/articles/what-is-bazi/?utm_source=fatenava-mcp&utm_medium=readme) · [출생 차트란?](https://fatenava.com/ko/articles/what-is-a-natal-chart/?utm_source=fatenava-mcp&utm_medium=readme) · [자미두수 입문](https://fatenava.com/ko/articles/what-is-ziwei/?utm_source=fatenava-mcp&utm_medium=readme)
- 심층 리포트·궁합(사주 궁합/시너스트리)·AI 추가 질문: **[fatenava.com](https://fatenava.com/ko/?utm_source=fatenava-mcp&utm_medium=readme)**

## 개발

```bash
npm install
npm run build
node dist/index.js   # stdio로 MCP 제공
```

환경 변수 `FATENAVA_API_BASE`로 API 오리진을 바꿀 수 있습니다(테스트용).

## 라이선스

[MIT](./LICENSE)
