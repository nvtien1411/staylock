import { requestAccess } from "@stellar/freighter-api";

export async function connectFreighter() {
  return requestAccess();
}
