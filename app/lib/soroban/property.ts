import { signTransaction } from "@stellar/freighter-api";
import {
  Address,
  BASE_FEE,
  Contract,
  Transaction,
  TransactionBuilder,
  rpc,
  xdr,
} from "@stellar/stellar-sdk";
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from "./config";

async function submitPropertyTransaction(address: string, operationName: string, value: string) {
  const server = new rpc.Server(RPC_URL);
  const sourceAccount = await server.getAccount(address);
  const contract = new Contract(CONTRACT_ID);

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        operationName,
        new Address(address).toScVal(),
        xdr.ScVal.scvString(value),
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
  return server.sendTransaction(signedTransaction);
}

export function addHost(address: string, hostName: string) {
  return submitPropertyTransaction(address, "add_host", hostName);
}

export function createRoom(address: string, propertyName: string) {
  return submitPropertyTransaction(address, "create_room", propertyName);
}
