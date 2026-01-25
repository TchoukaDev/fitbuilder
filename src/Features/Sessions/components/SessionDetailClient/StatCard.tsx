
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;

}

export default function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-primary-600 text-white border-primary-300 border rounded-lg p-4 flex flex-col items-center text-center">
      <div className="mb-2">{icon}</div>
      <p className="text-xs font-medium mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
