# Releases

This document tracks all releases with technical details, performance metrics, and deployment information.

## Release v2.0.0

**Date:** 2026-09-07  
**Status:** Current Release  
**Commit:** (to be filled on first commit)  
**Tag:** v2.0.0

### Technical Details

#### System Architecture
- **Framework:** Lean Six Sigma DMAIC + COLLABORATE + DECIDE
- **Agents:** 19 specialized agents
- **Execution:** GitHub Actions (no local setup required)
- **Scheduling:**
  - DEFINE phase: 05:00 UTC (07:00 Rome)
  - MEASURE phase: 05:30 UTC (07:30 Rome)
  - ANALYZE phase: 06:15 UTC (08:15 Rome)
  - IMPROVE phase: 07:00 UTC (09:00 Rome)
  - COLLABORATE phase: 07:30 UTC (09:30 Rome)
  - DECIDE phase: 08:00 UTC (10:00 Rome)
  - CONTROL phase: 07:00-20:00 UTC (09:00-22:00 Rome) every 5 minutes
  - Morning report: 06:00 UTC (08:00 Rome) with previous day summary
  - Evening report: 16:00 UTC (18:00 Rome)

#### Agents Implemented

**Define Phase:**
- [x] Calendar Agent - Scheduling and trigger management
- [x] Definer Agent - Portfolio definition and daily objectives

**Measure Phase:**
- [x] Scanner Agent - Market scanning and interesting stock identification
- [x] Data Collector Agent - Fundamental, technical, and news data collection
- [x] Quality Agent - Data validation and quality control

**Analyze Phase:**
- [x] Analyzer Agent - Complete analysis (fundamental, technical, qualitative)
- [x] News Agent - News analysis, sentiment, event-driven analysis
- [x] Risk Agent - Risk assessment (Altman Z-Score, Beneish M-Score)

**Improve Phase:**
- [x] Improvement Agent - Buy/sell suggestions generation
- [x] Optimization Agent - Portfolio optimization (Markowitz)

**Collaborate Phase:**
- [x] BlackRock Analyst - Value investing (solid fundamentals, stability, dividends)
- [x] ARK Analyst - Growth/innovation (disruptive technology, future megatrends)
- [x] Momentum Analyst - Trend following (price momentum, volume, relative strength)
- [x] Contrarian Analyst - Contrarian (buy when others sell)
- [x] Value Analyst - Undervaluation (low P/E, low P/B, attractive DCF)
- [x] Growth Analyst - Growth (revenue growth, EPS growth, expanding margins)

**Decide Phase:**
- [x] Portfolio Manager - Synthesizes all analyses, creates decision table
- [x] Decision Engine - Applies decision rules, generates final decisions
- [x] Consensus Builder - Identifies areas of agreement/disagreement

**Control Phase:**
- [x] Monitor Agent - Real-time monitoring, alerts (07:00-20:00 UTC = 09:00-22:00 Rome)
- [x] Reporter Agent - Report generation (morning and evening)
- [x] Performance Agent - Performance evaluation, system KPIs

#### Configuration Files
- [x] config/settings.json - System settings, market hours, monitoring intervals
- [x] config/portfolio.json - Portfolio stocks and watchlist
- [x] config/thresholds.json - Critical and technical thresholds
- [x] config/weights.json - Scoring and analyst weights

#### GitHub Actions Workflows
- [x] .github/workflows/define.yml - DEFINE phase execution
- [x] .github/workflows/measure.yml - MEASURE phase execution
- [x] .github/workflows/analyze.yml - ANALYZE phase execution
- [x] .github/workflows/improve.yml - IMPROVE phase execution
- [x] .github/workflows/collaborate.yml - COLLABORATE phase execution
- [x] .github/workflows/decide.yml - DECIDE phase execution
- [x] .github/workflows/control.yml - CONTROL phase execution (monitoring + reporting)
- [x] .github/workflows/monitor.yml - Real-time monitoring (07:00-20:00 UTC = 09:00-22:00 Rome)

#### Scripts
- [x] scripts/send-morning-report.js - Morning report with previous day summary
- [x] scripts/send-evening-report.js - Evening report
- [x] scripts/send-decision-report.js - Decision report

#### Key Features

1. **Multi-Agent Analysis:** 6 different investment philosophies provide diverse perspectives
2. **Automated Scheduling:** All phases run automatically via GitHub Actions
3. **Extended Monitoring:** Market monitoring every 5 minutes from 09:00 to 22:00 Rome time (US market close)
4. **Morning Report:** Generated at 08:00 Rome time with previous day summary
5. **Evening Report:** Generated at 18:00 Rome time
6. **Telegram Notifications:** Alerts and reports sent to Telegram
7. **Version Tracking:** Automatic version management with CHANGELOG and RELEASES
8. **Portfolio Management:** Track and optimize your stock portfolio
9. **Decision Table:** Portfolio Manager creates comparison table for user decision-making
10. **Consensus Building:** Identifies agreement and disagreement among analysts

#### Performance Metrics
- **Execution Time:** ~30 minutes for full daily cycle
- **Data Sources:** StockAnalysis.com, Investing.com, TradingView, Financial Modeling Prep
- **Notification Latency:** < 1 minute for critical alerts
- **Report Generation:** < 5 minutes for complete reports

#### Dependencies
- Node.js: >= 18.0.0
- NPM Packages: axios, luxon, cheerio, node-cron
- External APIs: FMP, Alpha Vantage, Investing.com, TradingView (optional)

#### Environment Variables (GitHub Secrets)
- TELEGRAM_BOT_TOKEN (required)
- TELEGRAM_CHAT_ID (required)
- FMP_API_KEY (optional)
- ALPHA_VANTAGE_KEY (optional)
- INVESTING_COM_KEY (optional)
- TRADINGVIEW_KEY (optional)
- TIMEZONE (default: Europe/Rome)

### Deployment Instructions

1. Create new GitHub repository: stock-agent-lean-six-sigma
2. Push all files to the repository
3. Go to Settings > Secrets and variables > Actions
4. Add required secrets (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
5. Add optional API keys as needed
6. Enable GitHub Actions workflows
7. First run will start automatically at next scheduled time

### Update Instructions

1. Make code changes
2. Update version.json
3. Update CHANGELOG.md
4. Update RELEASES.md
5. Commit with message: "Release vX.Y.Z - [description]"
6. Push to GitHub
7. Tag the commit: git tag vX.Y.Z
8. Push tags: git push --tags

### Rollback Instructions

1. Identify the commit hash of the working version
2. Create a new branch from that commit
3. Merge the branch to main
4. Push to GitHub

---

## Release v1.0.0

**Date:** 2026-09-07  
**Status:** Initial Release  
**Commit:** (to be filled on first commit)  
**Tag:** v1.0.0

### Technical Details

#### System Architecture
- **Framework:** Lean Six Sigma DMAIC
- **Agents:** Basic agent architecture
- **Execution:** GitHub Actions

---

## Version Index

| Version | Date | Status | Tag |
|---------|------|--------|-----|
| 2.0.0 | 2026-09-07 | Current Release | v2.0.0 |
| 1.0.0 | 2026-09-07 | Initial Release | v1.0.0 |