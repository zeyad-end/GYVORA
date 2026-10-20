import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { ExerciseImage } from "./ProgramEditor";
import cover from "@/assets/gym-cover.jpg";
import type { ClientGym } from "@/lib/client-portal";
import type { ReactNode } from "react";
export function ClientGymCard({ gym, actions }: { gym: ClientGym; actions?: ReactNode }) {
  return (
    <article className="overflow-hidden rounded-lg border bg-card">
      <div className="aspect-[3/1] overflow-hidden">
        {gym.image ? (
          <ExerciseImage path={gym.image} className="h-full w-full object-cover" />
        ) : (
          <img src={cover} alt={gym.name} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="space-y-3 p-4">
        <Link to="/member/gym/$id" params={{ id: gym.id }} className="text-lg font-semibold">
          {gym.name}
        </Link>
        <p className="flex gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          {gym.location || "Location not provided"}
        </p>
        {actions}
      </div>
    </article>
  );
}
