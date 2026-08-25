# fatenava-mcp

[English](./README.md) | **繁體中文** | [简体中文](./README.zh-Hans.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)

**讓任何支援 MCP 的 AI Agent 直接排出八字、紫微斗數與西洋占星本命盤。**

一個工具、三套確定性排盤引擎、零門檻：無需帳號、無需 API key、不儲存任何資料。
由 [FateNava](https://fatenava.com/zh-hant/) 的免費排盤 API 驅動。

## 功能

輸入一份出生資料（日期、時間、地點、性別），最多回傳三套命盤的結構化資料：

| 體系 | 內容 |
|---|---|
| **八字**（四柱命理） | 四柱干支、日主、五行分布——依出生地經度做**真太陽時**校正 |
| **紫微斗數** | 十二宮與主星、命宮、四化 |
| **西洋占星本命盤** | 回歸黃道、Placidus 分宮：上升點、行星落座落宮、元素與模式分布 |

盤面數據為**確定性計算，非 AI 生成**——同一份出生資料永遠得到同一張盤。解讀交給你的 AI Agent（或 [FateNava 的免費解讀工具](https://fatenava.com/zh-hant/)）。

## 快速開始

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

### Cursor / 通用 MCP 客戶端

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

## 工具：`cast_chart`

出生資料兩種寫法，二選一：

**1. 單行文字**（最簡單；API 自動解析日期、時間、地點與性別，並將城市解析為經緯度＋時區）：

```json
{ "text": "1995-08-10 12:00 台北 女" }
```

城市名支援中文、英文、日文、韓文。

**2. 結構化欄位**：

```json
{
  "year": 1995, "month": 8, "day": 10, "hour": 12, "minute": 0,
  "gender": "female",
  "longitude": 121.5, "latitude": 25.04, "timeZoneId": "Asia/Taipei"
}
```

可選參數：

- `systems`：`["bazi", "ziwei", "astro"]` ——只取需要的體系，縮小回應體積（預設全部）。
- `birthTimeKnown: false` ——不確定出生時辰時使用。八字仍回傳年月日三柱；依賴時辰的部分誠實從缺，不臆造。

### 回應結構

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

欄位名為英文；干支、宮位、星曜等傳統術語以漢字原文呈現。

## 原則

- **免費且匿名。** 底層端點無需登入、不儲存任何資料。
- **確定性。** 盤面由經過測試的引擎計算，AI 只負責解讀。
- **誠實面對邊界。** 時辰不明時優雅降級而非臆造；命盤描述的是傾向與課題，**不是寫定的命運**；不提供醫療、法律或投資建議。
- 概念入門：[八字（四柱）是什麼？](https://fatenava.com/zh-hant/articles/what-is-bazi/) · [本命盤是什麼？](https://fatenava.com/zh-hant/articles/what-is-a-natal-chart/) · [紫微斗數入門](https://fatenava.com/zh-hant/articles/what-is-ziwei/)
- 深度報告、雙人合盤（八字合婚／占星合盤）與 AI 追問：**[fatenava.com](https://fatenava.com/zh-hant/)**

## 開發

```bash
npm install
npm run build
node dist/index.js   # 透過 stdio 提供 MCP 服務
```

環境變數 `FATENAVA_API_BASE` 可覆寫 API 來源（測試用）。

## 授權

[MIT](./LICENSE)
