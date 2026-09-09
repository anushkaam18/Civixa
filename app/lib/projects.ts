export type Project = {
  id: string;
  name: string;
  location: string;
  progress: number;
  status: string;

  scheduleVariance: number;
  costVariance: number;
  milestoneDelay: number;
  complaints: number;
  failedInspections: number;
};

export const projects: Project[] = [
  {
    id: "URBAN-01",
    name: "Urban Water Network",
    location: "Kolkata",
    progress: 61,
    status: "Delayed",

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

export function getProjectById(id: string) {
  return projects.find(
    (project) => project.id.toUpperCase() === id.toUpperCase()
  );
}