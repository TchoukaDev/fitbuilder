import Link from "next/link";
import { Button } from "@/Global/components";

export default function NextSessionCard({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📆 Prochaines séances
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Aucune séance planifiée</p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/calendar">Planifier des séances</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          📆 Prochaines séances
        </h2>
        <Button asChild>
          <Link href="/calendar">Voir le calendrier</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sessions.map((session, index) => {
          const date = new Date(session.scheduledDate);
          const dateFormatted = date.toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });
          const time = date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={session._id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-400 space-y-4  transition-colors"
            >
              <div className="flex justify-center  items-center gap-5">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  {index === 0 ? "1" : index === 1 ? "2" : "3"}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    {dateFormatted}
                  </p>
                  <p className="text-sm text-gray-600">{time}</p>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-1 ">
                  {session.workoutName}
                </h3>
                <p className="text-sm text-gray-600 mb-3 ">
                  ⏱️ {session.estimatedDuration} min
                </p>
              </div>
              <div className="flex justify-center">
                <Button asChild>
                  <Link href={`/sessions/${session._id}`}>Voir</Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
