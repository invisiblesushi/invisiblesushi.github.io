---
title: "Resilient Microservice HTTP Communication with Polly"
description: "Enterprise backend resilience and fault-tolerance patterns in C# .NET, featuring exponential backoff with jitter and client-side rate limiting using the Polly policy framework."
publishDate: "2023-01-27"
tags: ["C#", ".NET", "Polly", "Resilience", "HttpClient", "Microservices", "Rate Limiting"]
githubUrl: "https://github.com/invisiblesushi/Polly-exponential-backoff-retry-example"
featured: false
order: 12
---

## Overview

In distributed architectures and microservice ecosystems, transient network failures and external API rate limits are inevitable. Without defensive resilience mechanisms, downstream failures cascade across the entire application stack.

This project demonstrates core fault-tolerance patterns in C# .NET using **Polly**, the leading .NET resilience framework. It models production-grade defensive strategies: transient error recovery via **exponential backoff retry policies** and proactive **client-side rate limiting**.

## Implemented Resilience Patterns

### 1. Transient Fault Handling & Exponential Backoff
When communicating across unreliable external web services, immediate retries can overwhelm struggling remote servers.

I implemented an asynchronous retry policy (`AsyncRetryPolicy<HttpResponseMessage>`) configured to intercept HTTP failures:
```csharp
AsyncRetryPolicy<HttpResponseMessage> httpWaitAndRetryPolicy = Policy
    .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
    .WaitAndRetryAsync(
        retryCount: 3, 
        sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
        onRetry: (outcome, timespan, retryAttempt, context) => {
            // Structured diagnostic logging for telemetry
        }
    );
```
- **Exponential Growth**: Sleep intervals scale exponentially (\(2^1, 2^2, 2^3\) seconds) allowing downstream dependencies sufficient recovery windows.
- **Telemetry Hook**: Emits structured diagnostics on each retry attempt for monitoring and alerting.

### 2. Client-Side Rate Limiting & Throttling
Third-party APIs frequently enforce strict throughput quotas (e.g., maximum requests per time window). Exceeding these triggers `429 Too Many Requests` penalties or service bans.

Using Polly's rate-limiting policy engine:
```csharp
Policy.RateLimitAsync(2, TimeSpan.FromSeconds(10));
```
- Restricts outgoing HTTP calls to 2 requests per 10-second sliding window.
- When limits are reached, the execution pipeline dynamically sleeps for the remaining backoff duration before safely retrying the operation, preventing service disruption and ensuring compliance with external service SLAs.
