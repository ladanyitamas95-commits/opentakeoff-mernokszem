const disabledMessage = "A hangvezérlés az M0 adatvédelmi módban ki van kapcsolva.";
export const AGENT_HANDOFF_TRIGGER = "";
export const REJECTION_MESSAGES = {};
export const captureSupported = () => false;
export class CaptureError extends Error { constructor() { super(disabledMessage); this.reason = "mic_unavailable"; } }
export async function startCapture() { throw new CaptureError(); }
export const isAgentHandoffTrigger = () => false;
export const shouldOfferAgentHandoff = () => false;
export const applyVoiceIntent = () => ({ ok: false, message: disabledMessage });
export const runVoiceCommand = () => ({ ok: false, message: disabledMessage });
export function createVoiceRecognizerClient(onStatus = () => {}) {
  return {
    async ensureReady() { onStatus({ phase: "uninstalled" }); return false; },
    async transcribe() { throw new Error(disabledMessage); },
    dispose() {},
  };
}
