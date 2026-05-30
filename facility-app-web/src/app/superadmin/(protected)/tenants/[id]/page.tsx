"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import IconifyIcon from "components/base/IconifyIcon";
import TenantHealthIndicators from "components/sections/superadmin/TenantHealthIndicators";
import {
  useListTenants,
  useToggleTenant,
  useUpdateTenantPlan,
} from "services/swr/api-hooks/useSuperAdminApi";

// Placeholder section shown for features not yet implemented
const ScaffoldSection = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <Card variant="outlined">
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" sx={{ gap: 2, alignItems: "flex-start" }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: "action.hover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconifyIcon icon={icon} sx={{ fontSize: 22, color: "primary.main" }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" sx={{ gap: 1, alignItems: "center", mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Chip
              label="Coming soon"
              size="small"
              variant="outlined"
              sx={{ height: 18, fontSize: "0.65rem" }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: tenants, isLoading, mutate } = useListTenants();
  const tenant = tenants?.find((t) => t.id === id);

  const { trigger: toggle, isMutating: toggling } = useToggleTenant(id);
  const { trigger: updatePlan, isMutating: updatingPlan } = useUpdateTenantPlan(id);

  const handleToggle = async () => {
    await toggle();
    await mutate();
  };

  const handlePlanChange = async (plan: number) => {
    await updatePlan({ plan });
    await mutate();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back */}
      <Button
        size="small"
        startIcon={<IconifyIcon icon="material-symbols:arrow-back-rounded" sx={{ fontSize: 18 }} />}
        onClick={() => router.push("/superadmin/tenants")}
        sx={{ mb: 3, color: "text.secondary" }}
      >
        All Facilities
      </Button>

      {isLoading || !tenant ? (
        <Stack sx={{ gap: 2 }}>
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={80} />
          <Skeleton variant="rounded" height={80} />
        </Stack>
      ) : (
        <Stack sx={{ gap: 3 }}>
          {/* Tenant info card */}
          <Card variant="outlined">
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                sx={{ gap: 3, justifyContent: "space-between", alignItems: { sm: "flex-start" } }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" sx={{ gap: 1.5, alignItems: "center", mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {tenant.name}
                    </Typography>
                    <Chip
                      label={tenant.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={tenant.isActive ? "success" : "default"}
                      variant="outlined"
                    />
                    <Chip
                      label={tenant.plan === 1 ? "Professional" : "Starter"}
                      size="small"
                      color={tenant.plan === 1 ? "warning" : "default"}
                      variant="outlined"
                    />
                  </Stack>
                  <Grid container spacing={2} sx={{ mt: 0 }}>
                    {[
                      { label: "Org code",    value: `/${tenant.slug}` },
                      { label: "Contact",     value: tenant.contactEmail ?? "—" },
                      { label: "Phone",       value: tenant.contactPhone ?? "—" },
                      { label: "Website",     value: tenant.website ?? "—" },
                      { label: "Address",     value: tenant.address ?? "—" },
                      { label: "Custom domain", value: tenant.customDomain ?? "—" },
                      { label: "Created",     value: dayjs(tenant.createdAt).format("DD MMM YYYY") },
                    ].map(({ label, value }) => (
                      <Grid key={label} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: "break-all" }}>
                          {value}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

                {/* Quick actions */}
                <Stack sx={{ gap: 1.5, minWidth: 160 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Quick actions
                  </Typography>
                  <Select
                    size="small"
                    value={tenant.plan}
                    disabled={updatingPlan}
                    onChange={(e) => handlePlanChange(Number(e.target.value))}
                    fullWidth
                  >
                    <MenuItem value={0}>Starter</MenuItem>
                    <MenuItem value={1}>Professional</MenuItem>
                  </Select>
                  <Button
                    size="small"
                    variant="outlined"
                    color={tenant.isActive ? "error" : "success"}
                    disabled={toggling}
                    onClick={handleToggle}
                    startIcon={
                      <IconifyIcon
                        icon={tenant.isActive ? "material-symbols:block-rounded" : "material-symbols:check-circle-outline-rounded"}
                        sx={{ fontSize: 16 }}
                      />
                    }
                  >
                    {tenant.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="neutral"
                    component="a"
                    href={`/${tenant.slug}/login`}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<IconifyIcon icon="material-symbols:open-in-new-rounded" sx={{ fontSize: 16 }} />}
                  >
                    Open Portal
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Health Indicators */}
          <TenantHealthIndicators tenantId={id} />
          <ScaffoldSection
            icon="material-symbols:group-outline-rounded"
            title="Users"
            description="All staff and resident accounts for this facility — roles, last active date, ability to suspend or reset passwords."
          />
          <ScaffoldSection
            icon="material-symbols:edit-outline-rounded"
            title="Settings Override"
            description="Reset primary colour, clear custom domain, update contact details, and correct branding without logging in as the tenant Admin."
          />
          <ScaffoldSection
            icon="material-symbols:supervisor-account-outline-rounded"
            title="Impersonation"
            description="Access this facility's staff dashboard as a read-only observer to assist with support requests — all actions are audit-logged."
          />
          <ScaffoldSection
            icon="material-symbols:receipt-long-outline-rounded"
            title="Tenant Audit Trail"
            description="All activity within this facility — user logins, visitor logs, setting changes — filterable and exportable."
          />
        </Stack>
      )}
    </Container>
  );
}
