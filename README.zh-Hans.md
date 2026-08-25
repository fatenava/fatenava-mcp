# fatenava-mcp

[English](./README.md) | [繁體中文](./README.zh-Hant.md) | **简体中文** | [日本語](./README.ja.md) | [한국어](./README.ko.md)

**让任何支持 MCP 的 AI Agent 直接排出八字、紫微斗数与西洋占星本命盘。**

一个工具、三套确定性排盘引擎、零门槛:无需账号、无需 API key、不存储任何数据。
由 [FateNava](https://fatenava.com/zh-hans/) 的免费排盘 API 驱动。

## 功能

输入一份出生资料(日期、时间、地点、性别),最多返回三套命盘的结构化数据:

| 体系 | 内容 |
|---|---|
| **八字**(四柱命理) | 四柱干支、日主、五行分布——按出生地经度做**真太阳时**校正 |
| **紫微斗数** | 十二宫与主星、命宫、四化 |
| **西洋占星本命盘** | 回归黄道、Placidus 分宫:上升点、行星落座落宫、元素与模式分布 |

盘面数据为**确定性计算,非 AI 生成**——同一份出生资料永远得到同一张盘。解读交给你的 AI Agent(或 [FateNava 的免费解读工具](https://fatenava.com/zh-hans/))。

## 快速开始

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

### Cursor / 通用 MCP 客户端

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

## 工具:`cast_chart`

出生资料两种写法,二选一:

**1. 单行文本**(最简单;API 自动解析日期、时间、地点与性别,并将城市解析为经纬度+时区):

```json
{ "text": "1995-08-10 12:00 台北 女" }
```

城市名支持中文、英文、日文、韩文。

**2. 结构化字段**:

```json
{
  "year": 1995, "month": 8, "day": 10, "hour": 12, "minute": 0,
  "gender": "female",
  "longitude": 121.5, "latitude": 25.04, "timeZoneId": "Asia/Taipei"
}
```

可选参数:

- `systems`:`["bazi", "ziwei", "astro"]`——只取需要的体系,缩小响应体积(默认全部)。
- `birthTimeKnown: false`——不确定出生时辰时使用。八字仍返回年月日三柱;依赖时辰的部分诚实从缺,不臆造。

### 响应结构

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

字段名为英文;干支、宫位、星曜等传统术语以汉字原文呈现。

## 原则

- **免费且匿名。** 底层端点无需登录、不存储任何数据。
- **确定性。** 盘面由经过测试的引擎计算,AI 只负责解读。
- **诚实面对边界。** 时辰不明时优雅降级而非臆造;命盘描述的是倾向与课题,**不是写定的命运**;不提供医疗、法律或投资建议。
- 概念入门:[八字(四柱)是什么?](https://fatenava.com/zh-hans/articles/what-is-bazi/) · [本命盘是什么?](https://fatenava.com/zh-hans/articles/what-is-a-natal-chart/) · [紫微斗数入门](https://fatenava.com/zh-hans/articles/what-is-ziwei/)
- 深度报告、双人合盘(八字合婚/占星合盘)与 AI 追问:**[fatenava.com](https://fatenava.com/zh-hans/)**

## 开发

```bash
npm install
npm run build
node dist/index.js   # 通过 stdio 提供 MCP 服务
```

环境变量 `FATENAVA_API_BASE` 可覆写 API 来源(测试用)。

## 许可

[MIT](./LICENSE)
