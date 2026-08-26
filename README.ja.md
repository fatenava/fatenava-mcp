# fatenava-mcp

[English](./README.md) | [繁體中文](./README.zh-Hant.md) | [简体中文](./README.zh-Hans.md) | **日本語** | [한국어](./README.ko.md)

[![fatenava-mcp MCP server](https://glama.ai/mcp/servers/fatenava/fatenava-mcp/badges/score.svg)](https://glama.ai/mcp/servers/fatenava/fatenava-mcp)

**MCP 対応の AI エージェントから、四柱推命・紫微斗数・西洋占星術の出生図を直接作成。**

1 つのツール、3 つの決定論的エンジン、セットアップ不要:アカウント不要・API キー不要・データは一切保存されません。
[FateNava](https://fatenava.com/ja/) の無料チャート API を利用しています。

## できること

出生情報(日付・時刻・場所・性別)を渡すと、最大 3 体系の構造化チャートデータが返ります:

| 体系 | 内容 |
|---|---|
| **四柱推命**(八字) | 四柱の干支、日主、五行の分布——出生地の経度に基づく**真太陽時**補正つき |
| **紫微斗数** | 十二宮と主星、命宮、四化 |
| **西洋占星術 出生図** | トロピカル方式・Placidus ハウス:上昇点(ASC)、惑星のサイン/ハウス配置、エレメントとモダリティ |

チャートの数値は **AI 生成ではなく決定論的な計算**です——同じ出生情報からは常に同じチャートが得られます。解釈はあなたの AI エージェント(または [FateNava の無料鑑定ツール](https://fatenava.com/ja/))にお任せください。

## クイックスタート

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

### Cursor / 汎用 MCP クライアント

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

## ツール:`cast_chart`

出生情報の指定方法は 2 通り(どちらか一方):

**1. 1 行テキスト**(最も簡単。API が日付・時刻・場所・性別を解析し、都市名から座標とタイムゾーンを解決します):

```json
{ "text": "1995-08-10 12:00 東京 女" }
```

都市名は日本語・英語・中国語・韓国語に対応。

**2. 構造化フィールド**:

```json
{
  "year": 1995, "month": 8, "day": 10, "hour": 12, "minute": 0,
  "gender": "female",
  "longitude": 139.69, "latitude": 35.69, "timeZoneId": "Asia/Tokyo"
}
```

オプション:

- `systems`:`["bazi", "ziwei", "astro"]` ——必要な体系だけ取得してレスポンスを小さく(デフォルトは全部)。
- `birthTimeKnown: false` ——出生時刻が不明な場合。四柱推命は年月日の三柱を返し、時刻に依存する部分は捏造せず正直に省略します。

### レスポンス構造

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

フィールド名は英語、干支・宮・星などの伝統用語は漢字表記で返ります。

## ポリシー

- **無料・匿名。** ログイン不要、データは保存されません。
- **決定論的。** チャートはテスト済みエンジンが計算し、AI は解釈のみを担当。
- **限界に正直。** 出生時刻が不明な場合は推測せず正直に省略します。チャートが描くのは傾向とテーマであり、**決められた運命ではありません**。医療・法律・投資のアドバイスは行いません。
- 入門記事:[四柱推命(八字)とは?](https://fatenava.com/ja/articles/what-is-bazi/) · [出生図とは?](https://fatenava.com/ja/articles/what-is-a-natal-chart/) · [紫微斗数入門](https://fatenava.com/ja/articles/what-is-ziwei/)
- 詳細鑑定・相性診断(四柱推命の相性/シナストリー)・AI への追加質問:**[fatenava.com](https://fatenava.com/ja/)**

## 開発

```bash
npm install
npm run build
node dist/index.js   # stdio で MCP を提供
```

環境変数 `FATENAVA_API_BASE` で API のオリジンを上書きできます(テスト用)。

## ライセンス

[MIT](./LICENSE)
