"use client";

import { useMemo, useState } from "react";
import type { LifecycleAction, ReservationStage } from "@/app/types/booking";
import { runEscrowAction } from "@/app/lib/soroban/escrow";
import { parseJson, showError, toJsonSafe } from "@/app/lib/soroban/format";
import { getStatusTone } from "@/app/components/ui/Status";
import { updateListingAvailability } from "@/app/lib/listingStore";

type UseEscrowOptions = {
  address: string;
  bookingId: string;
  roomId: string;
  reservationStage: ReservationStage;
  refreshBooking: (bookingId?: string) => Promise<unknown>;
};

export function useEscrow({ address, bookingId, roomId, reservationStage, refreshBooking }: UseEscrowOptions) {
  const [lifecycleStatus, setLifecycleStatus] = useState("Tra cứu đặt phòng để quản lý nhận phòng, hoàn tất kỳ nghỉ hoặc hủy cọc.");
  const [lifecycleAction, setLifecycleAction] = useState<LifecycleAction>("");

  const lifecycleResult = useMemo(() => parseJson(lifecycleStatus), [lifecycleStatus]);
  const lifecycleTone = useMemo(() => getStatusTone(lifecycleStatus, Boolean(lifecycleAction)), [lifecycleStatus, lifecycleAction]);

  async function runLifecycleAction(
    action: LifecycleAction,
    contractMethod: string,
    pendingMessage: string,
    successMessage: string,
    listingAvailabilityAfter: "Available" | "Reserved" | "Completed",
  ) {
    if (!address) {
      setLifecycleStatus("Vui lòng kết nối ví Freighter trước.");
      return;
    }

    if (!bookingId) {
      setLifecycleStatus("Vui lòng nhập mã đặt phòng trước.");
      return;
    }

    if (reservationStage === "Cancelled" || reservationStage === "Completed") {
      setLifecycleStatus("Lượt đặt phòng này đã hoàn tất hoặc đã hủy trên chuỗi.");
      return;
    }

    setLifecycleAction(action);
    setLifecycleStatus(pendingMessage);

    try {
      setLifecycleStatus("Đang chờ phê duyệt từ ví Freighter...");
      const sendResult = await runEscrowAction(address, bookingId, contractMethod);

      setLifecycleStatus("Đang cập nhật tiến trình trên sổ cái Stellar...");

      if (sendResult.status === "ERROR") {
        setLifecycleStatus(JSON.stringify(toJsonSafe(sendResult), null, 2));
        return;
      }

      setLifecycleStatus(
        JSON.stringify(
          toJsonSafe({
            success: true,
            message: successMessage,
            transactionHash: sendResult.hash,
            status: sendResult.status,
          }),
          null,
          2,
        ),
      );

      await Promise.all([
        refreshBooking(bookingId),
        roomId
          ? updateListingAvailability(
              roomId,
              listingAvailabilityAfter,
              listingAvailabilityAfter === "Reserved" ? undefined : "",
            ).catch(() => undefined)
          : Promise.resolve(),
      ]);
    } catch (error) {
      setLifecycleStatus(showError(error));
    } finally {
      setLifecycleAction("");
    }
  }

  function confirmCheckIn() {
    if (reservationStage !== "Reserved") {
      setLifecycleStatus("Chỉ có thể xác nhận nhận phòng khi phòng đang ở trạng thái đã đặt cọc.");
      return Promise.resolve();
    }

    return runLifecycleAction(
      "checkin",
      "checkin",
      "Đang chuẩn bị xác nhận nhận phòng...",
      "Đã xác nhận nhận phòng thành công! Lưu trú đã được xác thực và tiền cọc tiếp tục được bảo chứng an toàn.",
      "Reserved",
    );
  }

  function completeStay() {
    if (reservationStage !== "Checked In") {
      setLifecycleStatus("Chỉ có thể giải ngân hoàn tất sau khi khách đã xác nhận nhận phòng.");
      return Promise.resolve();
    }

    return runLifecycleAction(
      "checkout",
      "checkout",
      "Đang chuẩn bị hoàn tất kỳ nghỉ & giải ngân...",
      "Kỳ nghỉ đã hoàn tất thành công! Tiền cọc ký quỹ đã được giải ngân về ví chủ nhà.",
      "Available",
    );
  }

  function cancelReservation() {
    return runLifecycleAction(
      "cancel",
      "cancel_booking",
      "Đang chuẩn bị hủy đặt phòng & hoàn cọc...",
      "Đã hủy đặt phòng thành công. Tiền cọc đã được hoàn trả về ví của bạn.",
      "Available",
    );
  }

  return {
    lifecycleStatus,
    lifecycleAction,
    lifecycleResult,
    lifecycleTone,
    confirmCheckIn,
    completeStay,
    cancelReservation,
  };
}
