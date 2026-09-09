import { NextResponse } from "next/server";

const projects = [
  {
    id: "URBAN-01",
    name: "Urban Water Network",
    location: "Kolkata",
    progress: 61,
    status: "Delayed",

    // Input signals
    scheduleVariance: 18,
    costVariance: 11.4,
    milestoneDelay: 14,
    complaints: 27,
    failedInspections: 2,
  },

  {
    id: "POWER-07",
    name: "Regional Power Transmission",
    location: "Odisha",
    progress: 74,
    status: "On Track",

    scheduleVariance: 6,
    costVariance: 12.8,
    milestoneDelay: 5,
    complaints: 11,
    failedInspections: 1,
  },

  {
    id: "RAIL-12",
    name: "Eastern Freight Corridor",
    location: "Bihar",
    progress: 69,
    status: "On Track",

    scheduleVariance: 9,
    costVariance: 5.2,
    milestoneDelay: 10,
    complaints: 8,
    failedInspections: 1,
  },

  {
    id: "NH-19",
    name: "NH-19 Road Widening",
    location: "West Bengal",
    progress: 82,
    status: "On Track",

    scheduleVariance: 2,
    costVariance: 3.1,
    milestoneDelay: 0,
    complaints: 4,
    failedInspections: 0,
  },
];

function calculateRisk(project: (typeof projects)[number]) {
  /*
    Risk scoring model

    Schedule       → 30%
    Cost           → 25%
    Milestones     → 20%
    Complaints     → 15%
    Inspections    → 10%
  */

  const scheduleRisk = Math.min(
    (project.scheduleVariance / 20) * 100,
    100,
  );

  const costRisk = Math.min(
    (project.costVariance / 15) * 100,
    100,
  );

  const milestoneRisk = Math.min(
    (project.milestoneDelay / 15) * 100,
    100,
  );

  const complaintRisk = Math.min(
    (project.complaints / 30) * 100,
    100,
  );

  const inspectionRisk = Math.min(
    (project.failedInspections / 3) * 100,
    100,
  );

  /*
    Weighted probability
  */

  const probability = Math.round(
    scheduleRisk * 0.30 +
      costRisk * 0.25 +
      milestoneRisk * 0.20 +
      complaintRisk * 0.15 +
      inspectionRisk * 0.10,
  );

  /*
    Risk classification
  */

  let risk: "Low" | "Medium" | "High";

  if (probability >= 70) {
    risk = "High";
  } else if (probability >= 45) {
    risk = "Medium";
  } else {
    risk = "Low";
  }

  /*
    Normalized signals
  */

  const signals = [
    {
      label: "Schedule risk",
      value: Math.round(scheduleRisk),
      weight: 30,
    },
    {
      label: "Cost risk",
      value: Math.round(costRisk),
      weight: 25,
    },
    {
      label: "Milestone risk",
      value: Math.round(milestoneRisk),
      weight: 20,
    },
    {
      label: "Complaint risk",
      value: Math.round(complaintRisk),
      weight: 15,
    },
    {
      label: "Inspection risk",
      value: Math.round(inspectionRisk),
      weight: 10,
    },
  ];

  /*
    Find strongest contributing signal.
  */

  const strongestSignal = [...signals].sort(
    (a, b) => b.value - a.value,
  )[0];

  /*
    Count signals that are genuinely showing
    meaningful warning levels.

    50%+ normalized risk = emerging signal.
  */

  const emergingSignals = signals.filter(
    (signal) => signal.value >= 50,
  ).length;

  /*
    Generate prediction and recommended action
    according to both the strongest signal and
    overall risk level.
  */

  let prediction = "";
  let action = "";

  if (strongestSignal.label === "Schedule risk") {
    if (risk === "High") {
      prediction =
        "High probability of further schedule delay.";
    } else if (risk === "Medium") {
      prediction =
        "Emerging possibility of further schedule delay.";
    } else {
      prediction =
        "Limited evidence of significant schedule delay.";
    }

    action =
      "Review pending milestones and contractor schedule.";
  }

  else if (strongestSignal.label === "Cost risk") {
    if (risk === "High") {
      prediction =
        "High probability of further cost escalation.";
    } else if (risk === "Medium") {
      prediction =
        "Emerging possibility of cost escalation.";
    } else {
      prediction =
        "Limited evidence of significant cost escalation.";
    }

    action =
      "Review expenditure movement against approved budget.";
  }

  else if (strongestSignal.label === "Milestone risk") {
    if (risk === "High") {
      prediction =
        "High probability of further milestone completion delay.";
    } else if (risk === "Medium") {
      prediction =
        "Emerging possibility of milestone completion delay.";
    } else {
      prediction =
        "Limited evidence of significant milestone delay.";
    }

    action =
      "Monitor upcoming milestones and implementation progress.";
  }

  else if (strongestSignal.label === "Complaint risk") {
    if (risk === "High") {
      prediction =
        "High probability of emerging implementation issues indicated by civic complaints.";
    } else if (risk === "Medium") {
      prediction =
        "Increasing civic complaints may indicate emerging implementation issues.";
    } else {
      prediction =
        "Current complaint levels show limited evidence of major implementation issues.";
    }

    action =
      "Review complaint patterns and investigate affected infrastructure.";
  }

  else {
    if (risk === "High") {
      prediction =
        "Inspection history indicates a high probability of infrastructure risk.";
    } else if (risk === "Medium") {
      prediction =
        "Inspection history indicates emerging infrastructure risk.";
    } else {
      prediction =
        "Inspection history currently indicates limited infrastructure risk.";
    }

    action =
      "Review failed inspections and schedule corrective action.";
  }

  /*
    Return complete prediction result.
  */

  return {
    id: project.id,
    name: project.name,
    location: project.location,
    progress: project.progress,
    status: project.status,

    risk,
    probability,

    primarySignal: strongestSignal.label,

    signals,

    emergingSignals,

    prediction,
    action,

    /*
      Original project inputs.
    */

    inputData: {
      scheduleVariance: project.scheduleVariance,
      costVariance: project.costVariance,
      milestoneDelay: project.milestoneDelay,
      complaints: project.complaints,
      failedInspections: project.failedInspections,
    },

    /*
      Makes the scoring model transparent.
    */

    scoring: {
      schedule: {
        input: project.scheduleVariance,
        normalized: Math.round(scheduleRisk),
        weight: 30,
      },

      cost: {
        input: project.costVariance,
        normalized: Math.round(costRisk),
        weight: 25,
      },

      milestone: {
        input: project.milestoneDelay,
        normalized: Math.round(milestoneRisk),
        weight: 20,
      },

      complaints: {
        input: project.complaints,
        normalized: Math.round(complaintRisk),
        weight: 15,
      },

      inspections: {
        input: project.failedInspections,
        normalized: Math.round(inspectionRisk),
        weight: 10,
      },
    },
  };
}

export async function GET() {
  const predictions = projects.map(calculateRisk);

  /*
    Portfolio risk counts.
  */

  const highRisk = predictions.filter(
    (project) => project.risk === "High",
  ).length;

  const mediumRisk = predictions.filter(
    (project) => project.risk === "Medium",
  ).length;

  const lowRisk = predictions.filter(
    (project) => project.risk === "Low",
  ).length;

  /*
    Total number of meaningful warning signals
    across the portfolio.
  */

  const emergingSignals = predictions.reduce(
    (total, project) => total + project.emergingSignals,
    0,
  );

  return NextResponse.json({
    success: true,

    model: {
      name: "CIVIXA Risk Detection Engine",
      version: "Prototype 1.1",
      type: "Weighted Risk Scoring",
      status: "active",
    },

    portfolio: {
      projectsAssessed: predictions.length,
      highRisk,
      mediumRisk,
      lowRisk,
      emergingSignals,
    },

    predictions,
  });
}