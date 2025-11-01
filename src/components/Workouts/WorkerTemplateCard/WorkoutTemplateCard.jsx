import Button from "@/components/Buttons/Button";
import Link from "next/link";

export default function WorkoutTemplateCard({ workout, activeTabs, onDelete }) {
  return (
    <div>
      <div>{workout.name}</div>
      {activeTabs === "mine" && (
        <>
          <Link className="LinkButton" href={`workouts/${id}`}>
            Modifier
          </Link>
          <Button close onClick={onDelete}>
            Supprimer
          </Button>
        </>
      )}
    </div>
  );
}
