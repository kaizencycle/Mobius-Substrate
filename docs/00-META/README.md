---
doc_id: META-2025-001
title: "Documentation System Overview"
category: "Meta-Documentation"
classification: 000
date: 2025-11-26
version: 1.0.0
status: published
keywords:
  - documentation
  - information architecture
  - taxonomy
abstract: >
  This directory contains meta-documentation about the documentation system itself,
  including organization principles, taxonomies, style guides, and maintenance procedures.
  It serves as the authoritative source for documentation standards and practices.
license: CC-BY-SA-4.0
---

# 00-META: Documentation System

> **Meta-documentation: Documentation about the documentation**

## Overview

This directory contains the foundational materials that govern how all documentation in the Mobius Systems repository is created, organized, maintained, and accessed.

## Contents

### Core Documentation

- **[REORGANIZATION_PLAN.md](../.REORGANIZATION_PLAN.md)** - Master plan for documentation structure
- **STYLE_GUIDE.md** - Academic writing and formatting standards
- **TAXONOMY.md** - Complete classification system
- **MAINTENANCE.md** - Documentation maintenance procedures
- **TEMPLATES/** - Document templates by type

### Indices and Catalogs

- **MASTER_INDEX.md** - Comprehensive document index
- **SUBJECT_INDEX.md** - Topical organization
- **AUTHOR_INDEX.md** - By contributor
- **CHRONOLOGICAL_INDEX.md** - By publication date
- **CITATION_INDEX.md** - Internal citations graph

### Quality Assurance

- **VALIDATION.md** - Quality checks and procedures
- **PEER_REVIEW.md** - Review process and standards
- **CHANGELOG.md** - Documentation system changes

## Documentation Taxonomy

The Mobius Systems documentation follows a Dewey Decimal-inspired classification:

```
000 - META: Documentation system, indices, master catalog
100 - INTRODUCTION: Overviews, getting started, handbooks  
200 - THEORETICAL FOUNDATIONS: Philosophy, theory, principles
300 - GOVERNANCE & POLICY: Foundation, charters, policies
400 - TECHNICAL ARCHITECTURE: System design, specifications
500 - IMPLEMENTATION: Guides, tutorials, integration
600 - OPERATIONS: Processes, runbooks, monitoring
700 - RESEARCH & PUBLICATIONS: Papers, studies, outreach
800 - REFERENCE: APIs, schemas, classifications
900 - APPENDICES & ARCHIVES: Supporting materials, history
```

## Academic Standards

All documentation in this repository adheres to:

1. **IEEE Standards** for technical specifications
2. **APA 7th Edition** for academic papers
3. **Chicago Manual of Style** for general documentation
4. **ISO/IEC/IEEE 26511:2018** for software documentation

## Document Structure

Each document must contain:

1. **YAML Frontmatter** with metadata
2. **Abstract** (150-250 words for major docs)
3. **Table of Contents** (documents > 5 pages)
4. **Structured Body** with academic sections
5. **References** with proper citations
6. **Revision History**

## Navigation

- **For Writers**: See [STYLE_GUIDE.md](./STYLE_GUIDE.md)
- **For Maintainers**: See [MAINTENANCE.md](./MAINTENANCE.md)
- **For Readers**: See [MASTER_INDEX.md](./MASTER_INDEX.md)

## Version Control

- **Version**: 1.0.0
- **Last Updated**: 2025-11-26
- **Next Review**: 2025-12-26
- **Owner**: Documentation Team

---

**Classification**: 000 - Meta-Documentation  
**Status**: Published  
**License**: CC-BY-SA-4.0
