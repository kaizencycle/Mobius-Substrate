#!/usr/bin/env ts-node
/**
 * Create Founders MIC Wallets
 * 
 * Creates two wallets for the Mobius founder:
 * 1. Founders Reserve (1M MIC, locked, ceremonial)
 * 2. Michael's Active Wallet (0 MIC initially, operational)
 * 
 * Cycle: C-156
 * Date: December 6, 2025
 * 
 * Usage: ts-node scripts/create-founders-wallets.ts
 *        npx tsx scripts/create-founders-wallets.ts
 */

import { randomBytes, createHash, createCipheriv, pbkdf2Sync } from 'crypto';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Wallet {
    walletId: string;
    publicKey: string;
    balance: number;
    locked: boolean;
    type: 'ceremonial' | 'operational';
    createdAt: string;
}

interface FoundersReserveWallet extends Wallet {
    constitutionalNote: string;
    requiredSignatures: number;
    totalSigners: number;
    signers: string[];
    audit: {
        lastAudit: string;
        accessAttempts: number;
    };
}

interface ActiveWallet extends Wallet {
    userId: string;
    privateKeyHash: string;
    permissions: {
        receiveStipends: boolean;
        sendMIC: boolean;
        voteGovernance: boolean;
        submitProposals: boolean;
        redeemShards: boolean;
        stakeIntegrity: boolean;
    };
    stipendSources: string[];
    mii: {
        current: number;
        lastUpdated: string;
    };
}

interface KeyPair {
    publicKey: string;
    privateKey: string;
}

interface EncryptedData {
    version: string;
    algorithm: string;
    encrypted: string;
    iv: string;
    salt: string;
    createdAt: string;
}

interface AuditLogEntry {
    event: string;
    cycle: number;
    timestamp: string;
    wallets: Array<{
        id: string;
        type: string;
        balance: number;
        locked: boolean;
    }>;
    totalMIC: number;
    creator: string;
    integrity: {
        mii: number;
        constitutionalCompliance: boolean;
        auditRequired: boolean;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CYCLE = 156;
const MOBIUS_HOME = join(homedir(), '.mobius');
const WALLETS_DIR = join(MOBIUS_HOME, 'wallets');
const KEYS_DIR = join(MOBIUS_HOME, 'keys');
const AUDIT_LOG_PATH = join(MOBIUS_HOME, 'audit-log.json');

// Sentinel signers for multi-sig
const SENTINEL_SIGNERS = ['AUREA', 'ATLAS', 'ECHO', 'JADE', 'EVE', 'HERMES', 'ZEUS'];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ensure all required directories exist
 */
function ensureDirectories(): void {
    [MOBIUS_HOME, WALLETS_DIR, KEYS_DIR].forEach(dir => {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true, mode: 0o700 });
            console.log(`📁 Created directory: ${dir}`);
        }
    });
}

/**
 * Generate Ed25519 keypair (simplified for demo)
 * In production, use @noble/ed25519 or tweetnacl
 */
function generateKeyPair(): KeyPair {
    const seed = randomBytes(32);
    const publicKey = `PUB_${seed.toString('hex').substring(0, 32)}`;
    const privateKey = randomBytes(32).toString('hex');
    
    return { publicKey, privateKey };
}

/**
 * Hash private key for storage (never store plaintext)
 */
function hashPrivateKey(privateKey: string): string {
    return createHash('sha256').update(privateKey).digest('hex');
}

/**
 * Encrypt private key with AES-256-CBC
 */
function encryptPrivateKey(privateKey: string, password: string): EncryptedData {
    const salt = randomBytes(32).toString('hex');
    const key = pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const iv = randomBytes(16);
    
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
        version: '1.0',
        algorithm: 'aes-256-cbc',
        encrypted,
        iv: iv.toString('hex'),
        salt,
        createdAt: new Date().toISOString()
    };
}

/**
 * Generate 12-word mnemonic (simplified for demo)
 * In production, use BIP39 standard
 */
function generateMnemonic(): string {
    const words = [
        'mobius', 'integrity', 'kaizen', 'virtue',
        'citizen', 'guardian', 'reflection', 'shard',
        'ledger', 'substrate', 'covenant', 'trust'
    ];
    return words.join(' ');
}

// ═══════════════════════════════════════════════════════════════════════════
// WALLET CREATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create Founders Reserve Wallet (Ceremonial, 1M MIC, Locked)
 */
function createFoundersReserveWallet(): FoundersReserveWallet {
    console.log('\n🏦 Creating Founders Reserve Wallet...');
    
    const wallet: FoundersReserveWallet = {
        walletId: 'founders-reserve-001',
        publicKey: 'FND-RSRV-2025-001-MJUDAN',
        balance: 1_000_000,
        locked: true,
        type: 'ceremonial',
        createdAt: new Date().toISOString(),
        constitutionalNote: 'Founding allocation representing the initial integrity substrate. These MIC shall never be spent, serving as the immutable anchor of the Mobius economy.',
        requiredSignatures: 5,
        totalSigners: 7,
        signers: SENTINEL_SIGNERS,
        audit: {
            lastAudit: new Date().toISOString(),
            accessAttempts: 0
        }
    };
    
    // Save wallet metadata
    const metadataPath = join(WALLETS_DIR, `${wallet.walletId}.json`);
    writeFileSync(metadataPath, JSON.stringify(wallet, null, 2), { mode: 0o600 });
    
    console.log('✅ Founders Reserve Wallet created');
    console.log(`   Wallet ID: ${wallet.walletId}`);
    console.log(`   Public Key: ${wallet.publicKey}`);
    console.log(`   Balance: ${wallet.balance.toLocaleString()} MIC`);
    console.log(`   Status: ${wallet.locked ? 'LOCKED' : 'UNLOCKED'}`);
    console.log(`   Metadata: ${metadataPath}`);
    
    return wallet;
}

/**
 * Create Michael's Active Wallet (Operational, 0 MIC, Active)
 */
function createMichaelActiveWallet(): {
    wallet: ActiveWallet;
    privateKey: string;
    mnemonic: string;
} {
    console.log('\n🔐 Creating Michael\'s Active Wallet...');
    
    // Generate keys
    const { publicKey, privateKey } = generateKeyPair();
    const privateKeyHash = hashPrivateKey(privateKey);
    const mnemonic = generateMnemonic();
    
    const wallet: ActiveWallet = {
        walletId: 'michael-judan-active-001',
        userId: 'michael-judan',
        publicKey: publicKey,
        privateKeyHash: privateKeyHash,
        balance: 0,
        locked: false,
        type: 'operational',
        createdAt: new Date().toISOString(),
        permissions: {
            receiveStipends: true,
            sendMIC: true,
            voteGovernance: true,
            submitProposals: true,
            redeemShards: true,
            stakeIntegrity: true
        },
        stipendSources: [
            'daily_reflection',
            'cycle_documentation',
            'shard_redemption',
            'governance_vote',
            'guardian_attestation'
        ],
        mii: {
            current: 0.95,
            lastUpdated: new Date().toISOString()
        }
    };
    
    // Save wallet metadata
    const metadataPath = join(WALLETS_DIR, `${wallet.walletId}.json`);
    writeFileSync(metadataPath, JSON.stringify(wallet, null, 2), { mode: 0o600 });
    
    console.log('✅ Michael\'s Active Wallet created');
    console.log(`   Wallet ID: ${wallet.walletId}`);
    console.log(`   Public Key: ${publicKey.substring(0, 40)}...`);
    console.log(`   Balance: ${wallet.balance} MIC`);
    console.log(`   Status: ACTIVE`);
    console.log(`   Metadata: ${metadataPath}`);
    
    return { wallet, privateKey, mnemonic };
}

/**
 * Save private key securely
 */
function savePrivateKeySecurely(
    walletId: string,
    privateKey: string,
    mnemonic: string
): void {
    console.log('\n💾 Saving private key securely...');
    
    // Get password from environment or use default (with warning)
    const password = process.env.WALLET_PASSWORD || 'CHANGE_ME_IMMEDIATELY';
    
    if (password === 'CHANGE_ME_IMMEDIATELY') {
        console.warn('⚠️  WARNING: Using default password! Set WALLET_PASSWORD env var.');
    }
    
    // Encrypt private key
    const encryptedKey = encryptPrivateKey(privateKey, password);
    
    // Save encrypted private key
    const keyPath = join(WALLETS_DIR, `${walletId}.enc`);
    writeFileSync(keyPath, JSON.stringify({
        walletId,
        ...encryptedKey
    }, null, 2), { mode: 0o600 });
    
    // Save recovery mnemonic (separately encrypted)
    const mnemonicPath = join(KEYS_DIR, 'recovery-phrase.enc');
    const encryptedMnemonic = encryptPrivateKey(mnemonic, password);
    writeFileSync(mnemonicPath, JSON.stringify({
        walletId,
        ...encryptedMnemonic
    }, null, 2), { mode: 0o600 });
    
    console.log('✅ Private key saved');
    console.log(`   Encrypted key: ${keyPath}`);
    console.log(`   Recovery phrase: ${mnemonicPath}`);
    console.log('   ⚠️  Keep these files secure and backed up!');
}

/**
 * Create audit log entry
 */
function createAuditLog(
    reserveWallet: FoundersReserveWallet,
    activeWallet: ActiveWallet
): void {
    console.log('\n📝 Creating audit log...');
    
    const auditEntry: AuditLogEntry = {
        event: 'FOUNDERS_WALLETS_CREATED',
        cycle: CYCLE,
        timestamp: new Date().toISOString(),
        wallets: [
            {
                id: reserveWallet.walletId,
                type: reserveWallet.type,
                balance: reserveWallet.balance,
                locked: reserveWallet.locked
            },
            {
                id: activeWallet.walletId,
                type: activeWallet.type,
                balance: activeWallet.balance,
                locked: activeWallet.locked
            }
        ],
        totalMIC: reserveWallet.balance + activeWallet.balance,
        creator: 'Michael Judan (Founder)',
        integrity: {
            mii: 0.95,
            constitutionalCompliance: true,
            auditRequired: true
        }
    };
    
    // Read existing logs or create new array
    let existingLogs: AuditLogEntry[] = [];
    if (existsSync(AUDIT_LOG_PATH)) {
        try {
            existingLogs = JSON.parse(readFileSync(AUDIT_LOG_PATH, 'utf8'));
        } catch {
            existingLogs = [];
        }
    }
    
    existingLogs.push(auditEntry);
    writeFileSync(AUDIT_LOG_PATH, JSON.stringify(existingLogs, null, 2), { mode: 0o600 });
    
    console.log('✅ Audit log created');
    console.log(`   Location: ${AUDIT_LOG_PATH}`);
}

/**
 * Create README for wallet directory
 */
function createWalletReadme(): void {
    const readmePath = join(MOBIUS_HOME, 'README.md');
    const content = `# Mobius MIC Wallet Directory

**Created:** ${new Date().toISOString()}  
**Cycle:** C-${CYCLE}

---

## Security

- All files are permission 600 (owner read/write only)
- Never share wallet files or keys
- Keep backups in secure, offline locations
- Recovery phrase is in \`keys/recovery-phrase.enc\` (encrypted)

---

## Wallets

### Founders Reserve (\`founders-reserve-001\`)
- **Balance:** 1,000,000 MIC
- **Type:** Ceremonial (locked)
- **Purpose:** Constitutional anchor, never spent
- **Access:** Requires 5 of 7 sentinel signatures

### Michael's Active Wallet (\`michael-judan-active-001\`)
- **Balance:** 0 MIC (initially)
- **Type:** Operational
- **Purpose:** Daily operations, stipends, testing
- **Access:** Standard private key

---

## Stipend Sources

Your active wallet can receive MIC from:
- Daily reflections (E.O.M.M. completion)
- Cycle documentation
- Shard redemption (7 shards → MIC)
- Governance participation
- Guardian attestations

---

## File Structure

\`\`\`
~/.mobius/
├── wallets/
│   ├── founders-reserve-001.json      # Reserve metadata
│   ├── michael-judan-active-001.json  # Active wallet metadata
│   └── michael-judan-active-001.enc   # Encrypted private key
├── keys/
│   └── recovery-phrase.enc            # Encrypted mnemonic
├── audit-log.json                      # Audit trail
└── README.md                           # This file
\`\`\`

---

## Support

For questions: See \`specs/civic-ledger/economy/founders-mic-wallets.md\`

---

*"Integrity moves. Wallets follow."*
`;
    
    writeFileSync(readmePath, content, { mode: 0o600 });
}

/**
 * Print summary
 */
function printSummary(
    reserveWallet: FoundersReserveWallet,
    activeWallet: ActiveWallet
): void {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 FOUNDERS MIC WALLET STRUCTURE COMPLETE');
    console.log('═'.repeat(60));
    console.log();
    console.log('Wallets Created:');
    console.log(`  1. ${reserveWallet.walletId}`);
    console.log(`     Balance: ${reserveWallet.balance.toLocaleString()} MIC`);
    console.log(`     Status: ${reserveWallet.locked ? 'LOCKED (Ceremonial)' : 'ACTIVE'}`);
    console.log();
    console.log(`  2. ${activeWallet.walletId}`);
    console.log(`     Balance: ${activeWallet.balance.toLocaleString()} MIC`);
    console.log(`     Status: ${activeWallet.locked ? 'LOCKED' : 'ACTIVE (Operational)'}`);
    console.log();
    console.log('System Summary:');
    console.log(`  Total MIC in System: ${(reserveWallet.balance + activeWallet.balance).toLocaleString()} MIC`);
    console.log(`  Reserve (Locked): ${reserveWallet.balance.toLocaleString()} MIC`);
    console.log(`  Circulating: ${activeWallet.balance.toLocaleString()} MIC`);
    console.log();
    console.log('Next Steps:');
    console.log('  1. Configure stipend distribution rules');
    console.log('  2. Test shard redemption workflow');
    console.log('  3. Set up governance voting mechanism');
    console.log('  4. Create backup of recovery phrase (offline)');
    console.log('  5. Implement multi-signature for reserve wallet');
    console.log();
    console.log('Files Created:');
    console.log(`  ${join(WALLETS_DIR, reserveWallet.walletId + '.json')}`);
    console.log(`  ${join(WALLETS_DIR, activeWallet.walletId + '.json')}`);
    console.log(`  ${join(WALLETS_DIR, activeWallet.walletId + '.enc')}`);
    console.log(`  ${join(KEYS_DIR, 'recovery-phrase.enc')}`);
    console.log(`  ${AUDIT_LOG_PATH}`);
    console.log(`  ${join(MOBIUS_HOME, 'README.md')}`);
    console.log();
    console.log('⚠️  IMPORTANT SECURITY REMINDERS:');
    console.log('  - Back up your recovery phrase to offline storage');
    console.log('  - Set WALLET_PASSWORD environment variable');
    console.log('  - Never share your private key');
    console.log('  - Store encrypted files in multiple secure locations');
    console.log();
    console.log('✨ Ready for MIC stipend distribution!');
    console.log('═'.repeat(60));
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
    try {
        console.log('🌀 Mobius Integrity Credits - Founders Wallet Creation');
        console.log(`   Cycle: C-${CYCLE}`);
        console.log(`   Date: ${new Date().toISOString().split('T')[0]}`);
        
        // Ensure directories exist
        ensureDirectories();
        
        // Create wallets
        const reserveWallet = createFoundersReserveWallet();
        const { wallet: activeWallet, privateKey, mnemonic } = createMichaelActiveWallet();
        
        // Save private key securely
        savePrivateKeySecurely(activeWallet.walletId, privateKey, mnemonic);
        
        // Create wallet directory README
        createWalletReadme();
        
        // Create audit log
        createAuditLog(reserveWallet, activeWallet);
        
        // Print summary
        printSummary(reserveWallet, activeWallet);
        
        console.log('\n🎉 Wallet creation complete!');
        
    } catch (error) {
        console.error('\n❌ Error creating wallets:', error);
        process.exit(1);
    }
}

// Execute if run directly
main();

// Export for testing
export {
    generateKeyPair,
    hashPrivateKey,
    encryptPrivateKey,
    createFoundersReserveWallet,
    createMichaelActiveWallet
};
