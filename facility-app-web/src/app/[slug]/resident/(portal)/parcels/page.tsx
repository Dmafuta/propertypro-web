"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import ComingSoon from "components/common/ComingSoon";
import IconifyIcon from "components/base/IconifyIcon";
import { useResidentParcels, type ParcelStatus } from "services/swr/api-hooks/useResidentApi";

const TABS: { label: string; value: ParcelStatus | undefined }[] = [
  { label: "Pending",    value: "Pending"   },
  { label: "Collected",  value: "Collected" },
  { label: "Returned",   value: "Returned"  },
  { label: "All",        value: undefined   },
];

const statusColor: Record<ParcelStatus, "warning" | "success" | "default"> = {
  Pending:   "warning",
  Collected: "success",
  Returned:  "default",
};

export default function ParcelsPage() {
  const [tab, setTab] = useState(0);
  const { data: parcels, isLoading, error, mutate } = useResidentParcels(TABS[tab].value);
  if (error) return <ComingSoon onRetry={mutate} />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" sx={{ gap: 1, mb: 3 }}>
        <IconifyIcon icon="material-symbols:package-2-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
        <Typography variant="h5" fontWeight={700}>My Parcels</Typography>
      </Stack>

      <Card variant="outlined">
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          {TABS.map((t) => <Tab key={t.label} label={t.label} />)}
        </Tabs>

        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" height={64} sx={{ mb: 1, borderRadius: 1 }} />)}
          </Box>
        ) : !parcels?.length ? (
          <Stack alignItems="center" sx={{ py: 6, gap: 1 }}>
            <IconifyIcon icon="material-symbols:package-2-outline-rounded" sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography variant="body2" color="text.disabled">No parcels found.</Typography>
          </Stack>
        ) : (
          parcels.map((parcel, i) => (
            <Box key={parcel.id}>
              {i > 0 && <Divider />}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{parcel.description}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {parcel.courier ? `${parcel.courier} · ` : ""}
                    Received {dayjs(parcel.receivedAt).format("DD MMM YYYY")}
                  </Typography>
                  {parcel.collectedBy && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Collected by {parcel.collectedBy}
                      {parcel.collectedAt ? ` on ${dayjs(parcel.collectedAt).format("DD MMM YYYY")}` : ""}
                    </Typography>
                  )}
                </Box>
                <Chip label={parcel.status} size="small" color={statusColor[parcel.status]} variant="soft" />
              </Stack>
            </Box>
          ))
        )}
      </Card>
    </Container>
  );
}
