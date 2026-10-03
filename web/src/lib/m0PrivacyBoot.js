import { installM0PrivacyGuards } from "./m0Privacy.js";

// Loaded before the React entry point. In normal OpenTakeoff builds this is a
// no-op; VITE_M0_DEMO=1 installs the privacy boundary before UI/cloud effects.
installM0PrivacyGuards();
