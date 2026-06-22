import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { prisma } from "@/lib/database"

export default async function PlatformUsersRolesPage() {
  const [platformMembers, tenantMembers, superAdmins] = await Promise.all([
    prisma.soromaPlatformMembership.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.soromaTenantMembership.count(),
    prisma.soromaPlatformMembership.count({ where: { role: "PLATFORM_SUPER_ADMIN" } }),
  ])

  return (
    <SoromaModuleDashboard
      title="Users & Roles"
      moduleTag="P-11 · Identity & Access Governance"
      description="Manage platform user roles, tenant access assignments, and privileged account visibility."
      showScopeBanner={false}
      kpis={[
        { title: "Platform Members", value: String(platformMembers.length), severity: "info" },
        { title: "Tenant Memberships", value: String(tenantMembers), severity: "success" },
        {
          title: "Inactive Platform Members",
          value: String(platformMembers.filter((member) => !member.isActive).length),
          severity: "warning",
        },
        { title: "Super Admins", value: String(superAdmins), severity: "critical" },
      ]}
      tableTitle="Platform Role Assignments"
      columns={[
        { key: "name", header: "User" },
        { key: "email", header: "Email" },
        { key: "role", header: "Role" },
        { key: "isActive", header: "Status", status: true },
        { key: "updatedAt", header: "Updated" },
      ]}
      rows={platformMembers.map((member) => ({
        id: member.id,
        name: member.user.name ?? "—",
        email: member.user.email ?? "—",
        role: member.role,
        isActive: member.isActive ? "ACTIVE" : "INACTIVE",
        updatedAt: member.updatedAt.toISOString().slice(0, 19).replace("T", " "),
      }))}
      quickActions={[
        { label: "Audit Logs", href: "/soroma/platform/audit", variant: "tile" },
        { label: "Tenant Management", href: "/soroma/platform/tenants", variant: "tile" },
      ]}
      emptyMessage="No platform role assignments found."
    />
  )
}
