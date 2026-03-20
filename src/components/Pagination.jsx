// /src/components/Pagination.jsx
export default function Pagination({ currentPage, totalPages, setPage }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
        pages.push(i);
      }
    }
    const result = [];
    let prev = null;
    for (const page of pages) {
      if (prev !== null && page - prev > 1) result.push("...");
      result.push(page);
      prev = page;
    }
    return result;
  };

  return (
    <div className="flex justify-end items-center gap-1 sm:gap-2 mt-6 flex-wrap">
      <button
        onClick={() => setPage(Math.max(currentPage - 1, 1))} // ✅ direct number
        disabled={currentPage === 1}
        className="cursor-pointer px-2 sm:px-3 py-1 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
      >
        ← Prev
      </button>

      {getPages().map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => setPage(page)} // ✅ direct number
            className={`cursor-pointer px-2 sm:px-3 py-1 rounded-lg text-sm border ${
              currentPage === page
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => setPage(Math.min(currentPage + 1, totalPages))} // ✅ direct number
        disabled={currentPage === totalPages}
        className="cursor-pointer px-2 sm:px-3 py-1 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
