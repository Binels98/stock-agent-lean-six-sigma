# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-09-07

### Added
- Complete DMAIC + COLLABORATE + DECIDE framework implementation
- 19 specialized agents for stock analysis
- 6 investment philosophy analysts (BlackRock, ARK, Momentum, Contrarian, Value, Growth)
- 3 decision agents (Portfolio Manager, Decision Engine, Consensus Builder)
- 3 control agents (Monitor, Reporter, Performance)
- GitHub Actions workflows for automated execution
- Morning report at 08:00 Rome time with previous day summary
- Evening report at 18:00 Rome time
- Extended monitoring window to 22:00 Rome time (20:00 UTC) for US market close
- Telegram notifications for alerts and reports
- Version tracking system with version.json, CHANGELOG.md, RELEASES.md
- Configuration files: portfolio.json, thresholds.json, weights.json, settings.json
- Report scripts: send-morning-report.js, send-evening-report.js, send-decision-report.js

### Changed
- Extended DMAIC framework with COLLABORATE and DECIDE phases
- Updated market hours to close at 22:00 Rome time (20:00 UTC)
- Enhanced reporter to include previous day summary in morning report
- Updated settings.json with complete monitoring and reporting configuration
- Improved workflow scheduling for all phases

### Fixed
- Added missing FormData import in lib/common/telegram.js
- Fixed REPORT_TYPE environment variable in control.yml
- Verified all workflow paths use correct relative paths
- Extended monitor.yml schedule to 7-22 UTC to cover US market close

## [1.0.0] - 2026-09-07

### Added
- Initial project structure
- DMAIC framework foundation
- Basic agent architecture

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 2.0.0 | 2026-09-07 | Complete implementation with all agents and extended monitoring |
| 1.0.0 | 2026-09-07 | Initial release |

## Release Process
- Patch (X.X.Z): Bug fixes, minor improvements
- Minor (X.Y.0): New features, backward compatible
- Major (X.0.0): Breaking changes, major refactoring