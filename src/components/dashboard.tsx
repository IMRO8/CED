import { useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Employee } from "../types/employee";

// NOTE: Employee now represents a DB row, so it must include `id`:
//   type Employee = { id: string; name: string; phoneNumber: string; profilePicture?: string };
// The old RandomUserResponse type is no longer used here.

// useMutation is used for changing server data.
//useQuery is for reading:

const API = "/api/employees";

export function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // ----- read: React Query is the browser-side cache (mirror of Redis) -----
  const { data: employees = [], isLoading, isError } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: () => fetch(API).then((r) => r.json()),
  });

  // one helper: any successful write busts the client cache -> refetch -> hits server (Redis) cache
  const invalidate = () => qc.invalidateQueries({ queryKey: ["employees"] });

  // ----- mutations: create / update / delete -----
  const addEmployee = useMutation({
    mutationFn: (emp: Omit<Employee, "id">) =>
      fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emp),
      }).then((r) => r.json()),
    onSuccess: invalidate,
  });

  const editEmployee = useMutation({
    mutationFn: ({ id, ...data }: Employee) =>
      fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: invalidate,
  });

  const removeEmployee = useMutation({
    mutationFn: (id: string) => fetch(`${API}/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  // ----- local UI state -----
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPic, setNewPic] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPic, setEditPic] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    addEmployee.mutate({ name: newName, phoneNumber: newPhone, profilePicture : newPic || undefined});
    setNewName("");
    setNewPhone("");
    setNewPic("");
  };

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditName(emp.name);
    setEditPhone(emp.phoneNumber);
    setEditPic(emp.profilePicture ?? "");
  };

  const saveEdit = (emp: Employee) => {
    editEmployee.mutate({ ...emp, name: editName, phoneNumber: editPhone, profilePicture:editPic.trim() || undefined});
    setEditingId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    window.location.href = "/login";
  };

  return (
    <main className="App-body">
      <section className="employee-section">
        <h2 className="App-title">Employee Dashboard</h2>

        {/* these were never forms - just actions */}
        <button type="button" onClick={handleLogout}>Logout</button>
        <button type="button" onClick={() => navigate("/reqs")}>Request form</button>

        {/* add form: this one IS a real form (it has data + a submit) */}
        <form className="add-employee" onSubmit={handleAdd}>
          <input
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            placeholder="Phone number"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />

          <input
            type="url"
            placeholder="Picture"
            value={newPic}
            onChange={(e) => setNewPic(e.target.value)}
          />

          <button type="submit" disabled={addEmployee.isPending}>
            {addEmployee.isPending ? "Adding..." : "Add employee"}
          </button>
        </form>

        {isLoading && <p>Loading...</p>}
        {isError && <p>Couldn't load employees.</p>}

        <div className="employee-list">
          {employees.map((employee, index) => (
            <div className="employee-card" key={employee.id}>
              <p>#Employee {index + 1}</p>

              {employee.profilePicture ? (
                <img src={employee.profilePicture} alt={employee.name} />
              ) : (
                <div className="avatar-placeholder">{employee.name.charAt(0)}</div>
              )}

              {editingId === employee.id ? (
                <>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                  <input type = "url" value={editPic} onChange={(e) => setEditPic(e.target.value)} />
                  <button type="button" onClick={() => saveEdit(employee)}>Save</button>
                  <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <h2>Name: {employee.name}</h2>
                  <p>Ph.No: {employee.phoneNumber}</p>
                  <button type="button" onClick={() => startEdit(employee)}>Edit</button>
                  <button
                    type="button"
                    onClick={() => removeEmployee.mutate(employee.id)}
                    disabled={removeEmployee.isPending}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
