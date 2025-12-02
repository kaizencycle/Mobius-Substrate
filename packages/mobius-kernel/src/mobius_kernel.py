"""
Mobius Kernel v1.1.1
====================

Constitutional enforcement layer for Kaizen OS / Mobius Systems.
Loads agent stack manifest and enforces tier-based permissions.

Core principle: "Mind above Hands, Sentinels around all"

Changes in v1.1.1:
- schema_version added for kernel compatibility
- DAEDALUS cannot trigger executors (HARDCODED)
- ZEUS split into ZEUS_COORDINATOR (Tier 2) and ZEUS_SENTINEL (Tier 4)
- INDEXER updated from GIC to MIC terminology
- HERMES normalized to System Agent type
"""

import json
from typing import Dict, Any, List, Optional
from pathlib import Path
from dataclasses import dataclass
from enum import Enum


class ActionType(Enum):
    """Enumeration of all possible agent actions"""
    EDIT_CODE = "edit_code"
    EDIT_REPO = "edit_repo"
    UPDATE_CANON = "update_canon_docs"
    TRIGGER_EXECUTOR = "trigger_executors"


@dataclass
class AgentSpec:
    """Specification for a single agent from the stack manifest"""
    id: str
    tier: int
    role: str
    type: str
    model_family: str
    responsibilities: List[str]
    permissions: Dict[str, bool]
    alias: Optional[str] = None


class MobiusKernel:
    """
    Core orchestration kernel that enforces constitutional agent hierarchy.
    
    Loads v1.1.1+ manifests and enforces tier-based permissions including
    the critical DAEDALUS constraint (cannot trigger executors).
    
    Usage:
        kernel = MobiusKernel("config/agents/mobius_agent_stack.v1.1.1.json")
        
        # Check permissions
        kernel.can_agent_edit_code("CURSOR")  # True
        kernel.can_agent_edit_code("AUREA")   # False
        
        # DAEDALUS constraint (HARDCODED)
        kernel.can_agent_trigger_executors("DAEDALUS")  # Always False
    """
    
    MINIMUM_SCHEMA_VERSION = "1.1.1"
    
    def __init__(self, manifest_path: str = "config/agents/mobius_agent_stack.v1.1.1.json"):
        """
        Initialize the Mobius Kernel.
        
        Args:
            manifest_path: Path to the agent stack manifest JSON file
        """
        self.manifest_path = manifest_path
        self.manifest = self._load_manifest(manifest_path)
        self.agents = self._register_agents()
        self.permission_matrix = self._build_permission_matrix()
        
        # Log initialization
        print(f"🔷 Mobius Kernel v{self.manifest['version']} initialized")
        print(f"   Schema: {self.manifest['schema_version']}")
        print(f"   Agents: {len(self.agents)} registered across {len(self.manifest['tiers'])} tiers")
        
    def _load_manifest(self, path: str) -> Dict[str, Any]:
        """Load and validate agent stack manifest."""
        manifest_file = Path(path)
        
        if not manifest_file.exists():
            raise FileNotFoundError(f"Manifest not found: {path}")
        
        with open(manifest_file, 'r') as f:
            manifest = json.load(f)
        
        # Validate schema version
        schema_version = manifest.get('schema_version', '1.0.0')
        if not self._is_compatible_schema(schema_version):
            raise ValueError(
                f"Incompatible schema version: {schema_version}. "
                f"Minimum required: {self.MINIMUM_SCHEMA_VERSION}"
            )
        
        # Validate tier IDs are sequential
        tier_ids = [t['tier_id'] for t in manifest['tiers']]
        expected_ids = list(range(1, len(tier_ids) + 1))
        if tier_ids != expected_ids:
            raise ValueError(f"Tier IDs must be sequential starting from 1. Got: {tier_ids}")
        
        return manifest
    
    def _register_agents(self) -> Dict[str, AgentSpec]:
        """Parse and register all agents from manifest."""
        agents = {}
        
        for tier in self.manifest['tiers']:
            tier_id = tier['tier_id']
            
            # Handle agent-based tiers (1-4)
            for agent_data in tier.get('agents', []):
                agent_spec = AgentSpec(
                    id=agent_data['id'],
                    tier=tier_id,
                    role=agent_data['role'],
                    type=agent_data['type'],
                    model_family=agent_data.get('model_family', 'Unknown'),
                    responsibilities=agent_data['responsibilities'],
                    permissions=agent_data['permissions'],
                    alias=agent_data.get('alias')
                )
                agents[agent_spec.id] = agent_spec
        
        return agents
    
    def _build_permission_matrix(self) -> Dict[str, Dict[str, bool]]:
        """Build fast-lookup permission matrix."""
        matrix = {}
        for agent_id, spec in self.agents.items():
            matrix[agent_id] = spec.permissions.copy()
        return matrix
    
    def _is_compatible_schema(self, version: str) -> bool:
        """Check schema version compatibility (1.1.1+)."""
        try:
            major, minor, patch = map(int, version.split('.'))
            min_major, min_minor, min_patch = map(int, self.MINIMUM_SCHEMA_VERSION.split('.'))
            
            if major > min_major:
                return True
            if major == min_major and minor > min_minor:
                return True
            if major == min_major and minor == min_minor and patch >= min_patch:
                return True
            return False
        except (ValueError, AttributeError):
            return False
    
    # =========================================================================
    # Permission Checking API
    # =========================================================================
    
    def can_agent_edit_code(self, agent_id: str) -> bool:
        """
        Check if agent can edit code (Tier 3 exclusive).
        
        Only Execution Engines (CURSOR, CLAUDE_CODE, CODEX, COPILOT) 
        have this permission.
        """
        return self.permission_matrix.get(agent_id, {}).get('can_edit_code', False)
    
    def can_agent_edit_repos(self, agent_id: str) -> bool:
        """
        Check if agent can edit repositories.
        
        Only CURSOR and CLAUDE_CODE have this permission.
        """
        return self.permission_matrix.get(agent_id, {}).get('can_edit_repos', False)
    
    def can_agent_trigger_executors(self, agent_id: str) -> bool:
        """
        Check if agent can trigger execution engines.
        
        CRITICAL: DAEDALUS is explicitly blocked per v1.1.1 amendment.
        This is HARDCODED and cannot be overridden by manifest changes.
        """
        # DAEDALUS CONSTRAINT - HARDCODED
        # This prevents circular authority loops where the consensus mediator
        # could directly trigger execution without Architect approval.
        if agent_id == "DAEDALUS":
            return False
        
        return self.permission_matrix.get(agent_id, {}).get('can_trigger_executors', False)
    
    def can_agent_update_canon(self, agent_id: str) -> bool:
        """Check if agent can update canonical documentation."""
        return self.permission_matrix.get(agent_id, {}).get('can_update_canon_docs', False)
    
    def validate_request(self, agent_id: str, action: str) -> bool:
        """
        Central permission validation for any agent action.
        
        Args:
            agent_id: The agent attempting the action
            action: One of 'edit_code', 'edit_repo', 'trigger_executor', 'update_canon'
            
        Returns:
            True if action is permitted, False otherwise
        """
        if agent_id not in self.agents:
            return False
        
        action_validators = {
            'edit_code': self.can_agent_edit_code,
            'edit_repo': self.can_agent_edit_repos,
            'trigger_executor': self.can_agent_trigger_executors,
            'update_canon': self.can_agent_update_canon,
        }
        
        validator = action_validators.get(action)
        return validator(agent_id) if validator else False
    
    # =========================================================================
    # Agent Query API
    # =========================================================================
    
    def get_agent(self, agent_id: str) -> Optional[AgentSpec]:
        """Get agent specification by ID."""
        return self.agents.get(agent_id)
    
    def get_agents_by_tier(self, tier_id: int) -> List[AgentSpec]:
        """Get all agents in a specific tier."""
        return [spec for spec in self.agents.values() if spec.tier == tier_id]
    
    def get_architects(self) -> List[AgentSpec]:
        """Get all Tier 1 Architects (Mind Layer)."""
        return self.get_agents_by_tier(1)
    
    def get_strategists(self) -> List[AgentSpec]:
        """Get all Tier 2 Strategists (Middle-Mind Layer)."""
        return self.get_agents_by_tier(2)
    
    def get_executors(self) -> List[AgentSpec]:
        """Get all Tier 3 Execution Engines (Hands Layer)."""
        return self.get_agents_by_tier(3)
    
    def get_sentinels(self) -> List[AgentSpec]:
        """Get all Tier 4 Sentinels (Guardians Layer)."""
        return self.get_agents_by_tier(4)
    
    def get_tier_name(self, tier_id: int) -> str:
        """Get the human-readable name for a tier."""
        tier_names = {
            1: "Architects (Mind Layer)",
            2: "Strategists (Middle-Mind Layer)",
            3: "Execution Engines (Hands Layer)",
            4: "Sentinels (Guardians Layer)",
            5: "Memory & Ledger (Root Layer)"
        }
        return tier_names.get(tier_id, f"Unknown Tier {tier_id}")
    
    # =========================================================================
    # Diagnostics API
    # =========================================================================
    
    def print_permission_summary(self) -> None:
        """Print a summary of all agent permissions."""
        print("\n" + "=" * 70)
        print("MOBIUS AGENT STACK - PERMISSION SUMMARY")
        print("=" * 70)
        
        for tier_id in range(1, 5):  # Tiers 1-4 have agents
            tier_agents = self.get_agents_by_tier(tier_id)
            if not tier_agents:
                continue
                
            print(f"\n📊 Tier {tier_id}: {self.get_tier_name(tier_id)}")
            print("-" * 50)
            
            for agent in tier_agents:
                perms = agent.permissions
                edit_code = "✅" if perms.get('can_edit_code') else "❌"
                edit_repos = "✅" if perms.get('can_edit_repos') else "❌"
                trigger = "✅" if self.can_agent_trigger_executors(agent.id) else "❌"
                canon = "✅" if perms.get('can_update_canon_docs') else "❌"
                
                print(f"  {agent.id:20} | Code: {edit_code} | Repos: {edit_repos} | Trigger: {trigger} | Canon: {canon}")
        
        print("\n" + "=" * 70)
        print("🔒 CRITICAL: DAEDALUS cannot trigger executors (HARDCODED)")
        print("=" * 70 + "\n")
    
    def validate_constitutional_integrity(self) -> bool:
        """
        Validate that the stack maintains constitutional constraints.
        
        Returns True if all invariants hold:
        - Only Tier 3 agents can edit code
        - Only CURSOR and CLAUDE_CODE can edit repos
        - DAEDALUS cannot trigger executors
        - Sentinels cannot edit code
        """
        violations = []
        
        # Check code editing is Tier 3 exclusive
        for agent_id, agent in self.agents.items():
            if agent.permissions.get('can_edit_code') and agent.tier != 3:
                violations.append(f"Non-Tier-3 agent {agent_id} has code editing permission")
        
        # Check repo editing is CURSOR/CLAUDE_CODE exclusive
        for agent_id, agent in self.agents.items():
            if agent.permissions.get('can_edit_repos') and agent_id not in ['CURSOR', 'CLAUDE_CODE']:
                violations.append(f"Unauthorized agent {agent_id} has repo editing permission")
        
        # Check Sentinels (Tier 4) cannot edit code
        for agent in self.get_sentinels():
            if agent.permissions.get('can_edit_code'):
                violations.append(f"Sentinel {agent.id} has code editing permission")
        
        if violations:
            print("❌ Constitutional violations detected:")
            for v in violations:
                print(f"   - {v}")
            return False
        
        print("✅ Constitutional integrity validated")
        return True


# =============================================================================
# Module Entry Point
# =============================================================================

if __name__ == "__main__":
    import sys
    
    # Allow custom manifest path from command line
    manifest_path = sys.argv[1] if len(sys.argv) > 1 else "config/agents/mobius_agent_stack.v1.1.1.json"
    
    try:
        kernel = MobiusKernel(manifest_path)
    except FileNotFoundError:
        # Try relative to current file for testing
        kernel = MobiusKernel(str(Path(__file__).parent.parent.parent.parent / "config/agents/mobius_agent_stack.v1.1.1.json"))
    
    print("\n" + "=" * 70)
    print("MOBIUS KERNEL TEST SUITE")
    print("=" * 70)
    
    print("\n🧠 AUREA (Architect):")
    print(f"   Can edit code: {kernel.can_agent_edit_code('AUREA')}")  # False
    print(f"   Can trigger executors: {kernel.can_agent_trigger_executors('AUREA')}")  # True
    print(f"   Can update canon: {kernel.can_agent_update_canon('AUREA')}")  # True
    
    print("\n🔶 DAEDALUS (Mediator):")
    print(f"   Can trigger executors: {kernel.can_agent_trigger_executors('DAEDALUS')}")  # False (ENFORCED)
    print(f"   Can update canon: {kernel.can_agent_update_canon('DAEDALUS')}")  # True
    
    print("\n⚙️ CURSOR (Executor):")
    print(f"   Can edit code: {kernel.can_agent_edit_code('CURSOR')}")  # True
    print(f"   Can edit repos: {kernel.can_agent_edit_repos('CURSOR')}")  # True
    print(f"   Can trigger executors: {kernel.can_agent_trigger_executors('CURSOR')}")  # False
    
    print("\n🛡️ DVA (Sentinel):")
    print(f"   Can edit code: {kernel.can_agent_edit_code('DVA')}")  # False
    print(f"   Can update canon: {kernel.can_agent_update_canon('DVA')}")  # True
    
    # Print full permission summary
    kernel.print_permission_summary()
    
    # Validate constitutional integrity
    print("\n🔍 Validating constitutional integrity...")
    kernel.validate_constitutional_integrity()
    
    print("\n✅ Kernel test complete")
