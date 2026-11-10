"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  createDocument,
  deleteDocument,
  Document,
  DocumentFilters,
  DocumentInput,
  getDocument,
  listDocuments,
  updateDocument,
} from "../lib/api";

const emptyForm: DocumentInput = {
  name: "",
  author: "",
  dateCreated: new Date().toISOString().slice(0, 16),
  size: 0,
  fileFormat: "",
};

const emptyFilters: DocumentFilters = {
  search: "",
  name: "",
  author: "",
  fileFormat: "",
  createdFrom: "",
  createdTo: "",
  minSize: "",
  maxSize: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let size = bytes;
  let unit = -1;
  do {
    size /= 1024;
    unit += 1;
  } while (size >= 1024 && unit < units.length - 1);
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unit]}`;
}

function toInputDate(value: string) {
  return new Date(value).toISOString().slice(0, 16);
}

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filters, setFilters] = useState<DocumentFilters>(emptyFilters);
  const [activeFilters, setActiveFilters] = useState<DocumentFilters>(emptyFilters);
  const [selected, setSelected] = useState<Document | null>(null);
  const [editing, setEditing] = useState<Document | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DocumentInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDocuments = useCallback(async (nextFilters: DocumentFilters) => {
    setLoading(true);
    setError("");
    try {
      setDocuments(await listDocuments(nextFilters));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadDocuments(activeFilters));
  }, [activeFilters, loadDocuments]);

  const formats = useMemo(() => new Set(documents.map((document) => document.fileFormat.toLowerCase())).size, [documents]);
  const totalSize = useMemo(() => documents.reduce((sum, document) => sum + document.size, 0), [documents]);

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveFilters({ ...filters });
  }

  function clearFilters() {
    setFilters({ ...emptyFilters });
    setActiveFilters({ ...emptyFilters });
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, dateCreated: new Date().toISOString().slice(0, 16) });
    setShowForm(true);
    setSelected(null);
  }

  function openEdit(document: Document) {
    setEditing(document);
    setForm({
      name: document.name,
      author: document.author,
      dateCreated: toInputDate(document.dateCreated),
      size: document.size,
      fileFormat: document.fileFormat,
    });
    setShowForm(true);
    setSelected(null);
  }

  async function openDetails(id: string) {
    setError("");
    try {
      setSelected(await getDocument(id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load that document.");
    }
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form, size: Number(form.size), dateCreated: new Date(form.dateCreated).toISOString() };
    try {
      if (editing) {
        await updateDocument(editing.id, payload);
      } else {
        await createDocument(payload);
      }
      setShowForm(false);
      await loadDocuments(activeFilters);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the document.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(document: Document) {
    if (!window.confirm(`Delete “${document.name}”?`)) return;
    setError("");
    try {
      await deleteDocument(document.id);
      setSelected(null);
      await loadDocuments(activeFilters);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete the document.");
    }
  }

  function updateFilter(key: keyof DocumentFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">D</span><span>DData <em>Library</em></span></div>
        <div className="connection"><span className="status-dot" /> API connected locally</div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">DOCUMENT WORKSPACE</p>
          <h1>Your document library.</h1>
          <p className="hero-copy">Search, inspect, and keep your structured documents organized.</p>
        </div>
        <button className="primary-button" onClick={openCreate}>+ Add document</button>
      </section>

      <section className="stats-grid" aria-label="Library summary">
        <div className="stat-card"><span className="stat-label">Visible documents</span><strong>{documents.length}</strong><span className="stat-note">Matching current filters</span></div>
        <div className="stat-card"><span className="stat-label">Formats</span><strong>{formats}</strong><span className="stat-note">Across this collection</span></div>
        <div className="stat-card"><span className="stat-label">Total size</span><strong>{formatSize(totalSize)}</strong><span className="stat-note">Current result set</span></div>
      </section>

      <section className="content-card">
        <div className="section-heading"><div><p className="eyebrow">DATABASE VIEW</p><h2>All documents</h2></div><button className="text-button" onClick={() => void loadDocuments(activeFilters)}>↻ Refresh</button></div>
        <form className="filters" onSubmit={handleFilterSubmit}>
          <label className="search-field"><span>⌕</span><input value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Search name, author, or format" /></label>
          <input value={filters.name} onChange={(event) => updateFilter("name", event.target.value)} placeholder="Name contains" aria-label="Name contains" />
          <input value={filters.author} onChange={(event) => updateFilter("author", event.target.value)} placeholder="Author contains" aria-label="Author contains" />
          <input value={filters.fileFormat} onChange={(event) => updateFilter("fileFormat", event.target.value)} placeholder="Format (e.g. PDF)" aria-label="File format" />
          <div className="filter-row"><label>Created from<input type="date" value={filters.createdFrom} onChange={(event) => updateFilter("createdFrom", event.target.value)} /></label><label>Created to<input type="date" value={filters.createdTo} onChange={(event) => updateFilter("createdTo", event.target.value)} /></label><label>Min bytes<input type="number" min="0" value={filters.minSize} onChange={(event) => updateFilter("minSize", event.target.value)} /></label><label>Max bytes<input type="number" min="0" value={filters.maxSize} onChange={(event) => updateFilter("maxSize", event.target.value)} /></label></div>
          <div className="filter-actions"><button className="primary-button small" type="submit">Apply filters</button><button className="text-button" type="button" onClick={clearFilters}>Clear</button></div>
        </form>

        {error && <div className="error-banner" role="alert">{error}</div>}
        <div className="table-wrap">
          <table><thead><tr><th>Document</th><th>Author</th><th>Format</th><th>Created</th><th>Size</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{loading ? <tr><td className="empty-state" colSpan={6}>Loading documents…</td></tr> : documents.length === 0 ? <tr><td className="empty-state" colSpan={6}><strong>No documents found</strong><span>Try changing the filters or add your first document.</span></td></tr> : documents.map((document) => <tr key={document.id} onClick={() => void openDetails(document.id)}><td><div className="document-name"><span className="file-icon">{document.fileFormat.slice(0, 3).toUpperCase()}</span><span><strong>{document.name}</strong><small>{document.id}</small></span></div></td><td>{document.author}</td><td><span className="format-pill">{document.fileFormat.toUpperCase()}</span></td><td>{formatDate(document.dateCreated)}</td><td>{formatSize(document.size)}</td><td><button className="row-action" onClick={(event) => { event.stopPropagation(); openEdit(document); }}>Edit</button><button className="row-action danger" onClick={(event) => { event.stopPropagation(); void handleDelete(document); }}>Delete</button></td></tr>)}</tbody>
          </table>
        </div>
      </section>

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><article className="modal detail-modal" onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setSelected(null)}>×</button><p className="eyebrow">DOCUMENT DETAILS</p><h2>{selected.name}</h2><div className="detail-list"><div><span>Author</span><strong>{selected.author}</strong></div><div><span>Format</span><strong>{selected.fileFormat.toUpperCase()}</strong></div><div><span>Created</span><strong>{formatDate(selected.dateCreated)}</strong></div><div><span>Size</span><strong>{formatSize(selected.size)}</strong></div><div><span>Identifier</span><strong className="mono">{selected.id}</strong></div></div><div className="modal-actions"><button className="secondary-button" onClick={() => openEdit(selected)}>Edit document</button><button className="danger-button" onClick={() => void handleDelete(selected)}>Delete</button></div></article></div>}

      {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><form className="modal" onSubmit={handleFormSubmit} onClick={(event) => event.stopPropagation()}><button type="button" className="close-button" onClick={() => setShowForm(false)}>×</button><p className="eyebrow">{editing ? "EDIT DOCUMENT" : "NEW DOCUMENT"}</p><h2>{editing ? "Update document" : "Add a document"}</h2><div className="form-grid"><label>Name<input required maxLength={200} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Author<input required maxLength={200} value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} /></label><label>Format<input required maxLength={50} placeholder="PDF" value={form.fileFormat} onChange={(event) => setForm({ ...form, fileFormat: event.target.value })} /></label><label>Size in bytes<input required type="number" min="0" value={form.size} onChange={(event) => setForm({ ...form, size: Number(event.target.value) })} /></label><label className="full-width">Created date<input required type="datetime-local" value={form.dateCreated} onChange={(event) => setForm({ ...form, dateCreated: event.target.value })} /></label></div><div className="modal-actions"><button type="button" className="text-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create document"}</button></div></form></div>}
    </main>
  );
}
