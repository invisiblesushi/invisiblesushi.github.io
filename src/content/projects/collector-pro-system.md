---
title: "Collector Pro: Enterprise Facility & Data Management System"
description: "Data collection and facility management backend solution tailored for businesses in the transport, operations, and maintenance sectors, built with C#, ASP.NET, Entity Framework, and MS SQL Server."
publishDate: ""
tags: ["C#", ".NET Core", "ASP.NET", "MS SQL Server", "Entity Framework", "Jenkins", "Octopus Deploy"]
company: "Zeekit AS"
companyUrl: "https://www.zeekit.no"
role: "Software Engineer"
badge: "Commercial / Enterprise"
isCommercial: true
featured: true
order: 1
---

## Overview

Collector Pro is a high-availability facility management and digital data collection solution engineered for enterprise fleets and operations in Norway and Sweden. The platform automates mission-critical field reporting, service logging, and administrative oversight.

As a core backend software engineer on this project at Zeekit AS, I was responsible for architecting backend APIs, high-volume report generation engines, service implementations.

## Tech Stack & Architecture

- **Backend Language & Framework**: C#.NET, ASP.NET Web API, .NET Core
- **Database & Persistence**: Microsoft SQL Server (MS SQL Server), Entity Framework
- **Frontend Integration**: ASP.NET Razor Pages (Backoffice), JavaScript, HTML5/CSS3, React(clientportal)
- **DevOps & CI/CD**: Jenkins build pipelines, Octopus Deploy release automation
- **Methodology**: Scrum / Agile development, specification drafting, QA testing

## Key Contributions & Features

- **Scalable Web API Design**: Designed and maintained RESTful endpoints handling high-concurrency requests from mobile field workers and administrative portals.
- **Reporting & Telemetry Aggregation**: Engineered asynchronous report generation workflows capable of parsing and compiling large datasets from field inspections and operational metrics.
- **Data Access Layer Optimization**: Profiled and optimized Entity Framework queries and MS SQL Server stored procedures, significantly reducing query response latencies under heavy reporting loads.
- **DevOps & Release Pipeline**: Configured and maintained automated CI/CD pipelines using Jenkins for building and automated testing, paired with Octopus Deploy for coordinated staging and production deployments.

## Challenges & Solutions

A primary challenge was ensuring seamless data synchronization during peak operational hours without causing database locking or resource contention on MS SQL Server. 

By restructuring database transactions, introducing targeted indexing strategies, and isolating resource-intensive report processing into asynchronous background services, we ensured uninterrupted system availability for mission-critical client operations.