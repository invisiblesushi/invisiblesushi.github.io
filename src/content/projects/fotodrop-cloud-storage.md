---
title: "FotoDrop: Live Photo Cloud Storage & Tethered Event Streaming"
description: "A photo cloud storage and live distribution platform built with C# and .NET 8 using Cloudflare R2 object storage, decoupled background worker services, and real-time USB-tethered camera streaming for instantaneous live event delivery."
publishDate: "2026-05-31"
tags: ["C#", ".NET 8", "Cloudflare R2", "Worker Services", "Image Processing", "Docker", "Android", "Closed Source"]
isClosedSource: true
inProgress: true
order: 4
---

## Overview

In traditional event photography—weddings, corporate galas, conferences, and sports tournaments—attendees often wait days or weeks for edited galleries. **FotoDrop** eliminates this bottleneck by transforming cameras into live cloud broadcast devices: photographs taken by a professional camera appear in a live guest gallery within seconds.

The platform combines a companion Android mobile application (built on a custom USB-OTG camera tethering engine) with a distributed **C# / .NET 8 backend**, **Cloudflare R2 object storage**, and an asynchronous **ImageSharp background worker** pipeline.

## System Architecture

```text
┌─────────────────┐       USB-OTG / PTP       ┌────────────────────────┐
│  DSLR / Camera  │ ────────────────────────> │ Android Companion App  │
└─────────────────┘                           └────────────────────────┘
                                                           │
                                            HTTPS Upload   │ (Immediate ACK)
                                                           v
                                              ┌────────────────────────┐
                                              │  FotoDrop Web API      │
                                              │    (ASP.NET Core 8)    │
                                              └────────────────────────┘
                                                           │
                                       Local Staging Buffer│  (Atomic enqueue)
                                                           v
┌────────────────────────┐   Async Poll / Batch   ┌────────────────────────┐
│   Cloudflare R2 CDN    │ <───────────────────── │ PhotoProcessingWorker  │
│ (Zero-Egress Storage)  │   Upload Renditions    │  (SixLabors ImageSharp)│
└────────────────────────┘                        └────────────────────────┘
            │                                                  │
            │ Fast Edge Distribution                           │ Watermark & Resize
            v                                                  v
┌────────────────────────┐                        ┌────────────────────────┐
│   Live Event Gallery   │ <───────────────────── │ Relational Metadata    │
│  (QR Code / Web App)   │   Share Tokens & Slugs │  (SQLite / PostgreSQL) │
└────────────────────────┘                        └────────────────────────┘
```

## Core Engineering & Design Patterns

### 1. Instant Camera-to-Cloud Mobile Bridge
The ingest workflow is driven by a companion Android application built on the author's native [CamToPhoneUSB](/projects/cam-to-phone-usb) tethering architecture:
- **Hardware PTP Link**: Connects directly to Sony, Canon, Nikon, and Fujifilm cameras over a standard USB-OTG cable.
- **Automated Shutter Detection**: As soon as the camera shutter fires, the Android service detects the incoming high-res JPEG/RAW payload on camera storage.
- **Immediate Streaming**: Streams the binary file to the FotoDrop ingestion endpoint (`MobilePhotosController`) over cellular 5G or local Wi-Fi without manual intervention.

### 2. High-Throughput Ingestion & Staging Buffer
Blocking the photographer's camera buffer while waiting for heavy cloud transformations would degrade shooting cadence:
- The API accepts the multipart payload, records initial metadata, and immediately streams the raw file into a localized staging buffer (`LocalPhotoStagingService`).
- An immediate `202 Accepted` response is returned to the mobile app in milliseconds, ensuring zero shutter lag during rapid burst shooting.

### 3. Asynchronous Worker & ImageSharp Transformation Pipeline
Offloaded to an isolated background service (`PhotoProcessingWorker`):
- **Worker Polling & Batching**: Continuously polls pending staging items in configurable batches, claiming jobs through atomic database status transitions (`Uploaded` → `Processing` → `Completed`).
- **Dynamic Orientation & Clamping**: Automatically evaluates EXIF orientation tags and downsamples oversized images to configurable target bounds (`MaxPhotoEdgePixels`).
- **Custom Watermarking Engine**: Supports dynamic text watermarks and alpha-blended graphic branding logos with configurable anchors (`BottomRight`, `Center`, etc.) and variable opacity.
- **Multi-Resolution Generation**: Concurrently produces optimized web-display variants and crisp micro-thumbnails (`ThumbnailEdgePixels`) for snappy mobile gallery rendering.

### 4. Zero-Egress Cloud Storage via Cloudflare R2
- Processed images and original master copies are pushed directly to **Cloudflare R2** object storage using S3-compatible API abstractions (`IR2ObjectStorage`).
- Leveraging Cloudflare R2 eliminates egress bandwidth costs, enabling high-volume event audiences to stream and download high-resolution photos simultaneously without escalating hosting expenses.

### 5. Live Event Albums & Instant Sharing
- **Album Visibility & Permissions**: Organizers can generate event-specific albums with custom slugs, access policies, and optional invite codes (`InviteCodeGenerator`).
- **Attendee Distribution**: Guests scan a venue QR code to view live-updating photo feeds as the event unfolds in real time.
- **Packaging & Downloads**: Built-in manifest service (`IPhotoDownloadService`) enables attendees and hosts to download filtered sets or full-resolution archives.

### 6. Containerized Deployment
The complete stack is containerized with multi-stage Docker builds and managed via Docker Compose:
- `snaprelay-api`: ASP.NET Core 8 RESTful API.
- `snaprelay-worker`: Dedicated .NET background processing worker.
- `snaprelay-frontend`: Nuxt / Vue responsive web gallery interface.

---
*Note: In accordance with proprietary project guidelines, raw production source code and internal keys are withheld. The above analysis highlights system architecture, queuing mechanics, and data flow patterns.*
