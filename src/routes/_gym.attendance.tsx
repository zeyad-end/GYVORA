import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, saveState, type Member } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRScanner } from "@/components/QRScanner";
import { DataTable, PageHeader, Panel, td } from "@/components/kit";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { useServerFn } from "@tanstack/react-start";
import { lookupClient } from "@/lib/cloud.functions";
import { useCloud } from "@/components/CloudProvider";
import { getDemoSession, demoUserId, demoMemberId } from "@/lib/demo";
import { recordClientVisit } from "@/lib/client-attendance";
export const Route = createFileRoute("/_gym/attendance")({
  head: () => seo("Attendance", "Record real member visits with manual and QR check-in."),
  component: Attendance,
});
function Attendance() {
  const c = useCloud();
  const lookup = useServerFn(lookupClient);
  const members = useStore((s) => s.members);
  const list = useStore((s) => s.attendance);
  const [q, setQ] = useState("");
  const [scan, setScan] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  async function check(m: Member, method: "QR" | "Manual") {
    if (new Date(m.expiry + "T23:59:59").getTime() < Date.now()) {
      toast.error("Membership has expired");
      return false;
    }
    try {
      await saveState((s) => ({ attendance: recordClientVisit(s.attendance, m, method) }));
      setQ("");
      toast.success("Check-in recorded");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not record check-in");
      return false;
    }
  }
  return (
    <>
      <PageHeader
        title="Attendance"
        actions={<Button onClick={() => setScan(true)}>Scan member QR</Button>}
      />
      <Panel title="Manual check-in">
        <Input
          maxLength={100}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search member"
        />
        {q && (
          <ul className="mt-4 space-y-2">
            {members
              .filter((m) => m.name.toLowerCase().includes(q.toLowerCase()))
              .slice(0, 8)
              .map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-4">
                  <span>
                    {m.name} · {m.plan}
                  </span>
                  <Button size="sm" onClick={() => check(m, "Manual")}>
                    Check in
                  </Button>
                </li>
              ))}
          </ul>
        )}
      </Panel>
      <Panel title="Today's attendance" className="mt-6">
        <DataTable head={["Member", "Date", "Time", "Method"]}>
          {list
            .filter((x) => x.date === today)
            .map((x) => (
              <tr key={x.id}>
                <td className={td}>{x.name}</td>
                <td className={td}>{x.date}</td>
                <td className={td}>{x.time}</td>
                <td className={td}>{x.method}</td>
              </tr>
            ))}
        </DataTable>
        {!list.some((x) => x.date === today) && (
          <p className="py-6 text-sm text-muted-foreground">No check-ins today.</p>
        )}
      </Panel>
      <QRScanner
        open={scan}
        onClose={() => setScan(false)}
        onScan={async (value) => {
          const id = value.replace(/^ironhaus:member:/, "");
          let m = members.find((x) => x.id === id || x.memberQrId === id);
          if (!m && getDemoSession())
            m = members.find((x) => demoMemberId(x.clientId ?? demoUserId(x.email)) === id);
          if (!m && !getDemoSession()) {
            try {
              const profile = await lookup({ data: { gymId: c.gymId, memberId: id } });
              m = members.find((x) => x.clientId === profile.id);
            } catch {
              /* no authorized match */
            }
          }
          if (!m) {
            toast.error("Member QR is not linked to this gym.");
            return false;
          }
          return await check(m, "QR");
        }}
      />
    </>
  );
}
