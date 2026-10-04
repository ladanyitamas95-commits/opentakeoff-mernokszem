export const SCAN_ENDPOINT = "";
export const scanRasterScale = () => 1;
export const normalizeScanRows = () => [];
export async function postScanWithRetry() {
  throw new Error("A hálózati schedule-scan az M0 adatvédelmi módban ki van kapcsolva.");
}
