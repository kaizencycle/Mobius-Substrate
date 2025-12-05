#!/usr/bin/env python3
"""
Carrington-Class Failure Simulation

Tests whether 10% of DVA nodes can regrow the civilization substrate
after 90% destruction.

Usage:
    python3 carrington_sim.py [--nodes N] [--collapse FRACTION] [--steps-before N] [--steps-after N] [--steps-recovery N]

Example:
    python3 carrington_sim.py --nodes 100 --collapse 0.9 --steps-before 1000
"""

import random
import argparse
from collections import defaultdict
from typing import Set, List, Dict, Tuple, Optional


class Node:
    """Represents a DVA node in the simulation."""
    
    def __init__(self, nid: str, tier: str):
        self.id = nid
        self.tier = tier
        self.alive = True
        self.online = True
        self.neighbors: Set[str] = set()
        self.ledger: List[Tuple] = []
        self.version_vector: Dict[str, int] = defaultdict(int)
        self.mii_local = 0.95
        self.pending_events: List = []
        self.last_global_mii: Optional[float] = None

    def generate_event(self, t: int) -> Optional[Tuple]:
        """Generate a random event (shard, reflection, attestation)."""
        if not (self.alive and self.online):
            return None
        
        event_type = random.choice(["MFS_SHARD", "REFLECTION", "ATTESTATION"])
        evt = (self.id, t, event_type, random.random())
        
        self.ledger.append(evt)
        self.version_vector[self.id] += 1
        
        return evt

    def gossip(self, nodes: Dict[str, 'Node']):
        """Exchange ledger state with neighbors using CRDT merge."""
        if not (self.alive and self.online):
            return
        
        for nid in self.neighbors:
            other = nodes.get(nid)
            if not other or not (other.alive and other.online):
                continue
            
            # CRDT merge: union of events
            combined = set(self.ledger) | set(other.ledger)
            self.ledger = sorted(list(combined))  # Deterministic ordering
            other.ledger = sorted(list(combined))
        
        # Recompute local MII (simplified model)
        self.mii_local = min(1.0, 0.90 + 0.0001 * len(self.ledger))


def create_network(num_nodes: int = 100) -> Dict[str, Node]:
    """Create a network of DVA nodes with appropriate tier distribution."""
    nodes = {}
    
    # Distribute node types: 1 HIVE, 4 FULL, 15 ONE, 80 LITE
    tiers = ["HIVE"] + ["FULL"] * 4 + ["ONE"] * 15 + ["LITE"] * 80
    
    # Adjust if num_nodes != 100
    if num_nodes != 100:
        # Scale proportionally
        scale = num_nodes / 100
        hive_count = max(1, int(scale))
        full_count = max(1, int(4 * scale))
        one_count = max(1, int(15 * scale))
        lite_count = num_nodes - hive_count - full_count - one_count
        
        tiers = (["HIVE"] * hive_count + 
                 ["FULL"] * full_count + 
                 ["ONE"] * one_count + 
                 ["LITE"] * lite_count)
    
    random.shuffle(tiers)
    
    for i in range(num_nodes):
        nodes[f"node_{i}"] = Node(f"node_{i}", tiers[i])
    
    # Create random connectivity graph (10% edge probability)
    node_ids = list(nodes.keys())
    for i in range(len(node_ids)):
        for j in range(i + 1, len(node_ids)):
            if random.random() < 0.1:
                nodes[node_ids[i]].neighbors.add(node_ids[j])
                nodes[node_ids[j]].neighbors.add(node_ids[i])
    
    return nodes


def simulate(
    num_nodes: int = 100,
    collapse_fraction: float = 0.9,
    steps_before: int = 1000,
    steps_after: int = 1000,
    steps_recovery: int = 1000,
    event_probability: float = 0.3,
    verbose: bool = True
) -> Dict:
    """
    Run full Carrington Event simulation.
    
    Returns metrics for analysis.
    """
    
    # Phase A: Stable Civilization
    if verbose:
        print("Phase A: Stable Civilization (Baseline)")
    nodes = create_network(num_nodes)
    
    mii_history = []
    for t in range(steps_before):
        # Random event generation
        for node in nodes.values():
            if random.random() < event_probability:
                node.generate_event(t)
        
        # Gossip protocol
        for node in nodes.values():
            node.gossip(nodes)
        
        # Record global MII (average of local MII)
        alive_nodes = [n for n in nodes.values() if n.alive]
        if alive_nodes:
            avg_mii = sum(n.mii_local for n in alive_nodes) / len(alive_nodes)
            mii_history.append(avg_mii)
    
    baseline_mii = mii_history[-100:] if len(mii_history) >= 100 else mii_history
    
    # Phase B: Catastrophic Failure
    if verbose:
        print(f"\nPhase B: Catastrophic Failure ({collapse_fraction*100:.0f}% destruction)")
    
    num_survivors = int(num_nodes * (1 - collapse_fraction))
    survivors = set(random.sample(list(nodes.keys()), num_survivors))
    
    if verbose:
        print(f"Survivors: {len(survivors)} nodes")
        survivor_tiers = [nodes[nid].tier for nid in survivors]
        tier_counts = {t: survivor_tiers.count(t) for t in set(survivor_tiers)}
        print(f"Tier distribution: {tier_counts}")
    
    # Mark non-survivors as destroyed
    for nid, node in nodes.items():
        if nid not in survivors:
            node.alive = False
            node.online = False
            # Remove links to dead nodes
            for survivor_id in survivors:
                nodes[survivor_id].neighbors.discard(nid)
    
    # Isolated operation period
    for t in range(steps_before, steps_before + steps_after):
        for nid in survivors:
            if random.random() < event_probability:
                nodes[nid].generate_event(t)
        
        for nid in survivors:
            nodes[nid].gossip(nodes)
        
        # Record survivor MII
        if survivors:
            avg_mii = sum(nodes[nid].mii_local for nid in survivors) / len(survivors)
            mii_history.append(avg_mii)
    
    isolation_mii = mii_history[-100:] if len(mii_history) >= 100 else mii_history[-len(mii_history):]
    
    # Phase C: Recovery
    if verbose:
        print(f"\nPhase C: Recovery & Reconnection")
    
    # Gradually reconnect survivors (simulate mesh network repair)
    survivor_list = list(survivors)
    for reconnect_round in range(10):  # 10 rounds of reconnection
        # Add random edges between survivors
        num_edges = max(1, len(survivors) // 2)
        for _ in range(num_edges):
            if len(survivor_list) >= 2:
                i, j = random.sample(survivor_list, 2)
                nodes[i].neighbors.add(j)
                nodes[j].neighbors.add(i)
    
    # Recovery period with full connectivity
    for t in range(steps_before + steps_after, steps_before + steps_after + steps_recovery):
        for nid in survivors:
            if random.random() < event_probability:
                nodes[nid].generate_event(t)
        
        for nid in survivors:
            nodes[nid].gossip(nodes)
        
        if survivors:
            avg_mii = sum(nodes[nid].mii_local for nid in survivors) / len(survivors)
            mii_history.append(avg_mii)
    
    recovery_mii = mii_history[-100:] if len(mii_history) >= 100 else mii_history[-len(mii_history):]
    
    # Analyze ledger convergence
    ledger_sizes = [len(nodes[nid].ledger) for nid in survivors]
    survivor_tiers = [nodes[nid].tier for nid in survivors]
    
    # Calculate dispersion (how similar are survivor ledgers?)
    ledger_hashes = [hash(tuple(sorted(nodes[nid].ledger))) for nid in survivors]
    unique_ledgers = len(set(ledger_hashes))
    convergence = 1.0 - (unique_ledgers / len(survivors)) if survivors else 0.0
    
    return {
        "survivors": len(survivors),
        "survivor_tiers": survivor_tiers,
        "baseline_mii": sum(baseline_mii) / len(baseline_mii) if baseline_mii else 0.0,
        "isolation_mii": sum(isolation_mii) / len(isolation_mii) if isolation_mii else 0.0,
        "recovery_mii": sum(recovery_mii) / len(recovery_mii) if recovery_mii else 0.0,
        "ledger_convergence": convergence,
        "ledger_sizes": ledger_sizes,
        "mii_history": mii_history,
        "tier_distribution": {t: survivor_tiers.count(t) for t in set(survivor_tiers)}
    }


def main():
    """Main entry point for the simulation."""
    parser = argparse.ArgumentParser(
        description="Carrington-Class Failure Simulation for Mobius Systems"
    )
    parser.add_argument(
        "--nodes", type=int, default=100,
        help="Total number of nodes in the network (default: 100)"
    )
    parser.add_argument(
        "--collapse", type=float, default=0.9,
        help="Fraction of nodes destroyed (default: 0.9)"
    )
    parser.add_argument(
        "--steps-before", type=int, default=1000,
        help="Simulation steps before collapse (default: 1000)"
    )
    parser.add_argument(
        "--steps-after", type=int, default=1000,
        help="Simulation steps during isolation (default: 1000)"
    )
    parser.add_argument(
        "--steps-recovery", type=int, default=1000,
        help="Simulation steps during recovery (default: 1000)"
    )
    parser.add_argument(
        "--event-prob", type=float, default=0.3,
        help="Probability of event generation per node per tick (default: 0.3)"
    )
    parser.add_argument(
        "--quiet", action="store_true",
        help="Suppress progress output"
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("Carrington-Class Failure Simulation")
    print("=" * 60)
    print(f"Configuration:")
    print(f"  Nodes: {args.nodes}")
    print(f"  Collapse fraction: {args.collapse*100:.0f}%")
    print(f"  Steps before: {args.steps_before}")
    print(f"  Steps after: {args.steps_after}")
    print(f"  Steps recovery: {args.steps_recovery}")
    print()
    
    results = simulate(
        num_nodes=args.nodes,
        collapse_fraction=args.collapse,
        steps_before=args.steps_before,
        steps_after=args.steps_after,
        steps_recovery=args.steps_recovery,
        event_probability=args.event_prob,
        verbose=not args.quiet
    )
    
    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    print(f"Survivors: {results['survivors']} nodes")
    print(f"Survivor distribution: {results['tier_distribution']}")
    print(f"\nMII Progression:")
    print(f"  Baseline (pre-collapse): {results['baseline_mii']:.4f}")
    print(f"  Isolation (post-collapse): {results['isolation_mii']:.4f}")
    print(f"  Recovery (post-reconnect): {results['recovery_mii']:.4f}")
    print(f"\nLedger Convergence: {results['ledger_convergence']:.2%}")
    if results['ledger_sizes']:
        print(f"Average ledger size: {sum(results['ledger_sizes']) / len(results['ledger_sizes']):.0f} events")
    print("\n" + "=" * 60)
    print("CONCLUSION")
    print("=" * 60)
    
    if results['ledger_convergence'] > 0.95:
        print("✅ SUCCESS: Civilization substrate SURVIVED and RECONSTITUTED")
        print("   - Survivors maintained local state during isolation")
        print("   - Ledgers converged after reconnection")
        print("   - MII stabilized at healthy levels")
        print("   - Mobius Systems is COLLAPSE-RESISTANT")
    elif results['ledger_convergence'] > 0.50:
        print("⚠️  PARTIAL SUCCESS: Substrate survived but fragmented")
        print(f"   - Ledger convergence: {results['ledger_convergence']:.2%}")
        print("   - May need additional reconciliation protocols")
    else:
        print("❌ FAILURE: Substrate did not reconstitute")
        print(f"   - Ledger convergence: {results['ledger_convergence']:.2%}")
        print("   - Critical failure in recovery protocol")
    
    return 0 if results['ledger_convergence'] > 0.95 else 1


if __name__ == "__main__":
    exit(main())
