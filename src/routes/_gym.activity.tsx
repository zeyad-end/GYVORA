import { createFileRoute } from "@tanstack/react-router";
import { DataTable, PageHeader, Panel, td } from "@/components/kit";
import { activity } from "@/lib/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/activity")({
  head: () => seo("Activity logs", "A full audit trail of actions taken by your staff."),
  component: () => (
    <>
      <PageHeader title="Activity logs" subtitle="Every action, by every user" />
      <Panel>
        <DataTable head={["User", "Action", "Date", "Time"]}>
          {activity.map((a, i) => <tr key={i}><td className={`${td} font-medium`}>{a.user}</td><td className={td}>{a.action}</td><td className={`${td} text-muted-foreground`}>{a.date}</td><td className={`${td} text-muted-foreground`}>{a.time}</td></tr>)}
        </DataTable>
      </Panel>
    </>
  ),
});
