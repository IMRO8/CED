import React, { useState, useEffect } from "react";
import "./App.css";
import fetchData from "./components/datafetch";
import type {
  Employee,
  RandomUserResponse,
  ACCRequest,
} from "./types/employee";

function App() {
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [requestData, setRequestData] = useState<ACCRequest[]>([]);

  const [employeeName, setEmployeeName] = useState("");
  const [reason, setReason] = useState("");
  const [resource, setResource] = useState("");

  useEffect(() => {
    async function getEmployeeData() {
      const data = await fetchData<RandomUserResponse>(
        "https://randomuser.me/api/?results=10",
      );

      const employees: Employee[] = data.results.map((user) => ({
        name: `${user.name.first} ${user.name.last}`,
        phoneNumber: user.phone,
        profilePicture: user.picture.medium,
      }));

      setEmployeeData(employees);
    }

    getEmployeeData();
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!employeeName || !reason || !resource) {
      return;
    }

    const newRequest: ACCRequest = {
      employeeName,
      reason,
      resource,
    };

    setRequestData((prev) => [...prev, newRequest]);

    setEmployeeName("");
    setReason("");
    setResource("");
  }

  return (
    <>
      <main className="App-body">
        <section className="employee-section">
          <h2 className="App-title">Employee Dashboard</h2>

          <div className="employee-list">
            {employeeData.map((employee, index) => (
              <div className="employee-card" key={employee.phoneNumber}>
                <p>#Employee {index + 1}</p>
                <img src={employee.profilePicture} alt={employee.name} />
                <h2>Name: {employee.name}</h2>
                <p>Ph.No: {employee.phoneNumber}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="request-row">
          <section className="requests-card">
            <h2>Employee Requests</h2>

            {requestData.length === 0 ? (
              <p>No requests yet.</p>
            ) : (
              requestData.map((request, index) => (
                <div className="request-item" key={index}>
                  <h3>{request.employeeName}</h3>
                  <p>Reason: {request.reason}</p>
                  <p>Resource: {request.resource}</p>
                </div>
              ))
            )}
          </section>

          <section className="newRequest">
            <h2>New Request</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Employee name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Request reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <select
                value={resource}
                onChange={(e) => setResource(e.target.value)}
              >
                <option value="">Select resource</option>
                <option value="AWS credit">AWS Credit</option>
                <option value="K8">Kubernetes</option>
                <option value="Claude credit">Claude Credit</option>
              </select>

              <button type="submit">Submit Request</button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
