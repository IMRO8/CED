import React, { useState } from "react";
import "../App.css";

 import type {
  ACCRequest,
} from "../types/employee";

 
export function Reqs() {
    const [employeeName, setEmployeeName] = useState("");
      const [reason, setReason] = useState("");
      const [resource, setResource] = useState("");
      const [requestData, setRequestData] = useState<ACCRequest[]>([]);
      function handleSubmit(e: React.FormEvent<HTMLFormElement>) 
      {
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


    return(
 
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
    )
}