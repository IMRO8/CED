import "dotenv/config";

import cors from "cors";
import express from "express";

import { prisma } from "./db";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

function readRequestBody(body: {
  employeeName?: unknown;
  reason?: unknown;
  resource?: unknown;
}) {
  const employeeName =
    typeof body.employeeName === "string"
      ? body.employeeName.trim()
      : "";

  const reason =
    typeof body.reason === "string"
      ? body.reason.trim()
      : "";

  const resource =
    typeof body.resource === "string"
      ? body.resource.trim()
      : "";

  return {
    employeeName,
    reason,
    resource,
  };
}

function readId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}


app.get("/api/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "Express server is running",
  });
});


app.post("/api/requests", async (req, res) => {
  try {
    const {
      employeeName,
      reason,
      resource,
    } = readRequestBody(req.body);

    if (!employeeName || !reason || !resource) {
      return res.status(400).json({
        error:
          "employeeName, reason, and resource are required",
      });
    }

    const createdRequest =
      await prisma.employeeRequest.create({
        data: {
          employeeName,
          reason,
          resource,
        },
      });

    return res.status(201).json(createdRequest);
  } catch (error) {
    console.error("Create request failed:", error);

    return res.status(500).json({
      error: "Could not create employee request",
    });
  }
});


app.get("/api/requests", async (_req, res) => {
  try {
    const requests =
      await prisma.employeeRequest.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Read requests failed:", error);

    return res.status(500).json({
      error: "Could not retrieve employee requests",
    });
  }
});


app.get("/api/requests/:id", async (req, res) => {
  try {
    const id = readId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Invalid request ID",
      });
    }

    const request =
      await prisma.employeeRequest.findUnique({
        where: {
          id,
        },
      });

    if (!request) {
      return res.status(404).json({
        error: "Employee request not found",
      });
    }

    return res.status(200).json(request);
  } catch (error) {
    console.error("Read request failed:", error);

    return res.status(500).json({
      error: "Could not retrieve employee request",
    });
  }
});


app.put("/api/requests/:id", async (req, res) => {
  try {
    const id = readId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Invalid request ID",
      });
    }

    const {
      employeeName,
      reason,
      resource,
    } = readRequestBody(req.body);

    if (!employeeName || !reason || !resource) {
      return res.status(400).json({
        error:
          "employeeName, reason, and resource are required",
      });
    }

    const existingRequest =
      await prisma.employeeRequest.findUnique({
        where: {
          id,
        },
      });

    if (!existingRequest) {
      return res.status(404).json({
        error: "Employee request not found",
      });
    }

    const updatedRequest =
      await prisma.employeeRequest.update({
        where: {
          id,
        },
        data: {
          employeeName,
          reason,
          resource,
        },
      });

    return res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Update request failed:", error);

    return res.status(500).json({
      error: "Could not update employee request",
    });
  }
});

/*
 * DELETE
 *
 * DELETE /api/requests/5
 */
app.delete("/api/requests/:id", async (req, res) => {
  try {
    const id = readId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Invalid request ID",
      });
    }

    const existingRequest =
      await prisma.employeeRequest.findUnique({
        where: {
          id,
        },
      });

    if (!existingRequest) {
      return res.status(404).json({
        error: "Employee request not found",
      });
    }

    await prisma.employeeRequest.delete({
      where: {
        id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete request failed:", error);

    return res.status(500).json({
      error: "Could not delete employee request",
    });
  }
});

const server = app.listen(PORT, () => {
  console.log(
    `Express server running on http://localhost:${PORT}`,
  );
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);