---
doc_id: REF-2025-001
title: "Reference Documentation"
category: "Reference"
classification: 800
date: 2025-11-26
version: 1.0.0
status: published
keywords:
  - reference
  - api
  - schemas
  - specifications
abstract: >
  Complete reference documentation including API specifications, data schemas,
  classification systems, and quick-reference materials. Authoritative technical
  references for developers and integrators.
license: CC-BY-SA-4.0
---

# 08-REFERENCE

> **Authoritative technical references**

## Overview

This directory contains all reference documentation, API specifications, data schemas, classification systems, and quick-reference materials for Mobius Systems.

## Contents

```
08-REFERENCE/
├── README.md                      (this file)
├── /api/                           API specifications
│   ├── rest-api.md               REST API reference
│   ├── graphql-api.md            GraphQL schema & queries
│   ├── websocket-api.md          WebSocket events
│   └── authentication.md         Auth & authorization
├── schemas/                       Data schemas
│   ├── database-schema.md        PostgreSQL schemas
│   ├── json-schemas/             JSON Schema definitions
│   ├── data-models.md            Core data models
│   └── validation-rules.md       Validation specifications
├── intelligence-classification/   AI classification system
│   ├── sentinel-classification.md Sentinel taxonomy
│   ├── typology.md               Intelligence layers
│   └── capabilities.md           Capability matrix
├── indices/                       Master indices
│   ├── document-index.md         All documents
│   ├── subject-index.md          By subject
│   ├── api-index.md              All API endpoints
│   └── schema-index.md           All schemas
└── quick-reference/               Quick guides
    ├── commands.md               Common commands
    ├── glossary.md               Terminology
    └── acronyms.md               Acronym list
```

## API Reference

### REST API

**Base URL**: `https://api.mobius.systems/v1`

**Authentication**: Bearer token (JWT)

**Key Endpoints**:
- `/integrity` - GI scoring and verification
- `/mic` - MIC accounting and transactions
- `/labs` - Lab service access
- `/dva` - DVA operations
- `/memt` - MEMT consensus

See: [/api/rest-api.md](./api/rest-api.md)

### GraphQL API

**Endpoint**: `https://api.mobius.systems/graphql`

**Schema**: Full type-safe schema with introspection

**Queries**:
- User and account management
- Integrity queries
- MIC operations
- Lab data access

See: [/api/graphql-api.md](./api/graphql-api.md)

### WebSocket API

**Endpoint**: `wss://api.mobius.systems/ws`

**Events**:
- Real-time GI updates
- MIC transaction notifications
- DVA verification events
- Lab activity streams

See: [/api/websocket-api.md](./api/websocket-api.md)

## Data Schemas

### Database Schema

**PostgreSQL** (primary database)

**Core Tables**:
- `users` - User accounts
- `integrity_scores` - GI scoring history
- `mic_ledger` - MIC transactions
- `dva_verifications` - DVA audit trail
- `memt_decisions` - MEMT consensus log

See: [schemas/database-schema.md](./schemas/database-schema.md)

### JSON Schemas

Standard JSON Schema definitions for:
- API request/response payloads
- Configuration files
- Manifest formats
- Data exchange formats

See: [schemas/json-schemas/](./schemas/json-schemas/)

## Intelligence Classification

### Sentinel Taxonomy

**Classification Levels**:
1. **Guardian Sentinels**: Constitutional enforcement
2. **Operational Sentinels**: System operations
3. **Advisory Sentinels**: Decision support
4. **Specialized Sentinels**: Domain-specific

See: [intelligence-classification/sentinel-classification.md](./intelligence-classification/sentinel-classification.md)

### Intelligence Layers

**Three-Layer Model**:
1. **Reactive**: Pattern matching, rule-based
2. **Adaptive**: Learning, optimization
3. **Generative**: Creation, innovation

See: [intelligence-classification/typology.md](./intelligence-classification/typology.md)

## Quick Reference

### Common Commands

```bash
# Integrity check
npm run integrity:check

# DVA verification
npm run dva:verify

# Deploy labs
npm run labs:deploy

# Run tests
npm run test:all
```

See: [quick-reference/commands.md](./quick-reference/commands.md)

### Glossary

- **DVA**: Decentralized Verification Architecture
- **MEMT**: Multi-Engine Model Taxonomy
- **MIC**: Mobius Integrity Credits
- **MII**: Mobius Integrity Index
- **GI**: Governance Integrity
- **KTT**: Kaizen Turing Test

See: [quick-reference/glossary.md](./quick-reference/glossary.md)

## For Developers

### Integration Guide

1. Review API documentation
2. Obtain API credentials
3. Test in sandbox environment
4. Deploy to production

See: [../05-IMPLEMENTATION/guides/api-integration.md](../05-IMPLEMENTATION/guides/api-integration.md)

### SDK & Libraries

- **JavaScript/TypeScript**: `@mobius/sdk`
- **Python**: `mobius-sdk-py`
- **REST**: Standard HTTP clients

## Version Information

- **API Version**: v1
- **Documentation Version**: 1.0.0
- **Last Updated**: 2025-11-26
- **Status**: Published

---

**Classification**: 800 - Reference  
**Status**: Published  
**License**: CC-BY-SA-4.0
