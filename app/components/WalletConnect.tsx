"use client";

import { useMemo, useState } from "react";
import { requestAccess, signTransaction } from "@stellar/freighter-api";
import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Networks,
  Transaction,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";

const CONTRACT_ID = "CDMSD7ZXERDCSRA5ENB2FDPI45FW4EMC4J6LAEM4BWSKMZFZ7SGLJ3RO";
const RPC_URL = "https://soroban-testnet.stellar.org";
const inputClass = "w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3.5 text-sm text-white placeholder:text-stone-500 outline-none transition-all duration-300 focus:border-amber-200/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-amber-200/10";
const glassCard = "rounded-[2rem] border border-white/10 bg-white/[0.065] shadow-2xl shadow-black/30 backdrop-blur-2xl";

type PropertyCard = {
  id: number;
  name: string;
  owner: string;
  status: string;
  transactionHash: string;
};

type ReservationStage = "Reserved" | "Checked In" | "Completed" | "Cancelled";
type LifecycleAction = "" | "checkin" | "checkout" | "cancel";

const lifecycleStages: Array<{
  stage: ReservationStage;
  title: string;
  description: string;
}> = [
    {
      stage: "Reserved",
      title: "Deposit protected",
      description: "The stay is reserved and escrow protection is active.",
    },
    {
      stage: "Checked In",
      title: "Stay verified",
      description: "Check-in confirms the guest has arrived and the trip is underway.",
    },
    {
      stage: "Completed",
      title: "Settlement released",
      description: "Checkout completes the stay and releases the protected settlement.",
    },
    {
      stage: "Cancelled",
      title: "Reservation closed",
      description: "Cancellation closes the stay path and prevents further progression.",
    },
  ];

const metrics = [
  ["$2.8M", "Escrow Volume"],
  ["12.4K", "Reservations"],
  ["840+", "Active Properties"],
  ["99.98%", "Settlement Reliability"],
];

const activity = [
  ["Reservation secured", "Ocean villa · 2 min ago", "+$1,240 locked"],
  ["Settlement released", "Kyoto loft · 8 min ago", "Check-in verified"],
  ["Guest wallet verified", "Lisbon townhouse · 14 min ago", "Freighter approved"],
  ["Property owner onboarded", "Alpine chalet · 22 min ago", "Ready for escrow"],
];

const escrowSteps = [
  ["01", "Funds locked securely", "Your deposit is held in escrow the moment you reserve, creating confidence for both guest and owner."],
  ["02", "Verified check-in", "Release conditions are transparent, reducing disputes before the stay begins."],
  ["03", "Trustless settlement", "The reservation settles without middlemen, delays, or opaque back-office processes."],
];

function toJsonSafe(value: unknown): unknown {
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

function showError(error: unknown) {
  return JSON.stringify(
    {
      error: error instanceof Error ? error.message : String(error),
    },
    null,
    2,
  );
}

function shortAddress(value: string) {
  return value ? `${value.slice(0, 6)}...${value.slice(-6)}` : "Connect wallet";
}

function parseJson(value: string) {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getStatusTone(status: string, busy: boolean) {
  const normalized = status.toLowerCase();

  if (busy || normalized.includes("preparing") || normalized.includes("waiting") || normalized.includes("submitting") || normalized.includes("loading") || normalized.includes("finalizing")) {
    return {
      label: "In progress",
      color: "border-amber-200/30 bg-amber-200/10 text-amber-100",
      dot: "bg-amber-200 shadow-amber-200/60",
      title: "Securing your reservation",
    };
  }

  if (normalized.includes("success") || normalized.includes("submitted") || normalized.includes("verified") || normalized.includes("created")) {
    return {
      label: "Confirmed",
      color: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
      dot: "bg-emerald-300 shadow-emerald-300/60",
      title: "Reservation submitted",
    };
  }

  if (normalized.includes("error") || normalized.includes("rejected") || normalized.includes("connect your wallet") || normalized.includes("fill all") || normalized.includes("enter")) {
    return {
      label: "Needs attention",
      color: "border-rose-300/30 bg-rose-300/10 text-rose-100",
      dot: "bg-rose-300 shadow-rose-300/60",
      title: "Action required",
    };
  }

  return {
    label: "Ready",
    color: "border-white/10 bg-white/[0.06] text-stone-200",
    dot: "bg-stone-300 shadow-stone-300/50",
    title: "Ready to reserve",
  };
}

function fieldLabel(label: string, hint: string) {
  return (
    <span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
      <span>{label}</span>
      <span className="normal-case tracking-normal text-stone-600">{hint}</span>
    </span>
  );
}

function getExplorerUrl(hash: unknown) {
  return typeof hash === "string" && hash ? `https://stellar.expert/explorer/testnet/tx/${hash}` : "";
}

function statusMessage(result: Record<string, unknown> | null, fallback: string) {
  return typeof result?.message === "string" ? result.message : fallback;
}

function getStageIndex(stage: ReservationStage) {
  return lifecycleStages.findIndex((item) => item.stage === stage);
}

export default function WalletConnect() {
  const [address, setAddress] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [response, setResponse] = useState("Enter a reservation code to view the latest stay details.");
  const [isLoading, setIsLoading] = useState(false);
  const [traveler, setTraveler] = useState("");
  const [host, setHost] = useState("");
  const [roomId, setRoomId] = useState("");
  const [amount, setAmount] = useState("");
  const [dayCheckin, setDayCheckin] = useState("");
  const [dayCheckout, setDayCheckout] = useState("");
  const [createStatus, setCreateStatus] = useState("Complete the reservation details to secure a stay.");
  const [isCreating, setIsCreating] = useState(false);
  const [hostName, setHostName] = useState("");
  const [hostStatus, setHostStatus] = useState("Create your host profile to start listing protected stays.");
  const [isAddingHost, setIsAddingHost] = useState(false);
  const [isHostOnboarded, setIsHostOnboarded] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [propertyStatus, setPropertyStatus] = useState("Add a property guests can reserve with escrow-backed confidence.");
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);
  const [properties, setProperties] = useState<PropertyCard[]>([]);
  const [lifecycleStatus, setLifecycleStatus] = useState("Track a reservation to manage check-in, completion, or cancellation.");
  const [lifecycleAction, setLifecycleAction] = useState<LifecycleAction>("");
  const [reservationStage, setReservationStage] = useState<ReservationStage>("Reserved");

  const liveTone = useMemo(() => getStatusTone(createStatus, isCreating), [createStatus, isCreating]);
  const hostTone = useMemo(() => getStatusTone(hostStatus, isAddingHost), [hostStatus, isAddingHost]);
  const propertyTone = useMemo(() => getStatusTone(propertyStatus, isCreatingProperty), [propertyStatus, isCreatingProperty]);
  const lifecycleTone = useMemo(() => getStatusTone(lifecycleStatus, Boolean(lifecycleAction)), [lifecycleStatus, lifecycleAction]);
  const createResult = useMemo(() => parseJson(createStatus), [createStatus]);
  const hostResult = useMemo(() => parseJson(hostStatus), [hostStatus]);
  const propertyResult = useMemo(() => parseJson(propertyStatus), [propertyStatus]);
  const lifecycleResult = useMemo(() => parseJson(lifecycleStatus), [lifecycleStatus]);
  const lookupResult = useMemo(() => parseJson(response), [response]);
  const transactionHash = createResult?.transactionHash;
  const explorerUrl = getExplorerUrl(transactionHash);
  const hostExplorerUrl = getExplorerUrl(hostResult?.transactionHash);
  const propertyExplorerUrl = getExplorerUrl(propertyResult?.transactionHash);
  const lifecycleExplorerUrl = getExplorerUrl(lifecycleResult?.transactionHash);
  const lookupValue = lookupResult?.value;
  const activeStageIndex = getStageIndex(reservationStage);

  async function connectWallet() {
    try {
      const result = await requestAccess();

      if (result.address) {
        setAddress(result.address);
        setTraveler(result.address);
        setHost(result.address);
      }
    } catch (error) {
      console.error(error);
      alert("Freighter wallet not found");
    }
  }

  async function getBooking() {
    if (!address) {
      setResponse("Connect your wallet first.");
      return;
    }

    if (!bookingId) {
      setResponse("Enter a reservation code first.");
      return;
    }

    setIsLoading(true);
    setResponse("Loading reservation...");

    try {
      const server = new rpc.Server(RPC_URL);
      const account = new Account(address, "0");
      const contract = new Contract(CONTRACT_ID);
      const bookingIdScVal = nativeToScVal(BigInt(bookingId), { type: "u64" });

      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(contract.call("get_booking", bookingIdScVal))
        .setTimeout(30)
        .build();

      const result = await server.simulateTransaction(transaction);

      if (rpc.Api.isSimulationError(result)) {
        setResponse(JSON.stringify(result, null, 2));
        return;
      }

      const rawXdr = result.result?.retval.toXDR("base64");
      const nativeResult = result.result
        ? scValToNative(result.result.retval as xdr.ScVal)
        : null;

      setResponse(
        JSON.stringify(
          toJsonSafe({
            rawXdr,
            value: nativeResult,
            simulation: result,
          }),
          null,
          2,
        ),
      );
      setReservationStage("Reserved");
      setLifecycleStatus("Reservation loaded. Escrow is protected and ready for check-in, completion, or cancellation.");
    } catch (error) {
      setResponse(showError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function createBooking() {
    if (!address) {
      setCreateStatus("Connect your wallet first.");
      return;
    }

    if (!traveler || !host || !roomId || !amount || !dayCheckin || !dayCheckout) {
      setCreateStatus("Fill all reservation fields first.");
      return;
    }

    setIsCreating(true);
    setCreateStatus("Preparing secure reservation...");

    try {
      const server = new rpc.Server(RPC_URL);
      const sourceAccount = await server.getAccount(address);
      const contract = new Contract(CONTRACT_ID);

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            "create_booking",
            new Address(traveler).toScVal(),
            new Address(host).toScVal(),
            nativeToScVal(BigInt(roomId), { type: "u64" }),
            nativeToScVal(BigInt(amount), { type: "i128" }),
            nativeToScVal(BigInt(dayCheckin), { type: "u64" }),
            nativeToScVal(BigInt(dayCheckout), { type: "u64" }),
          ),
        )
        .setTimeout(30)
        .build();

      const preparedTransaction = await server.prepareTransaction(transaction);

      setCreateStatus("Waiting for wallet approval...");

      const signed = await signTransaction(preparedTransaction.toXDR(), {
        address,
        networkPassphrase: Networks.TESTNET,
      });

      if (signed.error) {
        throw new Error(signed.error.message || "Wallet approval was declined.");
      }

      setCreateStatus("Finalizing reservation...");

      const signedTransaction = new Transaction(signed.signedTxXdr, Networks.TESTNET);
      const sendResult = await server.sendTransaction(signedTransaction);

      if (sendResult.status === "ERROR") {
        setCreateStatus(JSON.stringify(toJsonSafe(sendResult), null, 2));
        return;
      }

      setCreateStatus(
        JSON.stringify(
          toJsonSafe({
            success: true,
            message: "Your stay has been reserved and the escrow is being secured.",
            transactionHash: sendResult.hash,
            status: sendResult.status,
          }),
          null,
          2,
        ),
      );
    } catch (error) {
      setCreateStatus(showError(error));
    } finally {
      setIsCreating(false);
    }
  }

  async function addHost() {
    if (!address) {
      setHostStatus("Connect your wallet first.");
      return;
    }

    if (!hostName) {
      setHostStatus("Enter your host name first.");
      return;
    }

    setIsAddingHost(true);
    setHostStatus("Preparing host profile...");

    try {
      const server = new rpc.Server(RPC_URL);
      const sourceAccount = await server.getAccount(address);
      const contract = new Contract(CONTRACT_ID);

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            "add_host",
            new Address(address).toScVal(),
            xdr.ScVal.scvString(hostName),
          ),
        )
        .setTimeout(30)
        .build();

      const preparedTransaction = await server.prepareTransaction(transaction);

      setHostStatus("Waiting for wallet approval...");

      const signed = await signTransaction(preparedTransaction.toXDR(), {
        address,
        networkPassphrase: Networks.TESTNET,
      });

      if (signed.error) {
        throw new Error(signed.error.message || "Wallet approval was declined.");
      }

      setHostStatus("Opening your host workspace...");

      const signedTransaction = new Transaction(signed.signedTxXdr, Networks.TESTNET);
      const sendResult = await server.sendTransaction(signedTransaction);

      if (sendResult.status === "ERROR") {
        setHostStatus(JSON.stringify(toJsonSafe(sendResult), null, 2));
        return;
      }

      setIsHostOnboarded(true);
      setHostStatus(
        JSON.stringify(
          toJsonSafe({
            success: true,
            message: `${hostName} is now ready to host protected stays.`,
            transactionHash: sendResult.hash,
            status: sendResult.status,
          }),
          null,
          2,
        ),
      );
    } catch (error) {
      setHostStatus(showError(error));
    } finally {
      setIsAddingHost(false);
    }
  }

  async function createRoom() {
    if (!address) {
      setPropertyStatus("Connect your wallet first.");
      return;
    }

    if (!propertyName) {
      setPropertyStatus("Enter a property name first.");
      return;
    }

    setIsCreatingProperty(true);
    setPropertyStatus("Preparing property listing...");

    try {
      const server = new rpc.Server(RPC_URL);
      const sourceAccount = await server.getAccount(address);
      const contract = new Contract(CONTRACT_ID);

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            "create_room",
            new Address(address).toScVal(),
            xdr.ScVal.scvString(propertyName),
          ),
        )
        .setTimeout(30)
        .build();

      const preparedTransaction = await server.prepareTransaction(transaction);

      setPropertyStatus("Waiting for wallet approval...");

      const signed = await signTransaction(preparedTransaction.toXDR(), {
        address,
        networkPassphrase: Networks.TESTNET,
      });

      if (signed.error) {
        throw new Error(signed.error.message || "Wallet approval was declined.");
      }

      setPropertyStatus("Publishing property...");

      const signedTransaction = new Transaction(signed.signedTxXdr, Networks.TESTNET);
      const sendResult = await server.sendTransaction(signedTransaction);

      if (sendResult.status === "ERROR") {
        setPropertyStatus(JSON.stringify(toJsonSafe(sendResult), null, 2));
        return;
      }

      const newProperty = {
        id: properties.length + 1,
        name: propertyName,
        owner: address,
        status: "Ready for reservations",
        transactionHash: sendResult.hash,
      };

      setProperties((current) => [newProperty, ...current]);
      setPropertyName("");
      setPropertyStatus(
        JSON.stringify(
          toJsonSafe({
            success: true,
            message: `${newProperty.name} is ready for reservations.`,
            transactionHash: sendResult.hash,
            status: sendResult.status,
          }),
          null,
          2,
        ),
      );
    } catch (error) {
      setPropertyStatus(showError(error));
    } finally {
      setIsCreatingProperty(false);
    }
  }

  async function runLifecycleAction(
    action: LifecycleAction,
    contractMethod: string,
    nextStage: ReservationStage,
    pendingMessage: string,
    successMessage: string,
  ) {
    if (!address) {
      setLifecycleStatus("Connect your wallet first.");
      return;
    }

    if (!bookingId) {
      setLifecycleStatus("Enter a reservation code first.");
      return;
    }

    setLifecycleAction(action);
    setLifecycleStatus(pendingMessage);

    try {
      const server = new rpc.Server(RPC_URL);
      const sourceAccount = await server.getAccount(address);
      const contract = new Contract(CONTRACT_ID);
      const bookingIdScVal = nativeToScVal(BigInt(bookingId), { type: "u64" });

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(contract.call(contractMethod, bookingIdScVal))
        .setTimeout(30)
        .build();

      const preparedTransaction = await server.prepareTransaction(transaction);

      setLifecycleStatus("Waiting for wallet approval...");

      const signed = await signTransaction(preparedTransaction.toXDR(), {
        address,
        networkPassphrase: Networks.TESTNET,
      });

      if (signed.error) {
        throw new Error(signed.error.message || "Wallet approval was declined.");
      }

      setLifecycleStatus("Updating your stay timeline...");

      const signedTransaction = new Transaction(signed.signedTxXdr, Networks.TESTNET);
      const sendResult = await server.sendTransaction(signedTransaction);

      if (sendResult.status === "ERROR") {
        setLifecycleStatus(JSON.stringify(toJsonSafe(sendResult), null, 2));
        return;
      }

      setReservationStage(nextStage);
      setLifecycleStatus(
        JSON.stringify(
          toJsonSafe({
            success: true,
            message: successMessage,
            transactionHash: sendResult.hash,
            status: sendResult.status,
            stage: nextStage,
          }),
          null,
          2,
        ),
      );
    } catch (error) {
      setLifecycleStatus(showError(error));
    } finally {
      setLifecycleAction("");
    }
  }

  function confirmCheckIn() {
    return runLifecycleAction(
      "checkin",
      "checkin",
      "Checked In",
      "Preparing check-in confirmation...",
      "Check-in confirmed. The stay is verified and escrow remains protected.",
    );
  }

  function completeStay() {
    return runLifecycleAction(
      "checkout",
      "checkout",
      "Completed",
      "Preparing stay completion...",
      "Stay completed. Protected settlement is being released.",
    );
  }

  function cancelReservation() {
    return runLifecycleAction(
      "cancel",
      "cancel_booking",
      "Cancelled",
      "Preparing cancellation...",
      "Reservation cancelled. The protected stay path is now closed.",
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070604] text-stone-50">
      <div className="absolute left-[-14rem] top-[-18rem] h-[38rem] w-[38rem] animate-pulse rounded-full bg-amber-300/20 blur-3xl" />
      <div className="absolute right-[-16rem] top-32 h-[34rem] w-[34rem] animate-pulse rounded-full bg-cyan-300/14 blur-3xl" />
      <div className="absolute bottom-[20rem] left-[20%] h-[26rem] w-[26rem] rounded-full bg-fuchsia-400/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_28%),radial-gradient(circle_at_75%_8%,rgba(251,191,36,0.14),transparent_24%),linear-gradient(135deg,rgba(120,113,108,0.08),transparent_45%,rgba(8,47,73,0.2))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-20 px-5 py-7 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-stone-50 via-amber-200 to-amber-500 text-sm font-black text-stone-950 shadow-lg shadow-amber-300/20">
              SL
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-white">StayLock</p>
              <p className="hidden text-xs text-stone-500 sm:block">Private travel escrow</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100 sm:inline-flex">
              Testnet
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-stone-200 sm:text-sm">
              <span className={`h-2 w-2 rounded-full ${address ? "bg-emerald-300 shadow-lg shadow-emerald-300/70" : "bg-stone-500"}`} />
              {shortAddress(address)}
            </span>
            <button
              onClick={connectWallet}
              className="rounded-full bg-stone-50 px-4 py-2 text-xs font-bold text-stone-950 shadow-xl shadow-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-100 sm:px-5 sm:text-sm"
            >
              {address ? "Connected" : "Connect"}
            </button>
          </div>
        </header>

        <section className="grid min-h-[680px] gap-10 pt-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-9">
            <div className="inline-flex rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-sm text-amber-100 shadow-lg shadow-amber-500/10">
              Secure stays for the next generation of travel
            </div>

            <div className="space-y-6">
              <h1 className="max-w-5xl text-6xl font-black leading-[0.88] tracking-[-0.075em] text-white sm:text-7xl lg:text-8xl xl:text-9xl">
                Book exceptional stays with escrow-grade confidence.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-300 sm:text-xl">
                StayLock protects guests and property owners with instant wallet approval, transparent deposits, and settlement designed for high-trust travel.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#reserve"
                className="rounded-full bg-gradient-to-r from-stone-50 via-amber-100 to-amber-300 px-7 py-4 text-center text-sm font-black text-stone-950 shadow-2xl shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-300/30"
              >
                Reserve a stay
              </a>
              <a
                href="#hosting"
                className="rounded-full border border-white/10 bg-white/[0.06] px-7 py-4 text-center text-sm font-bold text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.1]"
              >
                Start hosting
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 lg:grid-cols-4">
              {metrics.map(([value, label]) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
                  <p className="text-2xl font-black tracking-tight text-white">{value}</p>
                  <p className="mt-1 text-xs text-stone-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${glassCard} relative overflow-hidden p-5 sm:p-6`}>
            <div className="absolute right-[-5rem] top-[-5rem] h-52 w-52 rounded-full bg-amber-200/20 blur-3xl" />
            <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-stone-500">Featured protected stay</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight">Amalfi Glass Villa</h2>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">Verified</span>
              </div>
              <div className="mt-6 h-64 rounded-[1.35rem] bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.4),transparent_14%),linear-gradient(135deg,rgba(245,158,11,0.55),rgba(8,47,73,0.9)_52%,rgba(12,10,9,1))] shadow-2xl shadow-black/40" />
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/[0.06] p-4">
                  <p className="text-xs text-stone-500">Deposit</p>
                  <p className="mt-1 font-bold">$1,240</p>
                </div>
                <div className="rounded-2xl bg-white/[0.06] p-4">
                  <p className="text-xs text-stone-500">Nights</p>
                  <p className="mt-1 font-bold">4</p>
                </div>
                <div className="rounded-2xl bg-white/[0.06] p-4">
                  <p className="text-xs text-stone-500">Trust</p>
                  <p className="mt-1 font-bold">99.9%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="hosting" className="space-y-8">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-amber-100/70">Host workspace</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Launch properties guests can trust.</h2>
            <p className="mt-4 text-sm leading-6 text-stone-400 sm:text-base">Create a host profile, publish premium stays, and let guests reserve with escrow-backed confidence from the same wallet-native experience.</p>
          </div>

          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <section className={`${glassCard} p-5 sm:p-7`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-stone-500">Host onboarding</p>
                  <h3 className="mt-2 text-3xl font-black tracking-tight">Start hosting on StayLock</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-400">Open your protected property channel and prepare your stays for secure reservations.</p>
                </div>
                <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${isHostOnboarded ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : hostTone.color}`}>
                  {isHostOnboarded ? "Verified host" : hostTone.label}
                </span>
              </div>

              <div className="mt-7 space-y-5">
                <label className="block">
                  {fieldLabel("Host Wallet", "connected")}
                  <input
                    value={address || "Connect wallet to continue"}
                    readOnly
                    className={`${inputClass} cursor-default text-stone-300`}
                  />
                </label>
                <label className="block">
                  {fieldLabel("Host Name", "public profile")}
                  <input
                    value={hostName}
                    onChange={(event) => setHostName(event.target.value)}
                    placeholder="Casa Meridian Collective"
                    className={inputClass}
                  />
                </label>
              </div>

              <button
                onClick={addHost}
                disabled={isAddingHost}
                className="mt-7 w-full rounded-2xl bg-gradient-to-r from-stone-50 via-amber-100 to-amber-300 px-8 py-4 text-base font-black text-stone-950 shadow-2xl shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-300/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAddingHost ? "Creating host profile..." : "Become a Host"}
              </button>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full shadow-lg ${hostTone.dot}`} />
                  <p className="text-sm text-stone-300">{statusMessage(hostResult, hostStatus)}</p>
                </div>
                {hostExplorerUrl && (
                  <a
                    href={hostExplorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-full bg-emerald-200 px-4 py-2 text-xs font-bold text-emerald-950 transition hover:bg-emerald-100"
                  >
                    View host confirmation
                  </a>
                )}
              </div>
            </section>

            <section className={`${glassCard} p-5 sm:p-7`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-stone-500">Property creation</p>
                  <h3 className="mt-2 text-3xl font-black tracking-tight">Create your first property</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-400">Add a stay guests can reserve with a protected deposit and a premium trust experience.</p>
                </div>
                <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${propertyTone.color}`}>{propertyTone.label}</span>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
                <label className="block">
                  {fieldLabel("Property Name", "listing")}
                  <input
                    value={propertyName}
                    onChange={(event) => setPropertyName(event.target.value)}
                    placeholder="Amalfi Glass Villa"
                    className={inputClass}
                  />
                </label>
                <button
                  onClick={createRoom}
                  disabled={isCreatingProperty}
                  className="rounded-2xl border border-amber-200/20 bg-amber-200/10 px-6 py-3.5 text-sm font-bold text-amber-50 transition-all duration-300 hover:-translate-y-1 hover:border-amber-100/50 hover:bg-amber-200/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreatingProperty ? "Publishing..." : "Create Property"}
                </button>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full shadow-lg ${propertyTone.dot}`} />
                  <p className="text-sm text-stone-300">{statusMessage(propertyResult, propertyStatus)}</p>
                </div>
                {propertyExplorerUrl && (
                  <a
                    href={propertyExplorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-full bg-emerald-200 px-4 py-2 text-xs font-bold text-emerald-950 transition hover:bg-emerald-100"
                  >
                    View property confirmation
                  </a>
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {properties.length === 0 ? (
              <div className={`${glassCard} p-7 md:col-span-2 xl:col-span-3`}>
                <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Portfolio</p>
                <h3 className="mt-3 text-3xl font-black tracking-tight">Your property collection will appear here.</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">Create your first property to see a live hosting card with owner wallet, room ID, and reservation-ready status.</p>
              </div>
            ) : (
              properties.map((property) => (
                <article key={`${property.transactionHash}-${property.id}`} className={`${glassCard} overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.085]`}>
                  <div className="h-40 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.32),transparent_14%),linear-gradient(135deg,rgba(251,191,36,0.4),rgba(8,47,73,0.65),rgba(12,10,9,1))]" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Room #{property.id}</p>
                        <h3 className="mt-2 text-2xl font-black tracking-tight">{property.name}</h3>
                      </div>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">Live</span>
                    </div>
                    <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-stone-500">Owner</span>
                        <span className="font-mono text-stone-200">{shortAddress(property.owner)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-stone-500">Status</span>
                        <span className="text-emerald-100">{property.status}</span>
                      </div>
                    </div>
                    {property.transactionHash && (
                      <a
                        href={getExplorerUrl(property.transactionHash)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-stone-200 transition hover:bg-white/[0.08]"
                      >
                        View listing proof
                      </a>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <main id="reserve" className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <section className={`${glassCard} p-5 sm:p-7`}>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-amber-100/70">Reservation experience</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Reserve your stay</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">Create a protected reservation in seconds. Your wallet approval secures the escrow deposit without exposing the complexity underneath.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-stone-300">3-step secure flow</span>
            </div>

            <div className="mb-7 grid gap-3 md:grid-cols-3">
              {["Guest details", "Stay details", "Secure deposit"].map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-xs text-amber-100/70">Step {index + 1}</p>
                  <p className="mt-1 font-semibold text-white">{step}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label>
                {fieldLabel("Guest Wallet", "auto-filled")}
                <input
                  value={traveler}
                  onChange={(event) => setTraveler(event.target.value)}
                  placeholder="Guest wallet address"
                  className={inputClass}
                />
              </label>
              <label>
                {fieldLabel("Property Owner", "wallet")}
                <input
                  value={host}
                  onChange={(event) => setHost(event.target.value)}
                  placeholder="Owner wallet address"
                  className={inputClass}
                />
              </label>
              <label>
                {fieldLabel("Room / Villa ID", "stay")}
                <input
                  type="number"
                  min="0"
                  value={roomId}
                  onChange={(event) => setRoomId(event.target.value)}
                  placeholder="1024"
                  className={inputClass}
                />
              </label>
              <label>
                {fieldLabel("Escrow Deposit", "stroops")}
                <input
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="125000000"
                  className={inputClass}
                />
              </label>
              <label>
                {fieldLabel("Check-in Day", "day")}
                <input
                  type="number"
                  min="0"
                  value={dayCheckin}
                  onChange={(event) => setDayCheckin(event.target.value)}
                  placeholder="20260520"
                  className={inputClass}
                />
              </label>
              <label>
                {fieldLabel("Check-out Day", "day")}
                <input
                  type="number"
                  min="0"
                  value={dayCheckout}
                  onChange={(event) => setDayCheckout(event.target.value)}
                  placeholder="20260524"
                  className={inputClass}
                />
              </label>
            </div>

            <button
              onClick={createBooking}
              disabled={isCreating}
              className="mt-8 w-full rounded-2xl bg-gradient-to-r from-stone-50 via-amber-100 to-amber-300 px-8 py-4 text-base font-black text-stone-950 shadow-2xl shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-300/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? "Securing reservation..." : "Reserve Stay"}
            </button>
          </section>

          <aside className="space-y-8">
            <section className={`${glassCard} p-5 sm:p-6`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-stone-500">Reservation status</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight">{liveTone.title}</h3>
                </div>
                <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${liveTone.color}`}>{liveTone.label}</span>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full shadow-lg ${liveTone.dot}`} />
                  <p className="text-sm text-stone-300">
                    {statusMessage(createResult, createStatus)}
                  </p>
                </div>

                {typeof transactionHash === "string" && (
                  <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/70">Transaction hash</p>
                    <p className="mt-2 break-all font-mono text-sm text-emerald-50">{transactionHash}</p>
                    {explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex rounded-full bg-emerald-200 px-4 py-2 text-xs font-bold text-emerald-950 transition hover:bg-emerald-100"
                      >
                        View confirmation
                      </a>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className={`${glassCard} p-5 sm:p-6`}>
              <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Live activity</p>
              <div className="mt-5 space-y-3">
                {activity.map(([title, detail, meta]) => (
                  <div key={title} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="mt-1 text-xs text-stone-500">{detail}</p>
                    </div>
                    <p className="text-right text-xs text-amber-100/80">{meta}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </main>

        <section className="grid gap-5 md:grid-cols-3">
          {escrowSteps.map(([number, title, description]) => (
            <div key={title} className={`${glassCard} p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.085]`}>
              <p className="text-sm font-black text-amber-100/80">{number}</p>
              <h3 className="mt-5 text-2xl font-bold tracking-tight">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-400">{description}</p>
            </div>
          ))}
        </section>

        <section id="track" className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div className={`${glassCard} p-5 sm:p-7`}>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-100/70">Reservation concierge</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Track Reservation</h2>
            <p className="mt-3 text-sm leading-6 text-stone-400">Look up a stay by reservation code and see its latest protected state in a human-readable view.</p>

            <label className="mt-7 block">
              {fieldLabel("Reservation Code", "number")}
              <input
                id="booking-id"
                type="number"
                min="0"
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value)}
                placeholder="123"
                className={inputClass}
              />
            </label>

            <button
              onClick={getBooking}
              disabled={isLoading}
              className="mt-5 w-full rounded-2xl border border-amber-200/20 bg-amber-200/10 px-8 py-4 text-base font-bold text-amber-50 transition-all duration-300 hover:-translate-y-1 hover:border-amber-100/50 hover:bg-amber-200/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Finding reservation..." : "Track Reservation"}
            </button>
          </div>

          <div className={`${glassCard} p-5 sm:p-7`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-stone-500">Reservation record</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                  {lookupResult ? "Reservation data received" : "Awaiting reservation code"}
                </h3>
              </div>
              <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${isLoading ? "border-amber-200/30 bg-amber-200/10 text-amber-100" : lookupResult ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-white/10 bg-white/[0.06] text-stone-300"}`}>
                {isLoading ? "Searching" : lookupResult ? "Found" : "Ready"}
              </span>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
              {lookupResult ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Readable reservation data</p>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-stone-200">
                      {JSON.stringify(toJsonSafe(lookupValue ?? lookupResult), null, 2)}
                    </p>
                  </div>
                  <details className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-stone-300">Technical details</summary>
                    <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-stone-500">
                      {response}
                    </pre>
                  </details>
                </div>
              ) : (
                <p className="text-sm leading-6 text-stone-400">{response}</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div className={`${glassCard} p-5 sm:p-7`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-amber-100/70">Escrow stay lifecycle</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight">Manage the stay from arrival to settlement.</h2>
                <p className="mt-4 text-sm leading-6 text-stone-400">Funds stay protected after reservation, check-in verifies the guest has arrived, and completion releases settlement without a middleman.</p>
              </div>
              <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${lifecycleTone.color}`}>
                {lifecycleAction ? "Updating" : reservationStage}
              </span>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {lifecycleStages.map((item, index) => {
                const isActive = item.stage === reservationStage;
                const isPast = reservationStage !== "Cancelled" && activeStageIndex >= 0 && index < activeStageIndex;
                const isCancelledCard = item.stage === "Cancelled";
                const cardTone = isActive
                  ? isCancelledCard
                    ? "border-rose-300/35 bg-rose-300/10 text-rose-50 shadow-rose-500/10"
                    : "border-amber-200/35 bg-amber-200/10 text-amber-50 shadow-amber-500/10"
                  : isPast
                    ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-50 shadow-emerald-500/10"
                    : "border-white/10 bg-white/[0.045] text-stone-300 shadow-black/10";

                return (
                  <div key={item.stage} className={`rounded-3xl border p-5 shadow-2xl transition-all duration-300 ${cardTone}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-black uppercase tracking-[0.2em] opacity-70">0{index + 1}</span>
                      <span className={`h-3 w-3 rounded-full ${isActive ? isCancelledCard ? "bg-rose-300 shadow-lg shadow-rose-300/60" : "bg-amber-200 shadow-lg shadow-amber-200/60" : isPast ? "bg-emerald-300 shadow-lg shadow-emerald-300/60" : "bg-stone-600"}`} />
                    </div>
                    <h3 className="mt-5 text-xl font-black tracking-tight">{item.stage}</h3>
                    <p className="mt-2 text-sm font-semibold opacity-90">{item.title}</p>
                    <p className="mt-3 text-sm leading-6 text-stone-400">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`${glassCard} p-5 sm:p-7`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-stone-500">Stay actions</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">Advance reservation #{bookingId || "—"}</h3>
              </div>
              <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${lifecycleTone.color}`}>{lifecycleTone.label}</span>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full shadow-lg ${lifecycleTone.dot}`} />
                <p className="text-sm text-stone-300">{statusMessage(lifecycleResult, lifecycleStatus)}</p>
              </div>
              {typeof lifecycleResult?.transactionHash === "string" && (
                <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/70">Lifecycle confirmation</p>
                  <p className="mt-2 break-all font-mono text-sm text-emerald-50">{String(lifecycleResult.transactionHash)}</p>
                  {lifecycleExplorerUrl && (
                    <a
                      href={lifecycleExplorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex rounded-full bg-emerald-200 px-4 py-2 text-xs font-bold text-emerald-950 transition hover:bg-emerald-100"
                    >
                      View stay update
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-3">
              <button
                onClick={confirmCheckIn}
                disabled={Boolean(lifecycleAction) || !bookingId}
                className="rounded-2xl border border-amber-200/20 bg-amber-200/10 px-6 py-4 text-sm font-bold text-amber-50 transition-all duration-300 hover:-translate-y-1 hover:border-amber-100/50 hover:bg-amber-200/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {lifecycleAction === "checkin" ? "Confirming check-in..." : "Confirm Check-In"}
              </button>
              <button
                onClick={completeStay}
                disabled={Boolean(lifecycleAction) || !bookingId}
                className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-6 py-4 text-sm font-bold text-emerald-50 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-100/50 hover:bg-emerald-300/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {lifecycleAction === "checkout" ? "Completing stay..." : "Complete Stay"}
              </button>
              <button
                onClick={cancelReservation}
                disabled={Boolean(lifecycleAction) || !bookingId}
                className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-6 py-4 text-sm font-bold text-rose-50 transition-all duration-300 hover:-translate-y-1 hover:border-rose-100/50 hover:bg-rose-300/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {lifecycleAction === "cancel" ? "Cancelling reservation..." : "Cancel Reservation"}
              </button>
            </div>
          </div>
        </section>

        <footer className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-2xl font-black tracking-tight">StayLock</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">Premium decentralized escrow for travel reservations, designed to make wallet-native trust feel effortless.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-stone-400">
              <span className="rounded-full border border-white/10 px-4 py-2">Built on Stellar + Soroban</span>
              <span className="rounded-full border border-white/10 px-4 py-2">Browser-only</span>
              <span className="rounded-full border border-white/10 px-4 py-2">Freighter ready</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
