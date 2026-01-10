interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }
  
  export function Pagination(props: PaginationProps) {
    const canGoPrev = () => props.page > 1;
    const canGoNext = () => props.page < props.totalPages;
  
    return (
      <div class="mt-4 flex items-center justify-between gap-4">
        <button
          disabled={!canGoPrev()}
          onClick={() => props.onPageChange(props.page - 1)}
          class="
            rounded-md border border-zinc-700 px-3 py-1.5 text-sm
            text-zinc-300 transition
            enabled:hover:bg-zinc-700 enabled:hover:text-white
            disabled:opacity-40
          "
        >
          ← Prev
        </button>
  
        <span class="text-sm text-zinc-400">
          Page <span class="text-zinc-200">{props.page}</span> of{" "}
          <span class="text-zinc-200">{props.totalPages}</span>
        </span>
  
        <button
          disabled={!canGoNext()}
          onClick={() => props.onPageChange(props.page + 1)}
          class="
            rounded-md border border-zinc-700 px-3 py-1.5 text-sm
            text-zinc-300 transition
            enabled:hover:bg-zinc-700 enabled:hover:text-white
            disabled:opacity-40
          "
        >
          Next →
        </button>
      </div>
    );
  }  