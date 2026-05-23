import { signTransaction } from "@stellar/freighter-api";
import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Transaction,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import type { BookingInput } from "@/app/types/booking";
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from "./config";
import { toJsonSafe } from "./format";

export async function getBooking(address: string, bookingId: string) {
  const server = new rpc.Server(RPC_URL);
  const account = new Account(address, "0");
  const contract = new Contract(CONTRACT_ID);
  const bookingIdScVal = nativeToScVal(BigInt(bookingId), { type: "u64" });

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("get_booking", bookingIdScVal))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(transaction);

  if (rpc.Api.isSimulationError(result)) {
    return JSON.stringify(result, null, 2);
  }

  const rawXdr = result.result?.retval.toXDR("base64");
  const nativeResult = result.result
    ? scValToNative(result.result.retval as xdr.ScVal)
    : null;

  return JSON.stringify(
    toJsonSafe({
      rawXdr,
      value: nativeResult,
      simulation: result,
    }),
    null,
    2,
  );
}

async function waitForTransaction(server: rpc.Server, hash: string, maxAttempts = 12) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const result = await server.getTransaction(hash);

    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return result;
    }

    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      return null;
    }
  }

  return null;
}

export async function createBooking(address: string, input: BookingInput) {
  const server = new rpc.Server(RPC_URL);
  const sourceAccount = await server.getAccount(address);
  const contract = new Contract(CONTRACT_ID);

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "create_booking",
        new Address(input.traveler).toScVal(),
        new Address(input.host).toScVal(),
        nativeToScVal(BigInt(input.roomId), { type: "u64" }),
        nativeToScVal(BigInt(input.amount), { type: "i128" }),
        nativeToScVal(BigInt(input.dayCheckin), { type: "u64" }),
        nativeToScVal(BigInt(input.dayCheckout), { type: "u64" }),
      ),
    )
    .setTimeout(30)
    .build();

  const preparedTransaction = await server.prepareTransaction(transaction);
  const signed = await signTransaction(preparedTransaction.toXDR(), {
    address,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (signed.error) {
    throw new Error(signed.error.message || "Wallet approval was declined.");
  }

  const signedTransaction = new Transaction(signed.signedTxXdr, NETWORK_PASSPHRASE);
  const sendResult = await server.sendTransaction(signedTransaction);

  if (sendResult.status === "ERROR") {
    return sendResult;
  }

  const finalResult = await waitForTransaction(server, sendResult.hash);
  let bookingId: string | undefined;

  if (finalResult && "returnValue" in finalResult && finalResult.returnValue) {
    try {
      const native = scValToNative(finalResult.returnValue as xdr.ScVal);
      const idValue = typeof native === "bigint" || typeof native === "number" ? String(native) : undefined;
      bookingId = idValue;
    } catch {
      // return value not extractable; bookingId stays undefined
    }
  }

  return { ...sendResult, bookingId };
}
