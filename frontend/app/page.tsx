
"use client";

import { useEffect, useMemo, useState } from "react";
type Ticket = {
  id: string;
  title: string;
  customer: string;
  customerEmail: string;
  description: string;
  category: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  assignee: string;
  time: string;
};

type ApiTicket = {
  _id: string;
  subject: string;
  description: string;
  customerName: string;
  customerEmail: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Resolved";
  assignedTo?: string;
  createdAt: string;
};


const navItems = [
  { label: "Overview", icon: "◫" },
  { label: "All tickets", icon: "▤" },
  { label: "My tickets", icon: "♙" },
  { label: "Customers", icon: "♧" },
  { label: "AI insights", icon: "✳" },
];

const priorityStyle: Record<Ticket["priority"], string> = {
  Urgent: "bg-red-500/10 text-red-400 ring-red-500/20",
  High: "bg-orange-500/10 text-orange-400 ring-orange-500/20",
  Medium: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  Low: "bg-slate-500/10 text-slate-300 ring-slate-500/20",
};

const statusStyle: Record<Ticket["status"], string> = {
  Open: "bg-blue-500/10 text-blue-400",
  "In Progress": "bg-violet-500/10 text-violet-300",
  Resolved: "bg-emerald-500/10 text-emerald-400",
};

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
const [loading, setLoading] = useState(true);
const [apiError, setApiError] = useState("");
const [newCustomerEmail, setNewCustomerEmail] = useState("");
const [newDescription, setNewDescription] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [activeNav, setActiveNav] = useState("Overview");
  const [newTitle, setNewTitle] = useState("");
  const [newCustomer, setNewCustomer] = useState("");
  const [newCategory, setNewCategory] = useState("Technical");
  const [newPriority, setNewPriority] =
    useState<Ticket["priority"]>("Medium");

const API_URL =
  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tickets`;
useEffect(() => {
  async function loadTickets() {
    try {
      setLoading(true);
      setApiError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load tickets from the backend.");
      }

      const data: ApiTicket[] = await response.json();

      const mappedTickets: Ticket[] = data.map((item) => ({
        id: item._id,
        title: item.subject,
        customer: item.customerName || "Existing customer",
        customerEmail: item.customerEmail || "",
        description: item.description,
        category:
          item.category.charAt(0).toUpperCase() +
          item.category.slice(1),
        priority:
          item.priority.charAt(0).toUpperCase() +
          item.priority.slice(1).toLowerCase() as Ticket["priority"],
        status: item.status,
        assignee: item.assignedTo || "Unassigned",
        time: new Date(item.createdAt).toLocaleString(),
      }));

      setTickets(mappedTickets);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading tickets."
      );
    } finally {
      setLoading(false);
    }
  }

  loadTickets();
}, []);

  const counts = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "Open").length,
      progress: tickets.filter((t) => t.status === "In Progress").length,
      resolved: tickets.filter((t) => t.status === "Resolved").length,
      urgent: tickets.filter(
        (t) => t.priority === "Urgent" && t.status !== "Resolved"
      ).length,
    }),
    [tickets]
  );

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      `${ticket.id} ${ticket.title} ${ticket.customer} ${ticket.category}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      ticket.status === filter ||
      (filter === "Urgent" &&
        ticket.priority === "Urgent" &&
        ticket.status !== "Resolved");

    const matchesNav =
      activeNav !== "My tickets" || ticket.assignee === "Dhruv Thakur";

    return matchesSearch && matchesFilter && matchesNav;
  });

  
  async function createTicket(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setApiError("");
    setNotice("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newTitle.trim(),
          description: newDescription.trim(),
          customerName: newCustomer.trim(),
          customerEmail: newCustomerEmail.trim(),
          category: newCategory,
          priority: newPriority,
          status: "Open",
          assignedTo: "Unassigned",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create ticket.");
      }

      const saved: ApiTicket = data;

      const ticket: Ticket = {
        id: saved._id,
        title: saved.subject,
        description: saved.description,
        customer: saved.customerName || "Existing customer",
        customerEmail: saved.customerEmail || "",
        category: saved.category,
        priority: saved.priority,
        status: saved.status,
        assignee: saved.assignedTo || "Unassigned",
        time: new Date(saved.createdAt).toLocaleString(),
      };

      setTickets((previous) => [ticket, ...previous]);
      setNewTitle("");
      setNewCustomer("");
      setNewCustomerEmail("");
      setNewDescription("");
      setNewCategory("Technical");
      setNewPriority("Medium");
      setFilter("All");
      setActiveNav("All tickets");
      setShowForm(false);
      setNotice("Ticket saved to MongoDB successfully.");
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to create ticket."
      );
    }
  }

  async function changeStatus(
    id: string,
    status: Ticket["status"]
  ) {
    setApiError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update ticket.");
      }

      setTickets((previous) =>
        previous.map((ticket) =>
          ticket.id === id ? { ...ticket, status: data.status } : ticket
        )
      );

      setNotice(`Ticket updated to ${data.status}.`);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to update ticket."
      );
    }
  }


  return (
    <main className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/[0.07] bg-[#0e1425] p-5 lg:flex lg:flex-col">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-xl font-bold">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Supportly</h1>
              <p className="text-xs text-slate-500">AI Support Platform</p>
            </div>
          </div>

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setActiveNav(item.label);
                  setFilter("All");
                  setNotice(
                    item.label === "AI insights"
                      ? "AI insights preview: automated classification will be connected in a later step."
                      : ""
                  );
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                  activeNav === item.label
                    ? "bg-violet-500/15 font-medium text-violet-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="w-5 text-center text-lg">{item.icon}</span>
                {item.label}
                {item.label === "All tickets" && (
                  <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-xs">
                    {counts.total}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-violet-400/15 bg-violet-500/[0.07] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span className="text-violet-300">✳</span> AI assistant
            </div>
            <p className="mb-4 text-xs leading-5 text-slate-400">
              Smart ticket classification and routing are coming next.
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 rounded-full bg-violet-400" />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">
              Phase 1 of development
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-white/[0.07] pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-blue-500 text-sm font-bold">
              DT
            </div>
            <div>
              <p className="text-sm font-medium">Dhruv Thakur</p>
              <p className="text-xs text-slate-500">Project Admin</p>
            </div>
            <span className="ml-auto text-slate-500">···</span>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-lg text-violet-300 lg:hidden">
                S
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  Workspace / {activeNav}
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  {activeNav === "Overview"
                    ? "Dashboard overview"
                    : activeNav}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-slate-500 sm:block">
                ● System operational
              </span>
              <button
                onClick={() => setShowForm(true)}
                className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-400"
              >
                + New ticket
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm text-violet-300">
                  SATURDAY, OCTOBER 17
                </p>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Welcome back, Dhruv <span>✦</span>
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Here&apos;s what&apos;s happening with your support team today.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <p className="text-xs text-slate-500">Team response rate</p>
                <p className="mt-1 text-xl font-bold">94.8%</p>
              </div>
            </div>

            {notice && (
              <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-200">
                <span>{notice}</span>
                <button
                  onClick={() => setNotice("")}
                  className="text-violet-300 hover:text-white"
                  aria-label="Dismiss notification"
                >
                  ✕
                </button>
              </div>
            )}

            {activeNav === "AI insights" ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#11182a] p-8">
                <p className="text-3xl">✳</p>
                <h3 className="mt-4 text-xl font-bold">AI insights</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  The dashboard UI is ready for AI integration. Next, we will
                  build a Python service that predicts ticket categories and
                  suggests priorities using ticket descriptions.
                </p>
                <button
                  onClick={() =>
                    setNotice(
                      "AI classification is not connected yet. We will build the Python service next."
                    )
                  }
                  className="mt-5 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold hover:bg-violet-400"
                >
                  Preview AI integration
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: "Total tickets",
                      value: counts.total,
                      note: "Across all categories",
                      icon: "▤",
                      color: "text-blue-300",
                      glow: "bg-blue-500/10",
                    },
                    {
                      label: "Open tickets",
                      value: counts.open,
                      note: "Awaiting a response",
                      icon: "◷",
                      color: "text-amber-300",
                      glow: "bg-amber-500/10",
                    },
                    {
                      label: "In progress",
                      value: counts.progress,
                      note: "Currently being handled",
                      icon: "↗",
                      color: "text-violet-300",
                      glow: "bg-violet-500/10",
                    },
                    {
                      label: "Resolved",
                      value: counts.resolved,
                      note: "Successfully completed",
                      icon: "✓",
                      color: "text-emerald-300",
                      glow: "bg-emerald-500/10",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/[0.07] bg-[#11182a] p-5 transition hover:border-white/15"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">{stat.label}</p>
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.glow} ${stat.color} text-xl`}
                        >
                          {stat.icon}
                        </div>
                      </div>
                      <p className="mt-5 text-3xl font-bold">{stat.value}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {stat.note}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-3">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#11182a] p-5 xl:col-span-2">
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">Ticket activity</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Current ticket status breakdown
                        </p>
                      </div>
                      <span className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-400">
                        Live preview
                      </span>
                    </div>

                    <div className="mb-5 flex h-4 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="bg-blue-400 transition-all"
                        style={{
                          width: `${
                            counts.total
                              ? (counts.open / counts.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                      <div
                        className="bg-violet-400 transition-all"
                        style={{
                          width: `${
                            counts.total
                              ? (counts.progress / counts.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                      <div
                        className="bg-emerald-400 transition-all"
                        style={{
                          width: `${
                            counts.total
                              ? (counts.resolved / counts.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          label: "Open",
                          value: counts.open,
                          color: "bg-blue-400",
                        },
                        {
                          label: "In progress",
                          value: counts.progress,
                          color: "bg-violet-400",
                        },
                        {
                          label: "Resolved",
                          value: counts.resolved,
                          color: "bg-emerald-400",
                        },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl bg-white/[0.025] p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${item.color}`} />
                            <span className="text-xs text-slate-400">{item.label}</span>
                          </div>
                          <p className="text-xl font-semibold">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-[#11182a] p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="font-semibold">Priority overview</h3>
                      <span className="text-lg text-orange-300">⚑</span>
                    </div>
                    {(["Urgent", "High", "Medium", "Low"] as const).map(
                      (priority) => {
                        const count = tickets.filter(
                          (t) =>
                            t.priority === priority && t.status !== "Resolved"
                        ).length;
                        const totalOpen = Math.max(
                          1,
                          tickets.filter((t) => t.status !== "Resolved").length
                        );
                        return (
                          <div key={priority} className="mb-4 last:mb-0">
                            <div className="mb-2 flex justify-between text-xs">
                              <span className="text-slate-400">{priority}</span>
                              <span>{count}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                              <div
                                className={`h-full rounded-full ${
                                  priority === "Urgent"
                                    ? "bg-red-400"
                                    : priority === "High"
                                      ? "bg-orange-400"
                                      : priority === "Medium"
                                        ? "bg-amber-300"
                                        : "bg-slate-400"
                                }`}
                                style={{
                                  width: `${(count / totalOpen) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                    <p className="mt-5 border-t border-white/[0.07] pt-4 text-xs text-slate-500">
                      {counts.urgent} urgent ticket(s) need attention.
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#11182a]">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] p-5">
                    <div>
                      <h3 className="font-semibold">Recent tickets</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Manage and track customer requests
                      </p>
                    </div>
                    <button
                      onClick={() => setShowForm(true)}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5"
                    >
                      + Create ticket
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-sm">
                      <span className="absolute left-3 top-2.5 text-slate-500">
                        ⌕
                      </span>
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tickets or customers..."
                        className="w-full rounded-xl border border-white/10 bg-[#0b1020] py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-600 focus:border-violet-400/60"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {["All", "Open", "In Progress", "Resolved", "Urgent"].map(
                        (item) => (
                          <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`rounded-lg px-3 py-2 text-xs transition ${
                              filter === item
                                ? "bg-violet-500 text-white"
                                : "border border-white/10 text-slate-400 hover:bg-white/5"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-sm">
                      <thead className="bg-white/[0.025] text-xs text-slate-500">
                        <tr>
                          <th className="px-5 py-3 font-medium">Ticket</th>
                          <th className="px-4 py-3 font-medium">Customer</th>
                          <th className="px-4 py-3 font-medium">Priority</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Assignee</th>
                          <th className="px-4 py-3 font-medium">Updated</th>
                          <th className="px-4 py-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {filteredTickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            className="transition hover:bg-white/[0.025]"
                          >
                            <td className="px-5 py-4">
                              <p className="font-medium">{ticket.title}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {ticket.id} · {ticket.category}
                              </p>
                            </td>
                            <td className="px-4 py-4 text-slate-300">
                              {ticket.customer}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`rounded-md px-2.5 py-1 text-xs ring-1 ring-inset ${priorityStyle[ticket.priority]}`}
                              >
                                {ticket.priority}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`rounded-md px-2.5 py-1 text-xs ${statusStyle[ticket.status]}`}
                              >
                                {ticket.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-400">
                              {ticket.assignee}
                            </td>
                            <td className="px-4 py-4 text-xs text-slate-500">
                              {ticket.time}
                            </td>
                            <td className="px-4 py-4">
                              <select
                                aria-label={`Change status for ${ticket.id}`}
                                value={ticket.status}
                                onChange={(e) =>
                                  changeStatus(
                                    ticket.id,
                                    e.target.value as Ticket["status"]
                                  )
                                }
                                className="max-w-32 rounded-lg border border-white/10 bg-[#0b1020] px-2 py-2 text-xs outline-none focus:border-violet-400/60"
                              >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                        {filteredTickets.length === 0 && (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-5 py-12 text-center text-sm text-slate-500"
                            >
                              No tickets match your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-white/[0.07] px-5 py-4 text-xs text-slate-500">
                    Showing {filteredTickets.length} of {tickets.length} tickets
                  </div>
                </div>
              </>
            )}

            <footer className="mt-8 flex flex-wrap justify-between gap-2 text-xs text-slate-600">
              <p>Supportly · AI Customer Support Platform</p>
              <p>Dashboard preview · Demo data only</p>
            </footer>
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#11182a] p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Create a support ticket</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Add a customer request to the demo dashboard.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={createTicket} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Ticket title
                </label>
                <input
                  required
                  maxLength={120}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Describe the customer's issue"
                  className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 py-3 text-sm outline-none focus:border-violet-400/60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Customer name
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 py-3 text-sm outline-none focus:border-violet-400/60"
                />
              </div>

              <div>
  <label className="mb-2 block text-sm text-slate-300">
    Customer email
  </label>

  <input
    type="email"
    required
    value={newCustomerEmail}
    onChange={(e) => setNewCustomerEmail(e.target.value)}
    placeholder="rahul.test@example.com"
    className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 py-3 text-sm outline-none focus:border-violet-400/60"
  />
</div>

<div>
    <label className="mb-2 block text-sm text-slate-300">
      Issue description
    </label>
    <textarea
      required
      value={newDescription}
      onChange={(e) => setNewDescription(e.target.value)}
      placeholder="Explain the customer's issue..."
      rows={3}
      className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 py-3 text-sm outline-none focus:border-violet-400/60"
    />
  </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 py-3 text-sm outline-none focus:border-violet-400/60"
                  >
                    <option>Technical</option>
                    <option>Billing</option>
                    <option>Account</option>
                    <option>General</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as Ticket["priority"])
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 py-3 text-sm outline-none focus:border-violet-400/60"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/[0.07] pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-400"
                >
                  Create ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
