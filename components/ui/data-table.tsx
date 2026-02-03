"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  entityName?: string;
  pageSize?: number;
  defaultSorting?: { id: string; desc: boolean }[];
  onRowClick?: (row: TData) => void;
  enableRowSelection?: boolean;
  onSelectionChange?: (selectedRows: TData[]) => void;
  getRowId?: (row: TData) => string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
  emptyDescription = "Try adjusting your search criteria",
  entityName = "rows",
  pageSize = 10,
  defaultSorting,
  onRowClick,
  enableRowSelection = true,
  onSelectionChange,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(defaultSorting || []);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const idToRowMap = React.useMemo(() => {
    const map: Record<string, TData> = {};
    const resolveId = getRowId ?? ((row: TData, i: number) => String((row as any)?.id ?? i));
    data.forEach((row, i) => {
      map[resolveId(row, i)] = row;
    });
    return map;
  }, [data, getRowId]);

  const handleRowSelectionChange = React.useCallback(
    (updater: (old: RowSelectionState) => RowSelectionState) => {
      if (typeof updater !== "function") return;
      setRowSelection((old) => {
        const newState = updater(old);
        if (onSelectionChange) {
          const selected = Object.entries(newState)
            .filter(([, v]) => v)
            .map(([id]) => idToRowMap[id])
            .filter(Boolean);
          onSelectionChange(selected);
        }
        return newState;
      });
    },
    [onSelectionChange, idToRowMap]
  );

  const selectColumn: ColumnDef<TData, TValue> = {
    id: "select",
    header: ({ table }) => {
      const isAllSelected = table.getIsAllPageRowsSelected?.();
      const isSomeSelected = table.getIsSomePageRowsSelected?.();
      const toggleAll = table.toggleAllPageRowsSelected;
      if (typeof toggleAll !== "function") return null;
      return (
        <Checkbox
          checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false}
          onCheckedChange={(value) => toggleAll(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
          onClick={(e) => e.stopPropagation()}
        />
      );
    },
    cell: ({ row }) => {
      const getIsSelected = row.getIsSelected;
      const toggleSelected = row.toggleSelected;
      if (typeof getIsSelected !== "function" || typeof toggleSelected !== "function") return null;
      return (
        <Checkbox
          checked={getIsSelected()}
          onCheckedChange={(value) => toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
          onClick={(e) => e.stopPropagation()}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  };

  const tableColumns = React.useMemo(
    () => (enableRowSelection ? [selectColumn, ...columns] : columns),
    [enableRowSelection, columns]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    getRowId: (row, index) =>
      getRowId ? getRowId(row as TData) : String((row as any)?.id ?? index),
    enableRowSelection,
    ...(enableRowSelection && {
      onRowSelectionChange: handleRowSelectionChange,
    }),
    state: {
      sorting,
      columnFilters,
      globalFilter,
      ...(enableRowSelection && { rowSelection }),
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize },
      sorting: defaultSorting || [],
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      
      // Search across all columns in the row
      for (const column of row.getAllCells()) {
        const cellValue = column.getValue();
        
        // Handle DCC object specifically
        if (column.column.id === 'dcc' && typeof cellValue === 'object' && cellValue !== null) {
          const dccName = (cellValue as any).name || '';
          if (dccName.toLowerCase().includes(searchValue)) {
            return true;
          }
        }
        
        // Handle string values
        if (typeof cellValue === 'string' && cellValue.toLowerCase().includes(searchValue)) {
          return true;
        }
        
        // Handle number values
        if (typeof cellValue === 'number' && cellValue.toString().includes(searchValue)) {
          return true;
        }
      }
      
      return false;
    },
  });

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center py-4 px-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-gray-200 hover:bg-gray-50">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        className={`h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50 ${
                          canSort ? "cursor-pointer select-none hover:bg-gray-100" : ""
                        }`}
                        onClick={
                          canSort
                            ? (e) => header.column.getToggleSortingHandler()?.(e)
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {canSort && (
                            <span className="text-gray-400">
                              {sortDirection === "asc" ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : sortDirection === "desc" ? (
                                <ArrowDown className="h-4 w-4" />
                              ) : (
                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    } ${onRowClick ? "cursor-pointer" : ""}`}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-32 text-center bg-gray-50"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Package className="h-12 w-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">{emptyMessage}</p>
                      <p className="text-sm text-gray-400">{emptyDescription}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="flex items-center justify-between px-1">
        <div className="text-sm text-gray-500">
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} {entityName}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-gray-200 hover:bg-gray-50"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-gray-200 hover:bg-gray-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 