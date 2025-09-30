# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is an Observable Framework application for Swiss ecosystem monitoring. Key development commands:

- `npm run dev` - Start local preview server on http://localhost:3000
- `npm run build` - Build static site to ./dist directory
- `npm run deploy` - Deploy app to Observable
- `npm run clean` - Clear local data loader cache
- `npm install` - Install/reinstall dependencies

## Architecture

This is a data visualization dashboard built with Observable Framework, focusing on Swiss innovation and entrepreneurship metrics with international benchmarking.

### Core Structure
- **Observable Framework**: Static site generator optimized for data apps with reactive JavaScript
- **File-based routing**: Pages in `src/` directory map directly to URLs
- **Data loaders**: Files in `src/data/` handle data processing and transformation
- **Reusable components**: Shared JavaScript modules in `src/components/`

### Key Components
- **Plot library**: Uses `@observablehq/plot` for all visualizations
- **Data processing**: `arquero` for data manipulation, similar to pandas/dplyr
- **Styling**: Custom CSS with Observable's design system
- **Interactive elements**: `d3` for advanced interactions, `slim-select` for dropdowns

### Application Structure
- **International benchmarking** section with 5 main areas:
  - Research & Development (`a_rnd.md`)
  - Entrepreneurship and Start-ups (`b_ens.md`) 
  - Innovation Activities (`c_inno.md`)
  - Knowledge and Technology Transfer (`d_ktt.md`)
  - Sustainability and High-tech Exports (`e_snd.md`)
- **National topics** covering innovation reports, investor analysis, and unicorn tracking

### Component Organization
- `src/components/plots/`: Reusable chart functions (line plots, bar charts, sankey diagrams)
- `src/components/utils/`: Utility functions for colors, country mappings, label positioning
- Data files mix static CSV/JSON with dynamic `.js` loaders for real-time processing

### Configuration
- `observablehq.config.js` defines navigation structure, theming, and build settings
- Pages are markdown files with embedded JavaScript for interactive visualizations
- Custom color schemes and country mappings centralized in utils

### Data Sources
Primarily OECD, Eurostat, and Swiss innovation survey data with automated processing pipelines for regular updates.