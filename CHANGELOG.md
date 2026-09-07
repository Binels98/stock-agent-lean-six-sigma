# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-09-07

### Added
- Complete DMAIC + COLLABORATE + DECIDE framework implementation
- 19 specialized agents for stock analysis across all phases
- 6 investment philosophy analysts: BlackRock Analyst (Value Investing), ARK Analyst (Growth/Innovation), Momentum Analyst (Trend Following), Contrarian Analyst (Controcorrente), Value Analyst (Sottovalutazione), Growth Analyst (Crescita)
- 3 decision agents: Portfolio Manager (synthesis), Decision Engine (final decisions), Consensus Builder (agreement analysis)
- 3 control agents: Monitor (real-time), Reporter (daily reports), Performance (KPI tracking)
- GitHub Actions workflows for fully automated execution
- Morning report at 08:00 Rome time (06:00 UTC) with previous day summary
- Evening report at 18:00 Rome time (16:00 UTC)
- Extended monitoring window to 22:00 Rome time (20:00 UTC) to cover US market close
- Telegram notifications for alerts, reports, and updates
- Version tracking system with version.json, CHANGELOG.md, and RELEASES.md
- Configuration files: portfolio.json, thresholds.json, weights.json, settings.json
- Report scripts: send-morning-report.js, send-evening-report.js, send-decision-report.js
- Data storage structure: raw, processed, analysis, monitoring
- Comprehensive error handling and logging system

### Changed
- Extended DMAIC framework with COLLABORATE (multi-agent analysis) and DECIDE (decision making) phases
- Updated market hours configuration to close at 22:00 Rome time (20:00 UTC) for US market coverage
- Enhanced reporter to include previous day summary in morning report
- Updated settings.json with complete monitoring (07:00-22:00 UTC) and reporting configuration
- Improved workflow scheduling for all phases to align with market hours
- Enhanced Telegram integration with both message and document sending capabilities
- Updated package.json with all required dependencies including form-data
- Optimized agent concurrency and timeout settings

### Fixed
- Added missing FormData import in lib/common/telegram.js (required for document uploads)
- Fixed REPORT_TYPE environment variable in control.yml (GitHub Actions expression syntax)
- Verified all workflow paths use correct relative paths
- Ensured all workflows have proper error handling and git commit steps

## [1.0.0] - 2026-09-07

### Added
- Initial project structure and architecture
- DMAIC framework foundation (Define, Measure, Analyze, Improve, Control)
- Basic agent architecture and communication system
- Core data collection and storage infrastructure
- Initial Telegram notification system

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 2.0.0 | 2026-09-07 | Complete implementation with all 19 agents, extended monitoring to 22:00, morning/evening reports with previous day summary |
| 1.0.0 | 2026-09-07 | Initial release with basic DMAIC framework |

## How to Update

1. Make changes to the codebase
2. Update version.json with new version number and release notes
3. Update this CHANGELOG.md with detailed changes
4. Update RELEASES.md with technical details
5. Commit changes with message: "Release vX.Y.Z"
6. Push to GitHub

## Release Process

- **Patch (X.X.Z)**: Bug fixes, minor improvements, security updates
- **Minor (X.Y.0)**: New features, backward compatible changes, enhancements
- **Major (X.0.0)**: Breaking changes, major refactoring, architecture changes

---

> Note: This project uses Semantic Versioning for version management.
