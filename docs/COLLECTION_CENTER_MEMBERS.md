# Collection Center (MCC) Members – Definition & Implementation

## What the project already has

From the codebase and schema, a **Collection Center (MCC)** is a physical site where milk/commodities are collected. The following “members” or related people already exist in the model:

| Concept | Where it lives | Description |
|--------|----------------|-------------|
| **Manager** | `mccs.managerUserId` → `User` | One user who runs the center (MCC_MANAGER). |
| **Staff** | `staff` table (`mccId`, `userId`, `position`, `employmentType`, etc.) | Workforce at the center (weighing, quality, admin). Can be linked to a `User` or be a standalone record. |
| **Farmers** | `farmers` table (`mccId`) | Supplying members who deliver to this center. |
| **Users linked to MCC** | `User.mccId` | Any user whose default MCC is this center (e.g. manager, or other roles assigned to this MCC). |
| **Agents (Umucunda)** | `User` with role AGENT / FIELD_AGENT | Used on collections as “who collected”. Currently listed globally; not yet scoped per MCC. |

So today, “members” of a collection center can be thought of as:

1. **Manager** – runs the center.  
2. **Staff** – people who work at the center (schema supports them; no MCC UI yet).  
3. **Farmers** – supplying members (already in MCC dashboard under Farmers).  
4. **Agents** – field/collection agents. Conceptually they can “belong” to a center; the model does not yet tie them to a specific MCC.

---

## What “Collection Center members” can mean (recommended)

A practical definition that matches the schema and product direction:

- **Manager** – The single MCC manager (already in place).  
- **Staff** – People employed at the center (weighing, quality, office, etc.), stored in `staff` and optionally linked to `User`.  
- **Farmers** – Supplying members; keep as today (Farmers tab), optionally grouped under a “Members” view later.  
- **Assigned agents** (optional) – Field agents who primarily work for this center; requires a clear assignment (e.g. `User.mccId` for agents or a join table).

So “Collection Center members” in the product sense = **Manager + Staff + (optionally) Assigned agents**, with **Farmers** as supplying members (same data, different lens).

---

## How to achieve it

### 1. **Members / Staff tab in the MCC dashboard** (main deliverable)

- **Goal:** One place where the manager sees “who belongs to this center” (manager + staff, and optionally agents).  
- **Backend:**  
  - Add **GET /api/v1/mcc/staff** – list `staff` where `mccId = current user’s MCC`.  
  - Add **POST /api/v1/mcc/staff** – create staff for this MCC (position, employmentType, optional link to existing User by email/phone).  
  - Add **PUT /api/v1/mcc/staff/[id]** and **DELETE /api/v1/mcc/staff/[id]** – update / remove staff (with permission checks).  
- **Frontend:**  
  - Add a **“Members”** (or **“Staff & members”**) tab to the MCC dashboard (next to Sales, Customers, Suppliers, Ikofi, Warehouses).  
  - **Members** page shows:  
    - **Manager** – read-only card (name, contact from `mcc.manager`).  
    - **Staff** – list + “Add staff” (form: name, position, employment type, optional link to user, start/end date, etc.).  
  - Reuse existing permissions: `mcc.staff.view`, `mcc.staff.create`, `mcc.staff.edit`, `mcc.staff.manage`.

This gives a clear “Collection Center members” experience without changing the high-level meaning of farmers (they stay “supplying members” in the Farmers tab).

### 2. **Optional: Agents as members of a center**

- **Goal:** In “Members”, show which agents (Umucunda) are assigned to this center.  
- **Options:**  
  - **A.** Use **User.mccId** for agents: when an agent is assigned to an MCC, set `mccId`; then “Members” can list users with role AGENT/FIELD_AGENT and `mccId = current MCC`.  
  - **B.** Add an **agent_mcc_assignments** (or similar) table: `agentId`, `mccId`, `assignedAt`, so one agent can serve multiple MCCs if needed.  
- **APIs:**  
  - **GET /api/v1/mcc/agents** – already exists; extend or add a variant that filters by current user’s `mccId` when you introduce assignment.  
  - Optional **POST /api/v1/mcc/agents/assign** (or PATCH user’s mccId) to assign an agent to this MCC.  
- **UI:** In the same “Members” tab, a section “Assigned agents” listing those agents, with “Assign agent” if you add assignment.

### 3. **Optional: “Supplying members” (farmers) in one view**

- **Goal:** One screen that groups “everyone related to this center”.  
- **Implementation:** In the same “Members” tab, add a section “Supplying members (farmers)” – either a short summary (count + link to Farmers tab) or a compact list (name, code, last delivery). No new API required; use existing farmers API filtered by `mccId`.

---

## Suggested order of work

1. **API: MCC staff CRUD** – GET/POST/PUT/DELETE for `staff` scoped to the current MCC.  
2. **MCC dashboard: “Members” tab** – Manager card + Staff list and “Add staff” form.  
3. **(Optional)** Agent–MCC assignment (model + API + “Assigned agents” in Members).  
4. **(Optional)** “Supplying members” summary or list in the same Members view.

If you tell me which of these you want first (e.g. “only staff API + Members tab” or “also agent assignment”), I can outline exact API request/response shapes and the React components to add or change.
