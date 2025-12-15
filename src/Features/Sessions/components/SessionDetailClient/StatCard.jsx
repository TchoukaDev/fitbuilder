export default function StatCard({ icon, label, value, color = "primary" }) {
  return (
    <div className="bg-primary-100 text-primary-600 border-primary-300 border rounded-lg p-4 flex flex-col items-center text-center">
      <div className="mb-2">{icon}</div>
      <p className="text-xs font-medium mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
