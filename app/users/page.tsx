"use client";

import { useMemo, useState } from "react";

const users = [
  {
    id: "USR-001",
    name: "Ananya Sharma",
    email: "ananya.sharma@civixa.gov",
    role: "Administrator",
    department: "Data & Innovation Division",
    status: "Active",
    lastActive: "Today",
  },
  {
    id: "USR-002",
    name: "Rahul Das",
    email: "rahul.das@civixa.gov",
    role: "Ministry Official",
    department: "Ministry of Road Transport & Highways",
    status: "Active",
    lastActive: "Today",
  },
  {
    id: "USR-003",
    name: "Sneha Roy",
    email: "sneha.roy@civixa.gov",
    role: "Project Officer",
    department: "Infrastructure Monitoring",
    status: "Active",
    lastActive: "Yesterday",
  },
  {
    id: "USR-004",
    name: "Arjun Mehta",
    email: "arjun.mehta@civixa.gov",
    role: "Project Officer",
    department: "Infrastructure Monitoring",
    status: "Active",
    lastActive: "Yesterday",
  },
  {
    id: "USR-005",
    name: "Priya Nair",
    email: "priya.nair@civixa.gov",
    role: "Ministry Official",
    department: "Ministry of Power",
    status: "Inactive",
    lastActive: "12 Aug 2026",
  },
];

const roles = [
  "All roles",
  "Administrator",
  "Ministry Official",
  "Project Officer",
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All roles");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.department.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        role === "All roles" || user.role === role;

      return matchesSearch && matchesRole;
    });
  }, [search, role]);

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const administrators = users.filter(
    (user) => user.role === "Administrator"
  ).length;

  const projectOfficers = users.filter(
    (user) => user.role === "Project Officer"
  ).length;

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f4f5f2]">

      {/* HEADER */}
      <header className="w-full border-b border-slate-200 px-5 py-7 sm:px-8 lg:px-10">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              CIVIXA · ADMINISTRATION
            </p>

            <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-slate-950">
              User Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage platform users, roles and access to infrastructure
              monitoring workflows.
            </p>
          </div>

          <button
            type="button"
            className="w-full shrink-0 border border-slate-900 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto"
          >
            + Add User
          </button>

        </div>
      </header>

      {/* CONTENT */}
      <div className="w-full min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">

        {/* SUMMARY */}
        <div className="grid w-full min-w-0 grid-cols-1 border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-4">

          <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Total users
            </p>

            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {users.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Registered accounts
            </p>
          </div>

          <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Active users
            </p>

            <p className="mt-3 text-3xl font-semibold text-emerald-600">
              {activeUsers}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Currently enabled
            </p>
          </div>

          <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Project officers
            </p>

            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {projectOfficers}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Monitoring personnel
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Administrators
            </p>

            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {administrators}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Platform administrators
            </p>
          </div>

        </div>

        {/* USER DIRECTORY */}
        <div className="mt-7 w-full min-w-0 border border-slate-200 bg-white">

          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                  Access directory
                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                  Platform Users
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  User accounts and assigned platform roles
                </p>
              </div>

              {/* SEARCH + FILTER */}
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row">

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-900 sm:w-56"
                />

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none focus:border-slate-900 sm:w-48"
                >
                  {roles.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

              </div>

            </div>
          </div>

          {/* USERS */}
          <div className="divide-y divide-slate-100">

            {filteredUsers.map((user) => (

              <div
                key={user.id}
                className="min-w-0 px-5 py-5 transition hover:bg-slate-50 sm:px-6"
              >

                <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  {/* USER */}
                  <div className="flex min-w-0 items-start gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                      {user.name
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div className="min-w-0">

                      <div className="flex min-w-0 flex-wrap items-center gap-3">

                        <h3 className="break-words text-sm font-semibold text-slate-900">
                          {user.name}
                        </h3>

                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider ${
                            user.status === "Active"
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          {user.status}
                        </span>

                      </div>

                      <p className="mt-1 break-all text-xs text-slate-500">
                        {user.email}
                      </p>

                      <p className="mt-1 break-words text-[10px] text-slate-400">
                        {user.department}
                      </p>

                    </div>
                  </div>

                  {/* USER META */}
                  <div className="grid grid-cols-2 gap-5 border-t border-slate-100 pt-4 sm:grid-cols-3 lg:min-w-[420px] lg:border-t-0 lg:pt-0">

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">
                        Role
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-800">
                        {user.role}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">
                        Last active
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {user.lastActive}
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <button
                        type="button"
                        className="w-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-950 sm:w-auto"
                      >
                        Manage →
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No users found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try changing your search or role filter.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* ACCESS MODEL */}
        <div className="mt-6 border border-slate-200 bg-white">

          <div className="border-b border-slate-200 px-6 py-5">

            <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
              Access model
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              Role-based access
            </h2>

          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

            <div className="p-6">
              <p className="text-sm font-semibold text-slate-900">
                Administrator
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Manage users, system configuration and platform-wide
                monitoring access.
              </p>
            </div>

            <div className="p-6">
              <p className="text-sm font-semibold text-slate-900">
                Ministry Official
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Review portfolio performance, project risks, expenditure
                and analytical reports.
              </p>
            </div>

            <div className="p-6">
              <p className="text-sm font-semibold text-slate-900">
                Project Officer
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Monitor assigned projects, milestones, implementation
                progress and alerts.
              </p>
            </div>

          </div>
        </div>

        {/* FOOTNOTE */}
        <div className="mt-5 flex min-w-0 flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <p>
            Prototype user management interface.
          </p>

          <p>
            Authentication & RBAC · Backend integration pending
          </p>

        </div>

      </div>
    </main>
  );
}