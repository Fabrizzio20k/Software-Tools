"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageReveal } from "@/app/components/page-reveal";
import { UsersIcon } from "@/app/components/portal-icons";
import type { KeycloakGroup, KeycloakUser, UserInput } from "@/lib/keycloak-admin";

type Draft = UserInput & { key: number; line: number };
type Mode = "individual" | "csv";
type Action = "disable" | "enable" | "delete";
type Dialog = { action: Action; ids: string[]; names: string[] } | null;

const columns = ["firstName", "lastName", "email", "username", "groupNumber"];
const emptyUser: UserInput = { firstName: "", lastName: "", email: "", username: "", groupId: "" };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-z0-9][a-z0-9._-]{1,63}$/i;

function suggestedUsername(firstName: string, lastName: string) {
  const clean = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const first = clean(firstName).split(/\s+/)[0] ?? "";
  const last = clean(lastName).split(/\s+/)[0] ?? "";
  return first && last ? `${first[0]}${last}` : "";
}

function parseCsv(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const input = source.replace(/^\uFEFF/, "");
  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    if (char === '"') {
      if (quoted && input[index + 1] === '"') { field += '"'; index++; }
      else if (quoted || !field) quoted = !quoted;
      else throw new Error(`Comilla inesperada cerca de la fila ${rows.length + 1}.`);
    } else if (char === "," && !quoted) {
      row.push(field); field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && input[index + 1] === "\n") index++;
      row.push(field); field = "";
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
    } else field += char;
  }
  if (quoted) throw new Error("El CSV tiene una celda con comillas sin cerrar.");
  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function draftError(draft: Draft, drafts: Draft[]) {
  if (!draft.firstName.trim() || !draft.lastName.trim()) return "Completa el nombre y apellido.";
  if (!emailPattern.test(draft.email.trim())) return "Correo inválido.";
  if (!usernamePattern.test(draft.username.trim())) return "Username inválido (2 a 64 caracteres).";
  if (!draft.groupId) return "Selecciona un grupo.";
  if (drafts.some((other) => other.key !== draft.key && other.email.trim().toLowerCase() === draft.email.trim().toLowerCase())) return "Correo repetido en el archivo.";
  if (drafts.some((other) => other.key !== draft.key && other.username.trim().toLowerCase() === draft.username.trim().toLowerCase())) return "Username repetido en el archivo.";
  return "";
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "No se pudo completar la operación.");
  return payload;
}

export function UserAdminConsole({ currentUserId }: { currentUserId?: string }) {
  const [groups, setGroups] = useState<KeycloakGroup[]>([]);
  const [users, setUsers] = useState<KeycloakUser[]>([]);
  const [mode, setMode] = useState<Mode>("individual");
  const [individual, setIndividual] = useState<UserInput>(emptyUser);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "enabled" | "disabled">("all");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setDialog(null);
      if (event.key !== "Tab" || !dialogRef.current) return;
      const buttons = Array.from(dialogRef.current.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
      if (!buttons.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [dialog, busy]);

  const refresh = useCallback(async () => {
    const [groupData, userData] = await Promise.all([
      fetch("/api/admin/groups", { cache: "no-store" }).then((response) => readResponse<{ groups: KeycloakGroup[] }>(response)),
      fetch("/api/admin/users", { cache: "no-store" }).then((response) => readResponse<{ users: KeycloakUser[] }>(response)),
    ]);
    setGroups(groupData.groups);
    setUsers(userData.users);
  }, []);

  useEffect(() => {
    let current = true;
    Promise.all([
      fetch("/api/admin/groups", { cache: "no-store" }).then((response) => readResponse<{ groups: KeycloakGroup[] }>(response)),
      fetch("/api/admin/users", { cache: "no-store" }).then((response) => readResponse<{ users: KeycloakUser[] }>(response)),
    ]).then(([groupData, userData]) => {
      if (current) { setGroups(groupData.groups); setUsers(userData.users); }
    }).catch((cause) => { if (current) setError(cause instanceof Error ? cause.message : "No se pudieron cargar los usuarios."); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, []);

  const filtered = useMemo(() => users.filter((user) => {
    const query = search.trim().toLowerCase();
    const matches = !query || [user.firstName, user.lastName, user.email, user.username, ...user.groups.map((group) => group.path)].some((value) => value.toLowerCase().includes(query));
    return matches && (status === "all" || user.enabled === (status === "enabled"));
  }), [users, search, status]);
  const visibleIds = filtered.filter((user) => user.id !== currentUserId).map((user) => user.id);
  const visibleSelected = selected.filter((id) => visibleIds.includes(id));
  const allVisibleSelected = visibleIds.length > 0 && visibleSelected.length === visibleIds.length;
  const activeCount = users.filter((user) => user.enabled).length;
  const draftErrors = drafts.map((draft) => draftError(draft, drafts));

  function updateDraft(key: number, field: keyof UserInput, value: string) {
    setDrafts((current) => current.map((draft) => draft.key === key ? { ...draft, [field]: value } : draft));
  }

  async function loadCsv(file: File) {
    setError(""); setNotice("");
    if (file.size > 1024 * 1024) { setError("El CSV supera 1 MB. Divide la carga en archivos más pequeños."); return; }
    try {
      const rows = parseCsv(await file.text());
      if (!rows.length || columns.some((column, index) => rows[0][index]?.trim() !== column) || rows[0].length !== columns.length) {
        throw new Error(`La cabecera debe ser: ${columns.join(",")}`);
      }
      if (rows.length < 2 || rows.length > 101) throw new Error("Incluye entre 1 y 100 usuarios por archivo.");
      const parsed = rows.slice(1).map((row, index) => {
        if (row.length !== columns.length) throw new Error(`La fila ${index + 2} tiene ${row.length} columnas; se esperaban 5.`);
        const [firstName, lastName, email, username, groupNumber] = row.map((value) => value.trim());
        const groupIndex = Number(groupNumber) - 1;
        return {
          key: index,
          line: index + 2,
          firstName,
          lastName,
          email,
          username: username || suggestedUsername(firstName, lastName),
          groupId: Number.isInteger(groupIndex) ? groups[groupIndex]?.id ?? "" : "",
        };
      });
      setDrafts(parsed);
      setMode("csv");
      setNotice(`${parsed.length} ${parsed.length === 1 ? "fila cargada" : "filas cargadas"}. Revisa y corrige antes de crear.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo leer el CSV."); }
    if (fileRef.current) fileRef.current.value = "";
  }

  function downloadTemplate() {
    const content = `${columns.join(",")}\nAna,Perez,ana.perez@utec.edu.pe,aperez,1\n`;
    const url = URL.createObjectURL(new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "plantilla-usuarios.csv"; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function create(values: UserInput[]) {
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ users: values }) })
        .then((response) => readResponse<{ created: string[]; failures: { email: string; message: string }[] }>(response));
      if (result.created.length) {
        if (mode === "csv") setDrafts((current) => current.filter((draft) => !result.created.includes(draft.username.trim().toLowerCase())));
        else setIndividual(emptyUser);
      }
      setNotice(`${result.created.length} ${result.created.length === 1 ? "usuario creado" : "usuarios creados"}.`);
      if (result.failures.length) setError(result.failures.map((failure) => `${failure.email}: ${failure.message}`).join(" · "));
      await refresh().catch(() => setError("La creación terminó, pero no se pudo actualizar el directorio. Usa «Actualizar»."));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron crear los usuarios."); }
    finally { setBusy(false); }
  }

  async function confirmAction() {
    if (!dialog) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await fetch("/api/admin/users/actions", {
        method: dialog.action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: dialog.ids, enabled: dialog.action === "enable" }),
      }).then((response) => readResponse<{ completed: number; failedIds: string[] }>(response));
      setSelected(result.failedIds); setDialog(null);
      setNotice(dialog.action === "delete" ? `${result.completed} usuario(s) eliminados permanentemente.` : `${result.completed} usuario(s) ${dialog.action === "enable" ? "reactivados" : "desactivados"}.`);
      if (result.failedIds.length) {
        const failedNames = result.failedIds.map((id) => dialog.names[dialog.ids.indexOf(id)]).join(", ");
        setError(`No se pudo completar la acción para: ${failedNames}. Siguen seleccionados para reintentar.`);
      }
      await refresh().catch(() => setError("La acción terminó, pero no se pudo actualizar el directorio. Usa «Actualizar»."));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo completar la acción.");
      await refresh().catch(() => undefined);
    } finally { setBusy(false); }
  }

  function openAction(action: Action, targets: KeycloakUser[]) {
    if (!targets.length) return;
    setDialog({ action, ids: targets.map((user) => user.id), names: targets.map((user) => user.username) });
  }

  const selectedUsers = users.filter((user) => visibleSelected.includes(user.id) && user.id !== currentUserId);
  const singleValid = Boolean(individual.firstName.trim() && individual.lastName.trim() && emailPattern.test(individual.email.trim()) && usernamePattern.test(individual.username.trim()) && individual.groupId);

  return (
    <>
    <PageReveal>
      <section className="portal-page admin-page">
        <div className="page-intro admin-intro">
          <span className="page-symbol"><UsersIcon /></span>
          <div><p className="eyebrow">Administración</p><h1>Usuarios</h1><p>Gestiona el acceso al portal desde tu realm de Keycloak.</p></div>
        </div>

        <div className="admin-overview" aria-label="Resumen de usuarios">
          <div><span>Total</span><strong>{loading ? "—" : users.length}</strong></div>
          <div><span>Activos</span><strong>{loading ? "—" : activeCount}</strong></div>
          <div><span>Grupos</span><strong>{loading ? "—" : groups.length}</strong></div>
        </div>

        <div aria-live="polite" className="admin-feedback-wrap">
          <AnimatePresence mode="wait">
            {error && <motion.div animate={{ height: "auto", opacity: 1 }} className="admin-feedback is-error" exit={{ height: 0, opacity: 0 }} initial={{ height: 0, opacity: 0 }} key={`error-${error}`} role="alert" transition={{ duration: reduceMotion ? 0 : .24 }}>{error}</motion.div>}
            {!error && notice && <motion.div animate={{ height: "auto", opacity: 1 }} className="admin-feedback is-success" exit={{ height: 0, opacity: 0 }} initial={{ height: 0, opacity: 0 }} key={`notice-${notice}`} transition={{ duration: reduceMotion ? 0 : .24 }}>{notice}</motion.div>}
          </AnimatePresence>
        </div>

        <section className="admin-section" aria-labelledby="create-title">
          <div className="admin-section-heading"><div><span className="admin-section-index">01 / Crear</span><h2 id="create-title">Añadir personas</h2><p>Crea cuentas sin contraseña y asigna un grupo de Keycloak.</p></div></div>
          <div className="admin-tabs" role="tablist" aria-label="Método de creación">
            <button aria-controls="admin-individual-panel" aria-selected={mode === "individual"} className={mode === "individual" ? "is-active" : ""} onClick={() => setMode("individual")} role="tab" type="button">Individual</button>
            <button aria-controls="admin-csv-panel" aria-selected={mode === "csv"} className={mode === "csv" ? "is-active" : ""} onClick={() => setMode("csv")} role="tab" type="button">Importar CSV</button>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {mode === "individual" ? (
              <motion.form animate={{ opacity: 1, y: 0 }} className="admin-card admin-form" exit={{ opacity: 0, y: -8 }} id="admin-individual-panel" initial={{ opacity: 0, y: 8 }} key="individual" onSubmit={(event) => { event.preventDefault(); if (singleValid) void create([individual]); }} role="tabpanel" transition={{ duration: reduceMotion ? 0 : .22 }}>
                <div className="admin-field-grid">
                  <label>Nombre<input autoComplete="given-name" onChange={(event) => setIndividual((current) => ({ ...current, firstName: event.target.value, username: current.username || suggestedUsername(event.target.value, current.lastName) }))} required value={individual.firstName} /></label>
                  <label>Apellido<input autoComplete="family-name" onChange={(event) => setIndividual((current) => ({ ...current, lastName: event.target.value, username: current.username || suggestedUsername(current.firstName, event.target.value) }))} required value={individual.lastName} /></label>
                  <label>Correo<input autoComplete="email" onChange={(event) => setIndividual((current) => ({ ...current, email: event.target.value }))} required type="email" value={individual.email} /></label>
                  <label>Username<input autoComplete="off" onChange={(event) => setIndividual((current) => ({ ...current, username: event.target.value }))} pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{1,63}" required title="2 a 64 caracteres: letras, números, punto, guion o guion bajo" value={individual.username} /></label>
                  <label>Grupo<select onChange={(event) => setIndividual((current) => ({ ...current, groupId: event.target.value }))} required value={individual.groupId}><option value="">Selecciona un grupo</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.path}</option>)}</select></label>
                </div>
                <div className="admin-form-footer"><p>La cuenta se crea activa. El inicio de sesión sigue el flujo de Google configurado en Keycloak.</p><button className="admin-button is-primary" disabled={busy || !singleValid} type="submit">{busy ? "Creando…" : "Crear usuario"}</button></div>
              </motion.form>
            ) : (
              <motion.div animate={{ opacity: 1, y: 0 }} className="admin-card admin-import" exit={{ opacity: 0, y: -8 }} id="admin-csv-panel" initial={{ opacity: 0, y: 8 }} key="csv" transition={{ duration: reduceMotion ? 0 : .22 }} role="tabpanel">
                <div className="admin-import-top"><div><h3>Importación con revisión</h3><p>Descarga la plantilla, reemplaza los datos y carga hasta 100 usuarios por archivo. El username puede quedar vacío para sugerir inicial y primer apellido.</p></div><button className="admin-button is-outline" onClick={downloadTemplate} type="button">Descargar plantilla</button></div>
                <div className="admin-group-guide"><strong>Número de grupo en el CSV</strong><div>{groups.map((group, index) => <span key={group.id}><b>{index + 1}</b>{group.path}</span>)}</div>{!groups.length && <p>Los grupos aparecerán cuando Keycloak responda.</p>}</div>
                <label className="admin-upload"><input accept=".csv,text/csv" disabled={busy || !groups.length} onChange={(event) => { const file = event.target.files?.[0]; if (file) void loadCsv(file); }} ref={fileRef} type="file" /><span className="admin-upload-mark">↥</span><strong>Selecciona un archivo CSV</strong><small>Revisarás cada fila antes de crear las cuentas.</small></label>
                {drafts.length > 0 && <div className="admin-preview"><div className="admin-preview-title"><div><strong>Vista previa editable</strong><span>{drafts.length} filas · {draftErrors.filter(Boolean).length} por corregir</span></div><button className="admin-button is-primary" disabled={busy || draftErrors.some(Boolean)} onClick={() => void create(drafts.map(({ firstName, lastName, email, username, groupId }) => ({ firstName, lastName, email, username, groupId })))} type="button">{busy ? "Creando…" : `Crear ${drafts.length} usuario(s)`}</button></div><div className="admin-preview-list">{drafts.map((draft, index) => <div className={`admin-preview-row${draftErrors[index] ? " has-error" : ""}`} key={draft.key}><div className="admin-preview-row-head"><strong>Fila {draft.line}</strong><button aria-label={`Quitar fila ${draft.line}`} onClick={() => setDrafts((current) => current.filter((item) => item.key !== draft.key))} type="button">Quitar</button></div><div className="admin-preview-fields"><label>Nombre<input aria-label={`Nombre, fila ${draft.line}`} onChange={(event) => updateDraft(draft.key, "firstName", event.target.value)} value={draft.firstName} /></label><label>Apellido<input aria-label={`Apellido, fila ${draft.line}`} onChange={(event) => updateDraft(draft.key, "lastName", event.target.value)} value={draft.lastName} /></label><label>Correo<input aria-label={`Correo, fila ${draft.line}`} onChange={(event) => updateDraft(draft.key, "email", event.target.value)} type="email" value={draft.email} /></label><label>Username<input aria-label={`Username, fila ${draft.line}`} onChange={(event) => updateDraft(draft.key, "username", event.target.value)} value={draft.username} /></label><label>Grupo<select aria-label={`Grupo, fila ${draft.line}`} onChange={(event) => updateDraft(draft.key, "groupId", event.target.value)} value={draft.groupId}><option value="">Selecciona</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.path}</option>)}</select></label></div>{draftErrors[index] && <p className="admin-row-error">{draftErrors[index]}</p>}</div>)}</div></div>}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="admin-section" aria-labelledby="directory-title">
          <div className="admin-section-heading"><div><span className="admin-section-index">02 / Gestionar</span><h2 id="directory-title">Directorio</h2><p>Busca, selecciona y gestiona cuentas del realm.</p></div><button className="admin-button is-outline" disabled={busy || loading} onClick={() => { setLoading(true); refresh().catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudo actualizar.")).finally(() => setLoading(false)); }} type="button">Actualizar</button></div>
          <div className="admin-directory-controls"><label className="admin-search"><span>Buscar</span><input onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, correo, username o grupo" type="search" value={search} /></label><label className="admin-filter"><span>Estado</span><select onChange={(event) => setStatus(event.target.value as typeof status)} value={status}><option value="all">Todos</option><option value="enabled">Activos</option><option value="disabled">Desactivados</option></select></label></div>
          <div className="admin-selection-bar"><label><input checked={allVisibleSelected} disabled={!visibleIds.length} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current, ...visibleIds])] : current.filter((id) => !visibleIds.includes(id)))} type="checkbox" /> Seleccionar visibles</label><span>{visibleSelected.length} seleccionados</span><div><button disabled={busy || !selectedUsers.some((user) => user.enabled)} onClick={() => openAction("disable", selectedUsers.filter((user) => user.enabled))} type="button">Desactivar</button><button disabled={busy || !selectedUsers.some((user) => !user.enabled)} onClick={() => openAction("enable", selectedUsers.filter((user) => !user.enabled))} type="button">Reactivar</button><button className="is-danger" disabled={busy || !selectedUsers.length} onClick={() => openAction("delete", selectedUsers)} type="button">Eliminar</button></div></div>
          <div className="admin-directory" aria-busy={loading}>{loading ? <p className="admin-directory-empty">Cargando usuarios…</p> : filtered.length ? filtered.map((user) => <div className="admin-user" key={user.id}><input aria-label={user.id === currentUserId ? "Tu cuenta no se puede modificar aquí" : `Seleccionar ${user.username}`} checked={selected.includes(user.id)} disabled={user.id === currentUserId} onChange={(event) => setSelected((current) => event.target.checked ? [...current, user.id] : current.filter((id) => id !== user.id))} type="checkbox" /><div className="admin-user-avatar" aria-hidden="true">{(user.firstName[0] || user.username[0] || "U").toUpperCase()}</div><div className="admin-user-main"><strong>{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.username}</strong><span>{user.email || "Sin correo"}</span></div><div className="admin-user-meta"><span>@{user.username}</span><small>{user.groups.map((group) => group.path).join(" · ") || "Sin grupo"}</small></div><span className={`admin-status${user.enabled ? " is-enabled" : ""}`}>{user.enabled ? "Activo" : "Desactivado"}</span></div>) : <p className="admin-directory-empty">No hay usuarios para esta búsqueda.</p>}</div>
          {users.length >= 200 && <p className="admin-limit-note">Se muestran los primeros 200 usuarios del realm. Ajusta la búsqueda en Keycloak si necesitas cuentas fuera de este listado.</p>}
        </section>
      </section>
    </PageReveal>

      <AnimatePresence>
        {dialog && <motion.div animate={{ opacity: 1 }} className="admin-dialog-backdrop" exit={{ opacity: 0 }} initial={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setDialog(null); }} transition={{ duration: reduceMotion ? 0 : .2 }}><motion.div aria-describedby="admin-dialog-description" aria-labelledby="admin-dialog-title" aria-modal="true" animate={{ opacity: 1, scale: 1, y: 0 }} className="admin-dialog" exit={{ opacity: 0, scale: .97, y: 10 }} initial={{ opacity: 0, scale: .97, y: 10 }} ref={dialogRef} role="dialog" tabIndex={-1} transition={{ duration: reduceMotion ? 0 : .24, ease: [0.22, 1, 0.36, 1] }}><span className={`admin-dialog-symbol${dialog.action === "delete" ? " is-danger" : ""}`}>{dialog.action === "delete" ? "×" : dialog.action === "disable" ? "−" : "+"}</span><h2 id="admin-dialog-title">{dialog.action === "delete" ? "Eliminar permanentemente" : dialog.action === "disable" ? "Desactivar usuarios" : "Reactivar usuarios"}</h2><p id="admin-dialog-description">{dialog.action === "delete" ? `Se eliminarán ${dialog.ids.length} cuenta(s) de Keycloak. Esta acción no se puede deshacer.` : dialog.action === "disable" ? `Se desactivarán ${dialog.ids.length} cuenta(s). Podrás reactivarlas después.` : `Se reactivarán ${dialog.ids.length} cuenta(s) y podrán volver a iniciar sesión.`}</p><div className="admin-dialog-targets">{dialog.names.slice(0, 5).join(" · ")}{dialog.names.length > 5 ? ` · y ${dialog.names.length - 5} más` : ""}</div><div className="admin-dialog-actions"><button className="admin-button is-outline" disabled={busy} onClick={() => setDialog(null)} type="button">Cancelar</button><button className={`admin-button ${dialog.action === "delete" ? "is-danger" : "is-primary"}`} disabled={busy} onClick={() => void confirmAction()} type="button">{busy ? "Procesando…" : dialog.action === "delete" ? "Sí, eliminar" : dialog.action === "disable" ? "Desactivar" : "Reactivar"}</button></div></motion.div></motion.div>}
      </AnimatePresence>
    </>
  );
}
