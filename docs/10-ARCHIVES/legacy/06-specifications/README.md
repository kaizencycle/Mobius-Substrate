# ⚙️ Specifications — Technical Specifications & Protocols

Formal technical specifications, API documentation, and protocol definitions.

## 📋 Overview

This directory contains formal technical specifications that define how Mobius Systems components interact and operate.

## 🔌 API Specifications

API contracts and interface definitions:
- [apis/](./apis/) - REST APIs, GraphQL schemas, WebSocket protocols

## 🌐 Protocol Specifications

Network and communication protocols:
- [protocols/](./protocols/) - MII sync, attestation protocols, consensus mechanisms

## 📦 Manifests

Configuration and manifest specifications:

- **[OAA Manifest](./manifests/manifest_oaa.md)**
  OAA (Open Agent Architecture) manifest specification

## 🎯 Specification Types

### By Category
- **Data Formats**: JSON schemas, data structures
- **Network Protocols**: Communication standards
- **APIs**: REST, GraphQL, WebSocket interfaces
- **Cryptographic**: Signing, verification, attestation standards

### By Component
- **MIC System**: Token standards, shard arithmetic
- **MII Measurement**: Integrity index calculation
- **Governance**: Voting protocols, proposal formats
- **Identity**: DID methods, credential formats

## 📚 Related Documentation

- [Architecture](../03-architecture/) - How specs are implemented
- [Whitepapers](../01-whitepapers/) - Economic specifications
- [Guides](../04-guides/development/) - How to use these specs

## ✅ Compliance

All specifications follow:
- **Versioning**: Semantic versioning (e.g., v1.0.0)
- **RFC Process**: Changes via [RFC Process](../../FOUNDATION/PROCESS/RFC_PROCESS.md)
- **Backward Compatibility**: Breaking changes only in major versions
- **Open Standards**: Built on open protocols where possible

## 🔧 For Developers

### Using Specifications

1. **Find the spec** for your use case
2. **Read the version** you need to implement
3. **Check examples** in the spec document
4. **Test compliance** against reference implementations

### Contributing Specifications

See [RFC Process](../../FOUNDATION/PROCESS/RFC_PROCESS.md) to propose new specifications.

## 📊 Specification Status

| Specification | Version | Status | Last Updated |
|---------------|---------|--------|--------------|
| OAA Manifest | 1.0 | Stable | 2025-11-04 |
| MII Protocol | Draft | In Review | 2025-11-04 |
| Attestation Protocol | Draft | In Review | 2025-11-04 |

## 📞 Questions?

Technical specification questions: specs@mobius.systems
