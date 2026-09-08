---
title: "HanziLens: On-Device Chinese OCR & Live Pinyin Overlay"
description: "A real-time Android computer vision application built with Kotlin, Jetpack Compose, CameraX, and on-device ML Kit OCR that projects tone-marked pinyin pronunciations and instant CC-CEDICT dictionary lookups over physical text."
publishDate: "2026-03-18"
tags: ["Android", "Kotlin", "Jetpack Compose", "ML Kit OCR", "CameraX", "Room DB", "Computer Vision", "CC-CEDICT"]
githubUrl: "https://github.com/invisiblesushi/HanziLens-OCR-Android"
featured: false
order: 5
---

## Overview

**HanziLens** is an Android computer vision application designed to assist Mandarin Chinese learners in reading physical Chinese text in real time. By pointing the smartphone camera at restaurant menus, street signs, transit boards, or books, the app recognizes Chinese characters on the video stream and dynamically aligns tone-marked pinyin pronunciations directly above the detected glyphs.

The application operates with a strict **offline-first** design: all image processing, character recognition, word segmentation, and lexical lookups occur on-device without cloud dependencies, API keys, or cellular data requirements.

## Architecture & Technical Stack

- **Platform & Language**: Android (Min SDK 26+), Kotlin 2.0+
- **UI Framework**: Modern Jetpack Compose with declarative design, Material 3 theming, and smooth animations
- **Camera Pipeline**: Android Jetpack CameraX (`PreviewView`, `ImageAnalysis`, `CameraSelector`)
- **Machine Learning & OCR**: Google ML Kit On-Device Chinese Text Recognition (`mlkit:text-recognition-chinese`)
- **Data Persistence**: Two-tier caching combining SQLite via Android Room (`hanzilens.db`) with a high-speed compact binary disk cache
- **Dictionary Dataset**: [CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cedict) (120,000+ entries) with tone-marked Unicode diacritics
- **Audio & Accessibility**: Android Text-To-Speech (`TextToSpeechHelper`) for native Mandarin pronunciation synthesis

## Core Engineering Highlights

### 1. High-Performance Frame Analysis & Throttling
Analyzing live video streams using computer vision models is computationally demanding and can cause device thermal throttling and UI stutter if unmanaged:
- **Zero-Allocation Pipeline**: Configured CameraX's `ImageAnalysis` with `STRATEGY_KEEP_ONLY_LATEST`, automatically dropping stale frames whenever downstream recognition is busy.
- **Volatile Software Throttling**: Implemented an atomic, time-gated throttle within `OcrAnalyzer` that skips frames faster than the configured threshold (e.g., 500–1000ms), reducing CPU/GPU overhead while maintaining smooth UI rendering.
- **Sensor Rotation Normalization**: Evaluates `ImageProxy.imageInfo.rotationDegrees` dynamically to transpose bounding boxes between portrait, landscape, and inverted orientations.

### 2. Precise Bounding Box Projection (`CoordinateMapper`)
Camera sensor buffers rarely match device display aspect ratios:
- Raw image frames from the sensor (e.g., 1080×1920) must be mapped onto the `PreviewView` layout dimensions without drift.
- Engineered `CoordinateMapper` to compute scale factors, letterbox offsets, and crop boundaries (`FILL_CENTER`), guaranteeing that live pinyin labels sit squarely on top of detected character clusters.

### 3. Two-Tier Lexical Retrieval & Binary Caching
Querying traditional relational databases during live frame analysis introduces unnecessary query overhead. HanziLens employs a high-performance two-tier architecture:
- **Tier 1 (Relational Room DB)**: On initial installation, the raw `cedict_ts.u8` archive is parsed in streaming chunks (500 entries per batch) into a local Room database (`hanzilens.db`), storing full simplified, traditional, pinyin, and English definitions.
- **Tier 2 (Compact Binary Cache)**: The repository generates a compact binary index (`pinyin_cache.bin` ~2 MB) with length-prefixed bytes `[wordLen + wordBytes + pinyinLen + pinyinBytes]`.
- **Sub-200ms Warm Starts**: On subsequent app launches, the binary index loads directly into an in-memory `HashMap<String, String>` in under 200ms. Live camera frames perform instant in-memory segmentation without touching disk I/O.

### 4. Interactive UX, ROI Box & Freeze-Frame Mode
- **Region of Interest (ROI)**: An on-screen resizable viewfinder overlay allows users to isolate specific paragraphs or signs, excluding background visual clutter.
- **Freeze-Frame Inspection**: Users can freeze the live camera at any moment. The app locks the frame, executes a high-resolution OCR pass, breaks lines into compound words using greedy maximum-matching algorithms, and surfaces an interactive bottom sheet.
- **Deep Word Lookup & TTS**: Tapping any recognized word expands its detailed definition and triggers Chinese speech synthesis via Android's native TTS engine.
