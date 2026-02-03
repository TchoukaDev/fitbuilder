
export default function CalendarSkeleton() {
  return (
    <>
      <div className="calendar-container">
        <div className="mb-3 flex items-center justify-between">
          <div className="w-48 h-10 bg-primary-200/50 rounded"></div>
          <div className="w-48 h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="calendar-wrapper animate-pulse flex flex-col items-center justify-center bg-gray-100!"></div>
      </div>
    </>
  );
}
