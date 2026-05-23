"use client";

import { useMemo, useState } from "react";
import type { PropertyCard } from "@/app/types/property";
import { addHost as addHostTransaction, createRoom as createRoomTransaction } from "@/app/lib/soroban/property";
import { parseJson, showError, toJsonSafe } from "@/app/lib/soroban/format";
import { getStatusTone } from "@/app/components/ui/Status";

export function useProperty(address: string) {
  const [hostName, setHostName] = useState("");
  const [hostStatus, setHostStatus] = useState("Create your host profile to start listing protected stays.");
  const [isAddingHost, setIsAddingHost] = useState(false);
  const [isHostOnboarded, setIsHostOnboarded] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [propertyStatus, setPropertyStatus] = useState("Add a property guests can reserve with escrow-backed confidence.");
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);
  const [properties, setProperties] = useState<PropertyCard[]>([]);

  const hostResult = useMemo(() => parseJson(hostStatus), [hostStatus]);
  const propertyResult = useMemo(() => parseJson(propertyStatus), [propertyStatus]);
  const hostTone = useMemo(() => getStatusTone(hostStatus, isAddingHost), [hostStatus, isAddingHost]);
  const propertyTone = useMemo(() => getStatusTone(propertyStatus, isCreatingProperty), [propertyStatus, isCreatingProperty]);

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
      setHostStatus("Waiting for wallet approval...");
      const sendResult = await addHostTransaction(address, hostName);

      setHostStatus("Opening your host workspace...");

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
      setPropertyStatus("Waiting for wallet approval...");
      const sendResult = await createRoomTransaction(address, propertyName);

      setPropertyStatus("Publishing property...");

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

  return {
    hostName,
    setHostName,
    hostStatus,
    isAddingHost,
    isHostOnboarded,
    propertyName,
    setPropertyName,
    propertyStatus,
    isCreatingProperty,
    properties,
    hostResult,
    propertyResult,
    hostTone,
    propertyTone,
    addHost,
    createRoom,
  };
}
