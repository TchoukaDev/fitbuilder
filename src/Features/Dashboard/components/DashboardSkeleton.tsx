export default function DashboardSkeleton() {
  return (
<div className="space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-80 bg-gray-200 rounded lg:col-span-2 animate-pulse"></div>
    </div>
    <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="h-56 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-56 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-56 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-56 bg-gray-200 rounded animate-pulse"></div>
      </div>
    <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
    </div>
   <div className="grid grid-cols-1  md:grid-cols-5 gap-4">
        <div className="col-span-2  md:col-span-3 md:col-end-5 ">
          <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}