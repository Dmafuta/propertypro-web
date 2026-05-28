"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
import { useResidentVisits, type VisitStatus } from "services/swr/api-hooks/useResidentApi";

const TABS: { label: string; value: VisitStatus | undefined }[] = [
  { label: "Upcoming",  value: "Scheduled"  },
  { label: "Active",    value: "Active"     },
  { label: "History",   value: "Completed"  },
  { label: "All",       value: undefined    },
];

const statusColor: Record<string, "default" | "primary" | "warning" | "error" | "success"> = {
  Scheduled:  "primary",
  Active:     "success",
  Completed:  "default",
  Cancelled:  "error",
  NoShow:     "warning",
};

export default function VisitsPage() {
  const [tab, setTab] = useState(0);
  const { data: visits, isLoading, error, mutate } = useResidentVisits(TABS[tab].value);
  if (error) return <ComingSoon onRetry={mutate} />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" sx={{ gap: 1, mb: 3, alignItems: "center" }}>
        <IconifyIcon icon="material-symbols:calendar-month-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>My Visits</Typography>
      </Stack>

      <Card variant="outlined">
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          {TABS.map((t) => (
            <Tab key={t.label} label={t.label} />
          ))}
        </Tabs>

        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" height={56} sx={{ mb: 1, borderRadius: 1 }} />
            ))}
          </Box>
        ) : !visits?.length ? (
          <Stack sx={{ py: 6, gap: 1, alignItems: "center" }}>
            <IconifyIcon icon="material-symbols:event-busy-outline-rounded" sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography variant="body2" color="text.disabled">No visits found.</Typography>
          </Stack>
        ) : (
          <Box>
            {visits.map((visit, i) => (
              <Box key={visit.id}>
                {i > 0 && <Divider />}
                <Stack direction="row" sx={{ px: 2.5, py: 2, justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{visit.visitorName}</Typography>
                    <Typography variant="caption" color="text.secondary">{visit.purpose}</Typography>
                    {visit.visitorPhone && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        · {visit.visitorPhone}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(visit.scheduledAt).format("DD MMM YYYY")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {dayjs(visit.scheduledAt).format("h:mm A")}
                      </Typography>
                    </Box>
                    <Chip
                      label={visit.status}
                      size="small"
                      color={statusColor[visit.status] ?? "default"}
                      variant="soft"
                    />
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Box>
        )}
      </Card>
    </Container>
  );
}
