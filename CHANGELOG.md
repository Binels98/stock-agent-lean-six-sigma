# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-09-07

### Added
- Complete DMAIC + COLLABORATE + DECIDE framework implementation
- 19 specialized agents for stock analysis
- 6 investment philosophy analysts (BlackRock, ARK, Momentum, Contrarian, Value, Growth)
- Portfolio Manager for multi-analyst synthesis
- Decision Engine for final decision making
- Consensus Builder for agreement/disagreement identification
- GitHub Actions workflows for automated execution
- Morning report at 08:00 Rome time with previous day summary
- Extended monitoring window to 22:00 Rome time (US market close at 20:00 UTC)
- Telegram notifications for alerts and reports
- Version tracking system with version.json, CHANGELOG.md, and RELEASES.md
- Configuration files for portfolio, thresholds, and weights
- Scripts for morning, evening, and decision reports

### Changed
- Extended DMAIC framework with COLLABORATE and DECIDE phases
- Updated market hours to close at 22:00 for US market (20:00 UTC)
- Enhanced reporter to include previous day summary in morning report
- Updated settings.json with complete monitoring and reporting configuration
- Improved workflow scheduling for all phases

### Fixed
- Initial implementation - no bugs to report

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

## How to Update

1. Make changes to the codebase
2. Update version.json with new version number
3. Update this CHANGELOG.md with changes
4. Update RELEASES.md with technical details
5. Commit changes with message: "Release vX.Y.Z"
6. Push to GitHub

## Release Process

- **Patch (X.X.Z)**: Bug fixes, minor improvements
- **Minor (X.Y.0)**: New features, backward compatible
- **Major (X.0.0)**: Breaking changes, major refactoring