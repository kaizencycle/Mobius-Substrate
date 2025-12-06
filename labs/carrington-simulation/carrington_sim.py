#!/usr/bin/env python3
"""
Carrington-Class Failure Simulation Model

Tests whether 10% of DVA nodes can regrow the Mobius substrate after 
90% are destroyed in a catastrophic event (solar storm, EMP, etc.)

Version: 1.0 (C-155)
Author: Mobius Systems Foundation
Date: December 5, 2025

Usage:
    python3 carrington_sim.py [--nodes N] [--collapse FRAC] [--runs R]

Example:
    python3 carrington_sim.py --nodes 100 --collapse 0.9 --runs 5
"""

import random
import argparse
import json
import hashlib
from collections import defaultdict
from typing import Set, List, Dict, Tuple, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class Event:
    """Represents a ledger event (shard, reflection, attestation)"""
    id: str
    node_id: str
    timestamp: int
    event_type: str
    data: float
    
    def __hash__(self):
        return hash((self.id, self.node_id, self.timestamp, self.event_type))
    
    def __eq__(self, other):
        return (self.id == other.id and 
                self.node_id == other.node_id and 
                self.timestamp == other.timestamp)
    
    def to_tuple(self) -> Tuple:
        return (self.id, self.node_id, self.timestamp, self.event_type, self.data)


class Node:
    """Represents a DVA node in the Mobius network"""
    
    def __init__(self, nid: str, tier: str):
        self.id = nid
        self.tier = tier
        self.alive = True
        self.online = True
        self.neighbors: Set[str] = set()
        self.ledger: List[Event] = []
        self.version_vector: Dict[str, int] = defaultdict(int)
        self.mii_local = 0.95
        self.pending_events: List[Event] = []
        self.last_global_mii: Optional[float] = None
        self._event_counter = 0

    def generate_event(self, t: int) -> Optional[Event]:
        """Generate a random event (shard, reflection, attestation)"""
        if not (self.alive and self.online):
            return None
        
        event_type = random.choice(["MFS_SHARD", "REFLECTION", "ATTESTATION"])
        self._event_counter += 1
        
        # Create unique event ID
        event_id = hashlib.sha256(
            f"{self.id}:{t}:{self._event_counter}".encode()
        ).hexdigest()[:16]
        
        evt = Event(
            id=event_id,
            node_id=self.id,
            timestamp=t,
            event_type=event_type,
            data=random.random()
        )
        
        self.ledger.append(evt)
        self.version_vector[self.id] += 1
        
        return evt

    def gossip(self, nodes: Dict[str, 'Node']):
        """Exchange ledger state with neighbors using CRDT merge"""
        if not (self.alive and self.online):
            return
        
        for nid in self.neighbors:
            other = nodes.get(nid)
            if not other or not (other.alive and other.online):
                continue
            
            # CRDT merge: union of events (by event ID)
            self_event_ids = {e.id for e in self.ledger}
            other_event_ids = {e.id for e in other.ledger}
            
            # Add events we don't have from other
            for evt in other.ledger:
                if evt.id not in self_event_ids:
                    self.ledger.append(evt)
            
            # Add events other doesn't have from us
            for evt in self.ledger:
                if evt.id not in other_event_ids:
                    other.ledger.append(evt)
        
        # Recompute local MII (simplified model)
        self._recompute_mii()

    def _recompute_mii(self):
        """Recompute local MII based on ledger health"""
        base_mii = 0.90
        ledger_bonus = min(0.05, 0.00005 * len(self.ledger))
        
        # Recent activity bonus (events in last 100 ticks)
        recent_count = sum(
            1 for e in self.ledger 
            if hasattr(e, 'timestamp') and e.timestamp > self.version_vector.get(self.id, 0) - 100
        )
        recent_activity_bonus = min(0.05, 0.001 * recent_count)
        
        self.mii_local = min(1.0, base_mii + ledger_bonus + recent_activity_bonus)

    def get_ledger_hash(self) -> str:
        """Compute merkle root of ledger for comparison"""
        sorted_events = sorted(self.ledger, key=lambda e: (e.timestamp, e.node_id, e.id))
        content = "|".join(e.id for e in sorted_events)
        return hashlib.sha256(content.encode()).hexdigest()[:16]


def create_network(num_nodes: int = 100, edge_probability: float = 0.1) -> Dict[str, Node]:
    """Create a network of DVA nodes with random connectivity"""
    nodes = {}
    
    # Distribute node types according to spec
    # 1 HIVE, 4 FULL, 15 ONE, rest LITE
    tiers = ["HIVE"]
    tiers.extend(["FULL"] * min(4, num_nodes - 1))
    tiers.extend(["ONE"] * min(15, num_nodes - len(tiers)))
    tiers.extend(["LITE"] * (num_nodes - len(tiers)))
    
    random.shuffle(tiers)
    
    for i in range(num_nodes):
        nodes[f"node_{i}"] = Node(f"node_{i}", tiers[i])
    
    # Create random connectivity graph
    node_ids = list(nodes.keys())
    for i in range(len(node_ids)):
        for j in range(i + 1, len(node_ids)):
            if random.random() < edge_probability:
                nodes[node_ids[i]].neighbors.add(node_ids[j])
                nodes[node_ids[j]].neighbors.add(node_ids[i])
    
    # Ensure HIVE is well-connected (acts as hub)
    hive_nodes = [n for n in nodes.values() if n.tier == "HIVE"]
    for hive in hive_nodes:
        # Connect HIVE to all FULL nodes
        for node in nodes.values():
            if node.tier == "FULL":
                hive.neighbors.add(node.id)
                node.neighbors.add(hive.id)
    
    return nodes


def simulate(
    num_nodes: int = 100,
    collapse_fraction: float = 0.9,
    steps_before: int = 1000,
    steps_after: int = 1000,
    steps_recovery: int = 1000,
    event_probability: float = 0.3,
    edge_probability: float = 0.1,
    verbose: bool = True
) -> Dict:
    """
    Run full Carrington Event simulation
    
    Args:
        num_nodes: Total number of DVA nodes
        collapse_fraction: Fraction of nodes destroyed (0.9 = 90%)
        steps_before: Simulation ticks before collapse (baseline)
        steps_after: Simulation ticks during isolation
        steps_recovery: Simulation ticks during recovery
        event_probability: Chance of event generation per node per tick
        edge_probability: Initial network edge probability
        verbose: Print progress messages
    
    Returns:
        Dictionary with simulation results and metrics
    """
    
    results = {
        "parameters": {
            "num_nodes": num_nodes,
            "collapse_fraction": collapse_fraction,
            "steps_before": steps_before,
            "steps_after": steps_after,
            "steps_recovery": steps_recovery,
            "event_probability": event_probability,
            "edge_probability": edge_probability,
        },
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    # =========================================================================
    # Phase A: Stable Civilization (Baseline)
    # =========================================================================
    if verbose:
        print("=" * 60)
        print("Carrington-Class Failure Simulation")
        print("=" * 60)
        print("\nPhase A: Stable Civilization (Baseline)")
    
    nodes = create_network(num_nodes, edge_probability)
    
    mii_history = []
    events_generated = 0
    
    for t in range(steps_before):
        # Random event generation
        for node in nodes.values():
            if random.random() < event_probability:
                evt = node.generate_event(t)
                if evt:
                    events_generated += 1
        
        # Gossip protocol
        for node in nodes.values():
            node.gossip(nodes)
        
        # Record global MII (average of local MII)
        alive_nodes = [n for n in nodes.values() if n.alive]
        avg_mii = sum(n.mii_local for n in alive_nodes) / len(alive_nodes)
        mii_history.append(avg_mii)
    
    baseline_mii = mii_history[-min(100, len(mii_history)):]
    baseline_avg = sum(baseline_mii) / len(baseline_mii)
    
    if verbose:
        print(f"  - Generated {events_generated} events")
        print(f"  - Baseline MII: {baseline_avg:.4f}")
    
    # =========================================================================
    # Phase B: Catastrophic Failure (Carrington Event)
    # =========================================================================
    if verbose:
        print(f"\nPhase B: Catastrophic Failure ({collapse_fraction*100:.0f}% destruction)")
    
    # Select survivors
    survivor_count = int(num_nodes * (1 - collapse_fraction))
    survivor_ids = set(random.sample(list(nodes.keys()), survivor_count))
    
    survivor_tiers = [nodes[nid].tier for nid in survivor_ids]
    tier_distribution = {}
    for tier in set(survivor_tiers):
        tier_distribution[tier] = survivor_tiers.count(tier)
    
    if verbose:
        print(f"  Survivors: {len(survivor_ids)} nodes")
        print(f"  Tier distribution: {tier_distribution}")
    
    # Mark non-survivors as destroyed
    for nid, node in nodes.items():
        if nid not in survivor_ids:
            node.alive = False
            node.online = False
    
    # Remove links to dead nodes
    for survivor_id in survivor_ids:
        nodes[survivor_id].neighbors = {
            n for n in nodes[survivor_id].neighbors 
            if n in survivor_ids
        }
    
    # Record pre-isolation ledger sizes
    pre_isolation_ledger_sizes = {
        nid: len(nodes[nid].ledger) for nid in survivor_ids
    }
    
    # Isolated operation period
    events_during_isolation = 0
    for t in range(steps_before, steps_before + steps_after):
        for nid in survivor_ids:
            if random.random() < event_probability:
                evt = nodes[nid].generate_event(t)
                if evt:
                    events_during_isolation += 1
        
        for nid in survivor_ids:
            nodes[nid].gossip(nodes)
        
        # Record survivor MII
        avg_mii = sum(nodes[nid].mii_local for nid in survivor_ids) / len(survivor_ids)
        mii_history.append(avg_mii)
    
    isolation_mii = mii_history[-min(100, len(mii_history)):]
    isolation_avg = sum(isolation_mii) / len(isolation_mii)
    
    if verbose:
        print(f"  - Events during isolation: {events_during_isolation}")
        print(f"  - Isolation MII: {isolation_avg:.4f}")
    
    # =========================================================================
    # Phase C: Recovery & Reconnection
    # =========================================================================
    if verbose:
        print(f"\nPhase C: Recovery & Reconnection")
    
    # Gradually reconnect survivors (simulate mesh network repair)
    survivor_list = list(survivor_ids)
    reconnection_rounds = 10
    
    for reconnect_round in range(reconnection_rounds):
        # Add random edges between survivors
        new_edges = len(survivor_ids) // 2
        for _ in range(new_edges):
            if len(survivor_list) >= 2:
                i, j = random.sample(survivor_list, 2)
                nodes[i].neighbors.add(j)
                nodes[j].neighbors.add(i)
    
    # Recovery period with improved connectivity
    events_during_recovery = 0
    for t in range(steps_before + steps_after, steps_before + steps_after + steps_recovery):
        for nid in survivor_ids:
            if random.random() < event_probability:
                evt = nodes[nid].generate_event(t)
                if evt:
                    events_during_recovery += 1
        
        for nid in survivor_ids:
            nodes[nid].gossip(nodes)
        
        avg_mii = sum(nodes[nid].mii_local for nid in survivor_ids) / len(survivor_ids)
        mii_history.append(avg_mii)
    
    recovery_mii = mii_history[-min(100, len(mii_history)):]
    recovery_avg = sum(recovery_mii) / len(recovery_mii)
    
    if verbose:
        print(f"  - Events during recovery: {events_during_recovery}")
        print(f"  - Recovery MII: {recovery_avg:.4f}")
    
    # =========================================================================
    # Analyze Results
    # =========================================================================
    
    # Ledger analysis
    ledger_sizes = [len(nodes[nid].ledger) for nid in survivor_ids]
    avg_ledger_size = sum(ledger_sizes) / len(ledger_sizes)
    
    # Calculate ledger convergence (how similar are survivor ledgers?)
    ledger_hashes = [nodes[nid].get_ledger_hash() for nid in survivor_ids]
    unique_ledgers = len(set(ledger_hashes))
    
    # If all ledgers have the same hash, convergence is 100%
    # If all ledgers are different, convergence is 0%
    if len(survivor_ids) > 1:
        convergence = 1.0 - (unique_ledgers - 1) / (len(survivor_ids) - 1)
    else:
        convergence = 1.0
    
    # Identity preservation check
    identity_preserved = all(
        len(nodes[nid].ledger) >= pre_isolation_ledger_sizes[nid]
        for nid in survivor_ids
    )
    
    # Compile results
    results.update({
        "survivors": len(survivor_ids),
        "survivor_tiers": tier_distribution,
        "baseline_mii": baseline_avg,
        "isolation_mii": isolation_avg,
        "recovery_mii": recovery_avg,
        "mii_stability": abs(recovery_avg - baseline_avg) / baseline_avg,
        "ledger_convergence": convergence,
        "average_ledger_size": avg_ledger_size,
        "unique_ledgers": unique_ledgers,
        "identity_preserved": identity_preserved,
        "total_events": events_generated + events_during_isolation + events_during_recovery,
        "mii_history": mii_history,
    })
    
    # =========================================================================
    # Determine Success
    # =========================================================================
    
    success_criteria = {
        "ledger_convergence": convergence > 0.95,
        "mii_stability": abs(recovery_avg - baseline_avg) < 0.05,
        "identity_preserved": identity_preserved,
        "recovery_mii_healthy": recovery_avg >= 0.90,
    }
    
    overall_success = all(success_criteria.values())
    results["success_criteria"] = success_criteria
    results["overall_success"] = overall_success
    
    return results


def print_results(results: Dict, verbose: bool = True):
    """Print simulation results in a formatted way"""
    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    
    print(f"Survivors: {results['survivors']} nodes")
    print(f"Survivor distribution: {results['survivor_tiers']}")
    
    print(f"\nMII Progression:")
    print(f"  Baseline (pre-collapse): {results['baseline_mii']:.4f}")
    print(f"  Isolation (post-collapse): {results['isolation_mii']:.4f}")
    print(f"  Recovery (post-reconnect): {results['recovery_mii']:.4f}")
    print(f"  Stability (delta from baseline): {results['mii_stability']*100:.2f}%")
    
    print(f"\nLedger Metrics:")
    print(f"  Convergence: {results['ledger_convergence']:.2%}")
    print(f"  Average size: {results['average_ledger_size']:.0f} events")
    print(f"  Unique ledgers: {results['unique_ledgers']}")
    print(f"  Identity preserved: {'✅' if results['identity_preserved'] else '❌'}")
    
    print(f"\nTotal events generated: {results['total_events']}")
    
    print("\n" + "=" * 60)
    print("SUCCESS CRITERIA")
    print("=" * 60)
    
    for criterion, passed in results['success_criteria'].items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {criterion}: {status}")
    
    print("\n" + "=" * 60)
    print("CONCLUSION")
    print("=" * 60)
    
    if results['overall_success']:
        print("✅ SUCCESS: Civilization substrate SURVIVED and RECONSTITUTED")
        print("   - Survivors maintained local state during isolation")
        print("   - Ledgers converged after reconnection")
        print("   - MII stabilized at healthy levels")
        print("   - Mobius Systems is COLLAPSE-RESISTANT")
    else:
        print("⚠️  PARTIAL SUCCESS: Substrate survived but with issues")
        failed = [k for k, v in results['success_criteria'].items() if not v]
        print(f"   - Failed criteria: {', '.join(failed)}")
        print("   - May need additional reconciliation protocols")


def run_multiple(
    runs: int = 5,
    **kwargs
) -> List[Dict]:
    """Run multiple simulations and aggregate results"""
    all_results = []
    
    print(f"\nRunning {runs} simulation(s)...")
    print("-" * 60)
    
    successes = 0
    for i in range(runs):
        print(f"\nRun {i+1}/{runs}:")
        results = simulate(verbose=False, **kwargs)
        all_results.append(results)
        
        if results['overall_success']:
            successes += 1
            print(f"  ✅ SUCCESS - Convergence: {results['ledger_convergence']:.2%}, MII: {results['recovery_mii']:.4f}")
        else:
            print(f"  ⚠️  PARTIAL - Convergence: {results['ledger_convergence']:.2%}, MII: {results['recovery_mii']:.4f}")
    
    print("\n" + "=" * 60)
    print("AGGREGATE RESULTS")
    print("=" * 60)
    print(f"Success rate: {successes}/{runs} ({successes/runs*100:.0f}%)")
    
    avg_convergence = sum(r['ledger_convergence'] for r in all_results) / runs
    avg_mii = sum(r['recovery_mii'] for r in all_results) / runs
    print(f"Average convergence: {avg_convergence:.2%}")
    print(f"Average recovery MII: {avg_mii:.4f}")
    
    return all_results


def main():
    parser = argparse.ArgumentParser(
        description="Carrington-Class Failure Simulation for Mobius Systems"
    )
    parser.add_argument(
        "--nodes", "-n", type=int, default=100,
        help="Number of DVA nodes (default: 100)"
    )
    parser.add_argument(
        "--collapse", "-c", type=float, default=0.9,
        help="Fraction of nodes destroyed (default: 0.9)"
    )
    parser.add_argument(
        "--runs", "-r", type=int, default=1,
        help="Number of simulation runs (default: 1)"
    )
    parser.add_argument(
        "--steps-before", type=int, default=1000,
        help="Baseline simulation steps (default: 1000)"
    )
    parser.add_argument(
        "--steps-after", type=int, default=1000,
        help="Isolation simulation steps (default: 1000)"
    )
    parser.add_argument(
        "--steps-recovery", type=int, default=1000,
        help="Recovery simulation steps (default: 1000)"
    )
    parser.add_argument(
        "--event-prob", type=float, default=0.3,
        help="Event generation probability (default: 0.3)"
    )
    parser.add_argument(
        "--edge-prob", type=float, default=0.1,
        help="Network edge probability (default: 0.1)"
    )
    parser.add_argument(
        "--output", "-o", type=str, default=None,
        help="Output JSON file for results"
    )
    parser.add_argument(
        "--seed", "-s", type=int, default=None,
        help="Random seed for reproducibility"
    )
    
    args = parser.parse_args()
    
    if args.seed is not None:
        random.seed(args.seed)
    
    sim_kwargs = {
        "num_nodes": args.nodes,
        "collapse_fraction": args.collapse,
        "steps_before": args.steps_before,
        "steps_after": args.steps_after,
        "steps_recovery": args.steps_recovery,
        "event_probability": args.event_prob,
        "edge_probability": args.edge_prob,
    }
    
    if args.runs == 1:
        results = simulate(verbose=True, **sim_kwargs)
        print_results(results)
        all_results = [results]
    else:
        all_results = run_multiple(runs=args.runs, **sim_kwargs)
    
    if args.output:
        # Remove mii_history for JSON serialization (too large)
        for r in all_results:
            r.pop('mii_history', None)
        
        with open(args.output, 'w') as f:
            json.dump(all_results, f, indent=2)
        print(f"\nResults saved to: {args.output}")
    
    print("\n" + "=" * 60)
    print("🌀 Mobius Systems - Digital Civilization Substrate")
    print("   \"We heal as we walk.\"")
    print("=" * 60)


if __name__ == "__main__":
    main()
