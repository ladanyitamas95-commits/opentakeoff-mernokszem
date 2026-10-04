import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./styles/tokens.css";
import "./styles/app.css";
import "./styles/print.css";
import M0DemoShell from "./components/M0DemoShell.jsx";
import { initTheme } from "./lib/theme.js";
import { initDrawStyle } from "./lib/drawStyles.js";
import { initDraftOutline } from "./lib/draftOutline.js";

// Dedicated M0 entrypoint: deliberately excludes Google/Microsoft providers,
// project gates and every cloud-store bootstrap from the module graph.
initTheme();
initDrawStyle();
initDraftOutline();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <M0DemoShell />
    </BrowserRouter>
  </React.StrictMode>,
);
