import React, { useEffect, useState } from "react";
import "../App.css";
import type { ACCRequest } from "../types/employee";
import { useNavigate } from "react-router-dom";

export function Reqs() {
  const navigate = useNavigate();
  const [employeeName, setEmployeeName] = useState("");
  const [reason, setReason] = useState("");
  const [resource, setResource] = useState("");

  const [requestData, setRequestData] = useState<ACCRequest[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  /*
  READ : Load all existing requests when this component opens.
   */
  useEffect(() => {
    async function loadRequests() {
      try {
        setError("");

        const response = await fetch("/api/requests");

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          throw new Error(
            errorData?.error ??
              `Failed to load requests: ${response.status}`,
          );
        }

        const data: ACCRequest[] = await response.json();

        setRequestData(data);
      } catch (error) {
        console.error("Load error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load requests",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadRequests();
  }, []);

  function resetForm() {
    setEmployeeName("");
    setReason("");
    setResource("");
    setEditingId(null);
  }

  /*
   CREATE or UPDATE
   When editingId is null, send POST.
   When editingId contains an ID, send PUT.
   */
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanedEmployeeName = employeeName.trim();
    const cleanedReason = reason.trim();

    if (!cleanedEmployeeName || !cleanedReason || !resource) {
      setError("Please complete all fields.");
      return;
    }

    const requestBody = {
      employeeName: cleanedEmployeeName,
      reason: cleanedReason,
      resource,
    };

    const isEditing = editingId !== null;

    const endpoint = isEditing
      ? `/api/requests/${editingId}`
      : "/api/requests";

    const method = isEditing ? "PUT" : "POST";

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseData?.error ??
            `Request failed: ${response.status}`,
        );
      }

      const savedRequest: ACCRequest = responseData;

      if (isEditing) {
        setRequestData((previousRequests) =>
          previousRequests.map((request) =>
            request.id === savedRequest.id
              ? savedRequest
              : request,
          ),
        );
      } else {
        setRequestData((previousRequests) => [
          savedRequest,
          ...previousRequests,
        ]);
      }

      resetForm();
    } catch (error) {
      console.error("Submit error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save request",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
    Put the selected record into the form.
   */
  function handleEdit(request: ACCRequest) {
    setEditingId(request.id);
    setEmployeeName(request.employeeName);
    setReason(request.reason);
    setResource(request.resource);
    setError("");
  }

  /*
    DELETE
   */
  async function handleDelete(id: number) {
    try {
      setError("");

      const response = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.error ??
            `Delete failed: ${response.status}`,
        );
      }

      setRequestData((previousRequests) =>
        previousRequests.filter(
          (request) => request.id !== id,
        ),
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Delete error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete request",
      );
    }
  }

  return (
    <div className="request-row">
      <section className="requests-card">
        <h2>Employee Requests</h2>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {isLoading ? (
          <p>Loading requests...</p>
        ) : requestData.length === 0 ? (
          <p>No requests yet.</p>
        ) : (
          requestData.map((request) => (
            <div
              className="request-item"
              key={request.id}
            >
              <h3>{request.employeeName}</h3>

              <p>
                Reason: {request.reason}
              </p>

              <p>
                Resource: {request.resource}
              </p>

              <button
                type="button"
                onClick={() => handleEdit(request)}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => handleDelete(request.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </section>

      <section className="newRequest">
        <h2>
          {editingId === null
            ? "New Request"
            : "Edit Request"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Employee name"
            value={employeeName}
            onChange={(event) =>
              setEmployeeName(event.target.value)
            }
          />

          <input
            type="text"
            placeholder="Request reason"
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
          />

          <select
            value={resource}
            onChange={(event) =>
              setResource(event.target.value)
            }
          >
            <option value="">
              Select resource
            </option>

            <option value="AWS credit">
              AWS Credit
            </option>

            <option value="K8">
              Kubernetes
            </option>

            <option value="Claude credit">
              Claude Credit
            </option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : editingId === null
                ? "Submit Request"
                : "Update Request"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </form>

        <button onClick={() =>{navigate("/dashboard")}}>
          Dashboard
        </button>
      </section>
    </div>
  );
}