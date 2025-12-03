/**
 * Mobius Pulse Module
 * Sentinel-ready repository heartbeat protocol
 */

// Export v1 types with explicit names to avoid conflicts
export {
  MobiusPulseRepoSchema,
  type MobiusPulseRepo,
  MobiusPulseMetaSchema,
  type MobiusPulseMeta,
  MobiusPulseCommitSchema as MobiusPulseCommitSchemaV1,
  type MobiusPulseCommit,
  MobiusPulseGitSchema,
  type MobiusPulseGit,
  MobiusPulseStructureSchema,
  type MobiusPulseStructure,
  MobiusPulseBuildGraphSchema,
  type MobiusPulseBuildGraph,
  MobiusPulseSchema as MobiusPulseSchemaV1,
  type MobiusPulse as MobiusPulseV1,
  extractPulseSummary,
  isPulseStale,
} from "./mobiusPulse";

// Export v2 types (primary/default exports)
export * from "./mobiusPulseV2";
