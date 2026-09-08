---
title: "Google Places Grid Search & MS SQL Pipeline"
description: "A C# geospatial crawler that overcomes the 60-result hard cap of the Google Places API by dividing geographic areas into coordinate grid cells, concurrently retrieving venue data, and deduplicating records in MS SQL Server."
publishDate: "2023-10-28"
tags: ["C#", ".NET", "MS SQL Server", "ADO.NET", "REST API", "Geospatial", "Data Ingestion"]
githubUrl: "https://github.com/invisiblesushi/CS-PlacesGridSearch"
featured: false
order: 11
---

## Overview

The standard Google Places Nearby Search API enforces a strict limitation: it returns a maximum of 60 results per query, regardless of the actual business density in a target metropolitan area. For comprehensive market research, data analysis, or directory generation, this limit causes massive data truncation.

**Places Grid Search** is a C# .NET solution that circumvents this constraint by mathematically partitioning a geographic bounding box into smaller coordinate grid cells, performing focused concurrent queries across each sector, and aggregating complete venue datasets into Microsoft SQL Server.

## Architecture & Technical Stack

- **Language & Runtime**: C#, .NET
- **Database & Data Access**: Microsoft SQL Server (MS SQL Server), raw ADO.NET (`SqlConnection`, `SqlCommand`)
- **API Integration**: Google Places Nearby RESTful API
- **Data Modeling**: Strongly typed DTO models (`Place`, `GooglePlacesResult`)

## Engineering Implementation

### 1. Spatial Grid Partitioning
Instead of querying a wide radius that hits the 60-result ceiling:
- The algorithm calculates bounding latitude and longitude coordinates.
- It sub-divides the search area into overlapping coordinate grid cells sized according to expected urban density.
- Each localized cell is queried independently, capturing high-density establishments that would otherwise be omitted by the API's top-60 ranking algorithms.

### 2. High-Throughput ADO.NET Ingestion Layer
Rather than using heavy ORM abstractions for high-volume batch inserts:
- Implemented a lean `DbRepository` using direct `SqlConnection` and parameterised `SqlCommand` executions.
- **Idempotent Ingestion**: Performs preliminary `COUNT(1) WHERE place_id = @id` checks and transactional merging to eliminate duplicate records generated across overlapping grid boundaries.
- Stores coordinates, venue metadata, ratings, addresses, and JSON payloads with proper database typing.
