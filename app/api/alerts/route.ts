import { NextResponse } from "next/server";

type Alert = {
  id: string;
  projectId: string;
  projectName: string;
  location: string;
  risk: "Low" | "Medium" | "High";
  probability: number;
  signal: string;
  status: "Active" | "Resolved";
  createdAt: string;
};

/*
  CIVIXA ALERT STORE

  Prototype storage for the current CIVIXA system.

  The API supports the complete alert workflow:

  GET    → retrieve alerts
  POST   → create an alert
  PATCH  → resolve/reactivate an alert
  DELETE → remove resolved alert history

  This can later be replaced by a database without
  changing the frontend workflow.
*/

let alerts: Alert[] = [];

/*
  Generate the next alert ID.
*/

function generateAlertId() {
  const alertNumber = alerts.length + 1;

  return `ALT-${String(alertNumber).padStart(3, "0")}`;
}

/*
  GET
  --------------------------------
  Return all CIVIXA project alerts.
*/

export async function GET() {
  return NextResponse.json({
    success: true,
    alerts,
  });
}

/*
  POST
  --------------------------------
  Create a new project risk alert.

  Expected body:

  {
    projectId,
    projectName,
    location,
    risk,
    probability,
    signal
  }
*/

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      projectId,
      projectName,
      location,
      risk,
      probability,
      signal,
    } = body;

    /*
      Validate required fields.
    */

    if (
      !projectId ||
      !projectName ||
      !location ||
      !risk ||
      probability === undefined ||
      !signal
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required alert information.",
        },
        { status: 400 },
      );
    }

    /*
      Validate risk classification.
    */

    if (
      risk !== "Low" &&
      risk !== "Medium" &&
      risk !== "High"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid risk classification.",
        },
        { status: 400 },
      );
    }

    /*
      Validate probability.
    */

    const numericProbability = Number(probability);

    if (
      Number.isNaN(numericProbability) ||
      numericProbability < 0 ||
      numericProbability > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Risk probability must be between 0 and 100.",
        },
        { status: 400 },
      );
    }

    /*
      Prevent duplicate ACTIVE alerts for the
      same project and primary signal.

      A previously resolved alert does not prevent
      a new alert from being created.
    */

    const existingAlert = alerts.find(
      (alert) =>
        alert.projectId === projectId &&
        alert.signal === signal &&
        alert.status === "Active",
    );

    if (existingAlert) {
      return NextResponse.json({
        success: true,
        alert: existingAlert,
        alreadyExists: true,
      });
    }

    /*
      Create new alert.
    */

    const newAlert: Alert = {
      id: generateAlertId(),
      projectId,
      projectName,
      location,
      risk,
      probability: numericProbability,
      signal,
      status: "Active",
      createdAt: "Today",
    };

    alerts = [...alerts, newAlert];

    return NextResponse.json(
      {
        success: true,
        alert: newAlert,
        alreadyExists: false,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CIVIXA alert creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create alert.",
      },
      { status: 500 },
    );
  }
}

/*
  PATCH
  --------------------------------
  Update the status of an alert.

  Expected body:

  {
    id,
    status: "Active" | "Resolved"
  }

  Current frontend uses this to mark alerts
  as resolved.
*/

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Alert ID and status are required.",
        },
        { status: 400 },
      );
    }

    /*
      Validate status.
    */

    if (
      status !== "Active" &&
      status !== "Resolved"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid alert status.",
        },
        { status: 400 },
      );
    }

    /*
      Find alert.
    */

    const alertIndex = alerts.findIndex(
      (alert) => alert.id === id,
    );

    if (alertIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Alert not found.",
        },
        { status: 404 },
      );
    }

    /*
      Update alert status.
    */

    const updatedAlert: Alert = {
      ...alerts[alertIndex],
      status,
      createdAt:
        status === "Resolved"
          ? "Just now"
          : alerts[alertIndex].createdAt,
    };

    alerts[alertIndex] = updatedAlert;

    return NextResponse.json({
      success: true,
      alert: updatedAlert,
    });
  } catch (error) {
    console.error("CIVIXA alert update error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to update alert.",
      },
      { status: 500 },
    );
  }
}

/*
  DELETE
  --------------------------------
  Delete resolved alert history.

  This is intentionally restricted to RESOLVED
  alerts so active risk warnings cannot accidentally
  be removed.

  Supported requests:

  DELETE /api/alerts

  → Delete ALL resolved alerts.

  OR

  DELETE /api/alerts

  body:
  {
    id: "ALT-001"
  }

  → Delete one resolved alert.
*/

export async function DELETE(request: Request) {
  try {
    /*
      Try to read a request body.

      The body is optional because the Alerts page
      can delete the entire resolved history.
    */

    let body: { id?: string } = {};

    try {
      body = await request.json();
    } catch {
      /*
        No body supplied.
        This means delete all resolved history.
      */
    }

    /*
      Delete one specific resolved alert.
    */

    if (body.id) {
      const alert = alerts.find(
        (item) => item.id === body.id,
      );

      if (!alert) {
        return NextResponse.json(
          {
            success: false,
            error: "Alert not found.",
          },
          { status: 404 },
        );
      }

      if (alert.status !== "Resolved") {
        return NextResponse.json(
          {
            success: false,
            error: "Only resolved alerts can be deleted.",
          },
          { status: 400 },
        );
      }

      alerts = alerts.filter(
        (item) => item.id !== body.id,
      );

      return NextResponse.json({
        success: true,
        deleted: 1,
        alerts,
      });
    }

    /*
      Delete all resolved history.
    */

    const activeAlerts = alerts.filter(
      (alert) => alert.status === "Active",
    );

    const deletedCount =
      alerts.length - activeAlerts.length;

    alerts = activeAlerts;

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      alerts,
    });
  } catch (error) {
    console.error("CIVIXA alert deletion error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to delete alert history.",
      },
      { status: 500 },
    );
  }
}