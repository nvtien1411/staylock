import { DEMO_HOST_WALLET } from "@/app/lib/listings";

// Static seed — always verified regardless of localStorage state.
const SEED_HOSTS = new Set([DEMO_HOST_WALLET]);

// Runtime-mutable set. Starts from seed + any previously approved wallets in localStorage.
// In production this would be an on-chain registry; for the demo it is a curated allowlist
// with a simulated review flow for new applicants.
const _runtimeHosts: Set<string> = new Set(SEED_HOSTS);

const STORAGE_KEY = "staylock_approved_hosts";

// Hydrate from localStorage on module load (browser only).
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        for (const addr of parsed) {
          if (typeof addr === "string" && addr.length > 0) {
            _runtimeHosts.add(addr);
          }
        }
      }
    }
  } catch {
    // Ignore malformed storage
  }
}

function persistApproved() {
  if (typeof window === "undefined") return;
  try {
    // Only persist non-seed wallets to keep storage minimal
    const extra = [..._runtimeHosts].filter((a) => !SEED_HOSTS.has(a));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extra));
  } catch {
    // Ignore storage errors
  }
}

export function isVerifiedHost(address: string): boolean {
  return Boolean(address) && _runtimeHosts.has(address);
}

// Called after simulated review approval to grant host access.
export function approveHost(address: string): void {
  if (!address) return;
  _runtimeHosts.add(address);
  persistApproved();
}
