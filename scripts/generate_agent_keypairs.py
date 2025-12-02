#!/usr/bin/env python3
"""
Generate Ed25519 Keypairs for Mobius Agents
==========================================

Generates cryptographic keypairs for all agents in the Mobius Agent Stack.
Keys are stored in .keys/ directory (gitignored for security).

Usage:
    python scripts/generate_agent_keypairs.py
    python scripts/generate_agent_keypairs.py --agent ATLAS
"""

import sys
import json
from pathlib import Path
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

# Note: This script uses cryptography directly, no need to import from packages


def get_all_agents(manifest_path: str = "config/agents/mobius_agent_stack.v1.1.2.json") -> list:
    """Get list of all agent IDs from manifest."""
    manifest_file = Path(manifest_path)
    
    if not manifest_file.exists():
        raise FileNotFoundError(f"Manifest not found: {manifest_path}")
    
    with open(manifest_file, 'r') as f:
        manifest = json.load(f)
    
    agents = []
    for tier in manifest.get('tiers', []):
        for agent in tier.get('agents', []):
            agents.append(agent['id'])
    
    return agents


def generate_keys_for_agent(agent_id: str, output_dir: str = ".keys"):
    """Generate keypair for a single agent."""
    agent_dir = Path(output_dir) / agent_id.lower()
    agent_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"🔑 Generating keys for {agent_id}...")
    
    # Generate keypair
    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    
    # Save private key
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    private_path = agent_dir / f"{agent_id.lower()}_private_key.pem"
    with open(private_path, 'wb') as f:
        f.write(private_pem)
    
    # Save public key
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    public_path = agent_dir / f"{agent_id.lower()}_public_key.pem"
    with open(public_path, 'wb') as f:
        f.write(public_pem)
    
    # Set permissions (Unix only)
    import os
    os.chmod(private_path, 0o600)
    os.chmod(public_path, 0o644)
    
    print(f"   ✅ Private key: {private_path}")
    print(f"   ✅ Public key:  {public_path}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate Ed25519 keypairs for Mobius agents")
    parser.add_argument("--agent", help="Generate keys for specific agent only")
    parser.add_argument("--manifest", default="config/agents/mobius_agent_stack.v1.1.2.json",
                       help="Path to agent manifest")
    parser.add_argument("--output-dir", default=".keys", help="Output directory for keys")
    
    args = parser.parse_args()
    
    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Create .gitignore if it doesn't exist
    gitignore_path = output_dir / ".gitignore"
    if not gitignore_path.exists():
        with open(gitignore_path, 'w') as f:
            f.write("# Agent private keys - DO NOT COMMIT\n")
            f.write("*_private_key.pem\n")
        print(f"✅ Created .gitignore in {output_dir}/")
    
    print("=" * 70)
    print("MOBIUS AGENT KEYPAIR GENERATION")
    print("=" * 70)
    print()
    
    if args.agent:
        # Generate for single agent
        generate_keys_for_agent(args.agent.upper(), args.output_dir)
    else:
        # Generate for all agents
        try:
            agents = get_all_agents(args.manifest)
            print(f"Found {len(agents)} agents in manifest")
            print()
            
            for agent_id in agents:
                generate_keys_for_agent(agent_id, args.output_dir)
                print()
            
            print("=" * 70)
            print(f"✅ Generated keypairs for {len(agents)} agents")
            print(f"   Keys stored in: {output_dir.absolute()}/")
            print()
            print("⚠️  SECURITY WARNING:")
            print("   - Private keys are stored in .keys/ (gitignored)")
            print("   - DO NOT commit private keys to version control")
            print("   - Share public keys with Genesis Ledger service")
            print("=" * 70)
            
        except FileNotFoundError as e:
            print(f"❌ Error: {e}")
            print("   Run from repository root or provide --manifest path")
            sys.exit(1)


if __name__ == "__main__":
    main()
