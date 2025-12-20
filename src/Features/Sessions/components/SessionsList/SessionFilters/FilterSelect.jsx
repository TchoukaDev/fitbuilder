export default function FilterSelect({
  filters,
  onSelectChange,
  isFetching,
  id,
}) {
  return (
    <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
      <select
        className="w-full input pt-2"
        id={id}
        onChange={(e) => onSelectChange(e.target.value)}
        disabled={isFetching}
      >
        {filters.map((filter) => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>
    </div>
  );
}
