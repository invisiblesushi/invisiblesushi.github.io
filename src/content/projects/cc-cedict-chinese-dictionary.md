---
title: "CC-CEDICT Dictionary Sorter & SQLite Pipeline"
description: "A high-performance .NET 8 data pipeline that parses, deduplicates, and heuristically ranks Chinese-English dictionary definitions into an optimized SQLite database for mobile applications."
publishDate: "2024-05-22"
tags: ["C#", ".NET 8", "SQLite", "Data Pipeline", "Algorithms", "Android Support"]
githubUrl: "https://github.com/invisiblesushi/CC-CEDICT-Chinese-Dictionary-English-Glossary-Frequency-Sorter"
featured: true
order: 2
---

## Overview

When developing a responsive Chinese-English dictionary for mobile devices, raw open-source datasets like [CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cedict) present significant challenges: unsorted definitions, archaic linguistic metadata dominating first positions, duplicate headwords, and numbered pinyin instead of tone marks.

This project is a high-performance **.NET 8 console pipeline** engineered to clean, rank, and index the entire CC-CEDICT database into a single, indexed SQLite file ready for instant lookups in an Android app.

## Architecture & Technical Highlights

- **Language & Runtime**: C#, .NET 8 SDK
- **Data Persistence**: SQLite with targeted single-column and composite indexes
- **Architecture**: Modular separation with clear boundaries for Configuration (`appsettings.json`), Parsing, Ranking (`GlossScorer`), and Storage (`SqliteWriter`)
- **Memory Efficiency**: Streaming parser processing large text exports (`cedict_ts.u8`) without loading unnecessary object graphs into memory

## Key Engineering Solutions

### 1. Heuristic Gloss Ranking (`GlossScorer`)
In raw CC-CEDICT, secondary metadata (e.g., surname indicators, classifier tags like `CL:`, or rare archaic variants) frequently appears as the primary definition. 

A custom heuristic scoring engine scores each gloss in `[0, 1]` using a weighted formula:
```text
Score = Base (0.50) + simplicity + position + POS bonus − penalties
```
- **Simplicity Bonus**: Favors concise, everyday meanings (1 word: `+0.18`, 2 words: `+0.10`).
- **Position Weight**: Preserves original editorial intent with decay (`1st +0.10`, `2nd +0.06`, `3rd +0.03`).
- **Part of Speech Boost**: Boosts verbs starting with `to ` (`+0.08`) and common nouns (`+0.06`).
- **Metadata Penalties**: Heavily discounts technical annotations (`variant of`, `archaic`, `surname`, `classifier`) with `-0.25` to `-0.80` penalties.

### 2. Canonical Simplified Deduplication
Certain Chinese characters share identical simplified forms for distinct traditional variants (for example, `玩/玩` vs `玩/翫`). 

To prevent ambiguous duplicate search results in mobile keyboards, the tool identifies the highest-scoring primary row and zeroes out `simplified = ""` on secondary rows. Queries filtering `WHERE simplified = '玩'` cleanly return the single primary entry, while traditional lookups retain full integrity.

### 3. Diacritic Tone Mark Transformation
Converts raw numbered phonetic representations (`ni3 hao3`) into accurate Unicode tone diacritics (`nǐ hǎo`) across multi-syllable compound words.

### 4. Optimized SQLite Indexing
Generates composite unique indexes over `(simplified, traditional)` and index structures for `traditional` and `simplified` columns, ensuring sub-millisecond retrieval on resource-constrained mobile hardware.
