import React from "react";
import AppShell from "./AppShell.jsx";
import {
  Alert,
  BlockedState,
  Button,
  Checkbox,
  Chip,
  ConfidenceBadge,
  DataTableShell,
  Dialog,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  LoadingState,
  MEASUREMENT_STATUSES,
  Panel,
  Select,
  StatusBadge,
  SystemStatusBadge,
  Textarea,
  Tooltip,
  ValidationBadge,
} from "./ui/index.js";

const demoColumns = [
  { key: "name", label: "Elem" },
  { key: "status", label: "Állapot" },
  { key: "note", label: "Megjegyzés" },
];

const demoRows = [
  { id: "area", name: "Terület", status: <StatusBadge status="DRAFT" />, note: "P0 prioritás 1" },
  { id: "wall-length", name: "Falhossz", status: <StatusBadge status="REVIEW_REQUIRED" />, note: "P0 prioritás 2" },
  { id: "count", name: "Darabszám", status: <StatusBadge status="ACCEPTED" />, note: "P0 prioritás 3" },
];

export default function UiFoundationPreview() {
  return (
    <AppShell>
      <div className="ms-foundation-grid">
        <div className="ms-card-stack">
          <Panel title="UI foundation">
            <p className="ms-muted-copy">
              Központi MérnökSzem arculati alap, alkalmazás shell és újrahasznosítható állapotkomponensek.
            </p>
            <div className="ms-ui-row">
              <Button variant="primary">Elsődleges művelet</Button>
              <Button variant="accent">Kiemelt művelet</Button>
              <Button variant="ghost">Másodlagos</Button>
              <IconButton label="Panel összecsukása" icon="›" />
              <Tooltip label="Ikonos vezérlő mindig kap szöveges címkét.">
                <Chip>Tooltip minta</Chip>
              </Tooltip>
            </div>
          </Panel>

          <Panel title="Domain állapotok">
            <div className="ms-ui-row">
              {MEASUREMENT_STATUSES.map((status) => <StatusBadge key={status} status={status} />)}
            </div>
          </Panel>

          <Panel title="Validation és confidence">
            <div className="ms-ui-row">
              <ValidationBadge status="PASS" />
              <ValidationBadge status="REVIEW" />
              <ValidationBadge status="ERROR" />
              <ConfidenceBadge value={0.82} />
              <SystemStatusBadge status="BLOCKED" />
            </div>
          </Panel>

          <Panel title="Adattábla shell">
            <DataTableShell columns={demoColumns} rows={demoRows} />
          </Panel>
        </div>

        <div className="ms-card-stack">
          <Panel title="Űrlap primitívek">
            <div className="ms-card-stack">
              <Input label="Projekt neve" placeholder="Projekt neve" />
              <Select label="Dokumentumtípus" defaultValue="drawing">
                <option value="drawing">Terv</option>
                <option value="boq">Költségvetés</option>
                <option value="spec">Műszaki leírás</option>
              </Select>
              <Textarea label="Megjegyzés" placeholder="Rövid megjegyzés…" />
              <Checkbox defaultChecked>Csak ellenőrzött elemek</Checkbox>
            </div>
          </Panel>

          <Alert title="AI-javaslat ≠ elfogadott mérés" tone="review">
            A jelvények ikont és szöveget is használnak, ezért nem csak szín alapján különülnek el.
          </Alert>

          <EmptyState title="Nincs dokumentum">A végleges feltöltési flow későbbi task.</EmptyState>
          <LoadingState title="Feldolgozás folyamatban">Csak prezentációs állapot.</LoadingState>
          <ErrorState title="Hibaállapot">Üzleti logika nélkül reprezentálható.</ErrorState>
          <BlockedState title="Export blokkolva">Példa blocking állapotra, számítás nélkül.</BlockedState>
        </div>
      </div>

      <Dialog title="Dialog minta" open={false}>
        Ez a komponens csak a primitív contractot demonstrálja.
      </Dialog>
    </AppShell>
  );
}
