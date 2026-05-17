"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

type QrScannerProps = {
  /** Called when a QR code is successfully decoded */
  onScanSuccess: (decodedText: string) => void;
  /** Called on scan errors (optional, noisy) */
  onScanError?: (error: string) => void;
  /** Whether the scanner is currently active */
  isActive: boolean;
  /** CSS className for the container */
  className?: string;
};

const SCANNER_CONFIG = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
  disableFlip: false,
};

/**
 * QrScanner — wraps html5-qrcode into a React component.
 *
 * Handles camera permissions, start/stop lifecycle, and cleanup.
 * Shows a live camera feed with QR detection overlay.
 */
export function QrScanner({
  onScanSuccess,
  onScanError,
  isActive,
  className,
}: QrScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const hasScannedRef = useRef(false);

  // Stabilize callbacks with refs to avoid restarting scanner on re-render
  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;
  const onScanErrorRef = useRef(onScanError);
  onScanErrorRef.current = onScanError;

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      const state = scanner.getState();
      if (
        state === Html5QrcodeScannerState.SCANNING ||
        state === Html5QrcodeScannerState.PAUSED
      ) {
        await scanner.stop();
      }
    } catch {
      // Scanner may already be stopped
    }
  }, []);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const elementId = "qr-scanner-viewport";
    hasScannedRef.current = false;
    setCameraError(null);
    setIsStarting(true);

    // Create scanner instance
    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" }, // Prefer back camera
          SCANNER_CONFIG,
          (decodedText) => {
            // Prevent duplicate scans
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;

            onScanSuccessRef.current(decodedText);
          },
          (errorMessage) => {
            // This fires continuously while scanning — ignore unless needed
            onScanErrorRef.current?.(errorMessage);
          }
        );
        setIsStarting(false);
      } catch (err) {
        setIsStarting(false);
        const message =
          err instanceof Error ? err.message : "Không thể truy cập camera";

        if (message.includes("NotAllowedError") || message.includes("Permission")) {
          setCameraError("Bạn cần cấp quyền truy cập camera để quét mã QR.");
        } else if (message.includes("NotFoundError") || message.includes("device")) {
          setCameraError("Không tìm thấy camera trên thiết bị này.");
        } else {
          setCameraError(message);
        }
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isActive, stopScanner]);

  return (
    <div className={className}>
      <div
        className="relative overflow-hidden rounded-2xl bg-black"
        id="qr-scanner-viewport"
        ref={containerRef}
        style={{ minHeight: 280 }}
      />

      {isStarting && (
        <div className="mt-3 text-center text-sm text-muted-foreground animate-pulse">
          Đang khởi tạo camera...
        </div>
      )}

      {cameraError && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">⚠️ Không thể mở camera</p>
          <p className="mt-1 text-amber-700">{cameraError}</p>
          <p className="mt-2 text-xs text-amber-600">
            Bạn vẫn có thể dùng nút "Giả lập quét hóa đơn" bên dưới.
          </p>
        </div>
      )}
    </div>
  );
}
