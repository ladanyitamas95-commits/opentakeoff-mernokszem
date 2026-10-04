const disabledMessage = "Az AI agent az M0 adatvédelmi módban ki van kapcsolva.";
export const AGENT_TOOL_DEFS = [];
export const MAX_AGENT_ITERATIONS = 0;
export const agentToolDefs = () => [];
export const agentScaleGate = () => disabledMessage;
export const pickAgentEvidence = () => null;
export const validateToolArgs = () => disabledMessage;
export const executeAgentTool = async () => ({ error: disabledMessage });
export const agentSystemPrompt = () => disabledMessage;
export const toProviderTools = () => [];
export const parseAssistantTurn = () => ({ ok: false, error: disabledMessage });
export const runAgentLoop = async ({ onEvent } = {}) => {
  onEvent?.({ type: "error", message: disabledMessage });
  return { status: "error", error: disabledMessage };
};
