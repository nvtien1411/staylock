export function toJsonSafe(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(toJsonSafe);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, toJsonSafe(item)]),
    );
  }

  return value;
}

export function showError(error: unknown) {
  return JSON.stringify(
    {
      error: error instanceof Error ? error.message : String(error),
    },
    null,
    2,
  );
}

export function shortAddress(value: string) {
  return value ? `${value.slice(0, 6)}...${value.slice(-6)}` : "Connect wallet";
}

export function parseJson(value: string) {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getExplorerUrl(hash: unknown) {
  return typeof hash === "string" && hash ? `https://stellar.expert/explorer/testnet/tx/${hash}` : "";
}

export function statusMessage(result: Record<string, unknown> | null, fallback: string) {
  return typeof result?.message === "string" ? result.message : fallback;
}
