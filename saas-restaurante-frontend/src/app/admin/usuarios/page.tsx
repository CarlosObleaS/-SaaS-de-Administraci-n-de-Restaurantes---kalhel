"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
};

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const [editing, setEditing] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"ADMIN" | "MESERO">("MESERO");
  const [editActive, setEditActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const token = () => localStorage.getItem("token") ?? "";

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("No se pudieron cargar los usuarios");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "No se pudo crear el usuario");
      }
      await res.json();
      setName("");
      setEmail("");
      setPassword("");
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword("");
    setEditRole((u.role as any) || "MESERO");
    setEditActive(u.isActive ?? true);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    setError(null);
    try {
      const body: any = {
        name: editName,
        email: editEmail,
        role: editRole,
        isActive: editActive,
      };
      if (editPassword) body.password = editPassword;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${editing.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "No se pudo actualizar el usuario");
      }
      await res.json();
      setEditing(null);
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <section className="pb-16">
      <div className="mb-6 flex items-center gap-3">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
          onClick={() => router.back()}
          aria-label="Volver"
        >
          ←
        </button>
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Gestión de Personal</h1>
          <p className="text-slate-500">Crea y administra los mozos/meseros del restaurante.</p>
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-[#E7DCD2] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Crear usuario (mesero)</h3>
        <form className="grid gap-3 md:grid-cols-3" onSubmit={handleCreate}>
          <input
            className="h-11 rounded-xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="h-11 rounded-xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="h-11 rounded-xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="h-11 rounded-xl bg-orange-500 px-5 text-white hover:bg-orange-600 disabled:opacity-60"
              disabled={creating}
            >
              {creating ? "Creando..." : "Crear mesero"}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-red-600">{error}</div>}

      {loading ? (
        <p className="text-slate-500">Cargando usuarios...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {users.map((u) => (
            <article
              key={u.id}
              className="card flex items-center justify-between rounded-2xl border border-[#E7DCD2] bg-white px-5 py-4 cursor-pointer hover:shadow"
              onClick={() => openEdit(u)}
            >
              <div>
                <div className="text-lg font-semibold text-slate-900">{u.name}</div>
                <div className="text-sm text-slate-500">{u.email}</div>
                <div className="text-xs text-slate-400 mt-1">Rol: {u.role}</div>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-700">
                ID {u.id.slice(0, 6)}
              </span>
            </article>
          ))}
          {users.length === 0 && <p className="text-slate-500">No hay personal registrado.</p>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900">Editar usuario</h3>
              <button
                className="text-slate-500 hover:text-slate-700"
                onClick={() => setEditing(null)}
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <input
                className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-orange-300"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nombre"
              />
              <input
                className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-orange-300"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Correo"
                type="email"
              />
              <input
                className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-orange-300"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Nueva contraseña (opcional)"
                type="password"
              />
              <div className="flex gap-3">
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-orange-300"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as "ADMIN" | "MESERO")}
                >
                  <option value="MESERO">Mesero</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                  />
                  Activo
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                className="h-10 rounded-xl border border-slate-200 px-4 text-slate-700 hover:bg-slate-50"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>
              <button
                className="h-10 rounded-xl bg-orange-500 px-5 text-white hover:bg-orange-600 disabled:opacity-60"
                onClick={saveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
