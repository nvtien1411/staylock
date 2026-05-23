"use client";

import { useState } from "react";
import { connectFreighter } from "@/app/lib/soroban/wallet";

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
      console.error(error);
      alert("Freighter wallet not found");
    }

    return "";
  }

  return {
    address,
    connectWallet,
  };
}
