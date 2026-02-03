import Link from "next/link";
import { Button } from "@/Global/components";
import { WorkoutSession } from "@/types/workoutSession";



export default function TodaySessionsList({ sessions }: { sessions: WorkoutSession[] }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-2 border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          ⚠️ Séances du jour
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Aucune séance prévue aujourd'hui</p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/calendar">Planifier une séance</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        ⚠️ Séances du jour
      </h2>
      <div className="space-y-3">
        {sessions.map((session) => {
          const time = new Date(session.scheduledDate).toLocaleTimeString(
            "fr-FR",
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          );

          return (
            <div
              key={session.id}
              className="flex flex-col md:flex-row gap-2 items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div>
                <h3 className="font-semibold text-gray-900">
                  {session.workoutName}
                </h3>
                <p className="text-sm text-gray-600">
                  ⏰ {time} • ⏱️ {session.estimatedDuration} min
                </p>
              </div>
              <Link href={`/sessions/${session.id}`}>
                <Button>Démarrer</Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
