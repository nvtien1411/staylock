import { signTransaction } from "@stellar/freighter-api";
import {
  BASE_FEE,
  Contract,
  Transaction,
  TransactionBuilder,
  nativeToScVal,
  rpc,
} from "@stellar/stellar-sdk";
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from "./config";

async function waitForTransaction(server: rpc.Server, hash: string, maxAttempts = 12) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const result = await server.getTransaction(hash);
    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) return result;
    if (result.status === rpc.Api.GetTransactionStatus.FAILED) return null;
  }
  return null;
}

export async function runEscrowAction(address: string, bookingId: string, contractMethod: string) {
  const server = new rpc.Server(RPC_URL);
  const sourceAccount = await server.getAccount(address);
  const contract = new Contract(CONTRACT_ID);
  const bookingIdScVal = nativeToScVal(BigInt(bookingId), { type: "u64" });

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(contractMethod, bookingIdScVal))
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

  if (sendResult.status === "ERROR") return sendResult;

  await waitForTransaction(server, sendResult.hash);
  return sendResult;
}
