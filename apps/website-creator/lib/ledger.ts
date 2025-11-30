type Reservation = { reservation_id: string; fee: string; expires_at: string };

interface Profile {
  "@context": string[];
  name: string;
  identifier: string;
  bio: string;
  links: { href: string; title: string }[];
  badges: string[];
}

interface Proofs {
  ledgerHash: string;
  timestamp: string;
}

type Resolution = {
  name: string;
  did: string;
  owner_keys: string[];
  content_root: string;
  profile: Profile;
  proofs: Proofs;
};

interface DBEntry {
  reservation_id: string;
  name: string;
  pubkey: string;
  committed: boolean;
  created_at: string;
  did?: string;
  content_root?: string;
  profile?: Profile;
  proofs?: Proofs;
}

const memoryDB: Record<string, DBEntry> = {};

export async function reserveName(name: string, pubkey: string): Promise<Reservation> {
  if (!name || !/^[a-z0-9-]{3,30}$/.test(name)) throw new Error('Invalid name');
  if (!pubkey) throw new Error('Missing pubkey');
  if (memoryDB[name]) throw new Error('Name already reserved');
  const reservation_id = 'resv_' + Math.random().toString(36).slice(2);
  memoryDB[name] = { reservation_id, name, pubkey, committed: false, created_at: new Date().toISOString() };
  return { reservation_id, fee: '1000 sats', expires_at: new Date(Date.now()+3600_000).toISOString() };
}

export async function commitName(reservation_id: string, did: string, content_root: string) {
  const entry = Object.values(memoryDB).find((v)=>v.reservation_id===reservation_id);
  if (!entry) throw new Error('Reservation not found');
  entry.did = did || ('did:gic:' + Math.random().toString(36).slice(2));
  entry.content_root = content_root || 'ipfs://placeholder';
  entry.committed = true;
  entry.profile = {
    "@context": ["https://schema.org","https://gic.schema.org"],
    name: entry.name + ".gic",
    identifier: entry.did,
    bio: "New Civic Home",
    links: [],
    badges: []
  };
  entry.proofs = { ledgerHash: "sha256:" + Math.random().toString(36).slice(2), timestamp: new Date().toISOString() };
  return { ok: true, ledger_hash: entry.proofs.ledgerHash };
}

export async function resolveName(name: string): Promise<Resolution> {
  const entry = memoryDB[name];
  if (!entry || !entry.committed) throw new Error('Name not found or not committed');
  if (!entry.did || !entry.content_root || !entry.profile || !entry.proofs) {
    throw new Error('Name not fully registered');
  }
  return {
    name: entry.name + ".gic",
    did: entry.did,
    owner_keys: [entry.pubkey],
    content_root: entry.content_root,
    profile: entry.profile,
    proofs: entry.proofs
  };
}

export async function submitAttestation(body: Record<string, unknown>) {
  return { ok: true, received: body, ts: new Date().toISOString() };
}

