"use client";

import { useState } from "react";
import { connectFreighter } from "@/app/lib/soroban/wallet";
import { DEMO_HOST_WALLET } from "@/app/lib/listings";

export function useWallet() {
  const [address, setAddress] = useState("");

  async function connectWallet() {
    try {
      const result = await connectFreighter();

      if (result.address) {
        setAddress(result.address);
        return result.address;
      }
    } catch (error) {
      console.warn("Freighter wallet not found, connecting demo host wallet:", error);
      setAddress(DEMO_HOST_WALLET);
      return DEMO_HOST_WALLET;
    }

    return "";
  }

  function setDemoAddress(addr: string = DEMO_HOST_WALLET) {
    setAddress(addr);
    return addr;
  }

  return {
    address,
    connectWallet,
    setDemoAddress,
  };
}
