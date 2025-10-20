"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
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
import { Search, Package } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
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
              placeholder="Search products..."
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
                    return (
                      <TableHead key={header.id} className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
                    }`}
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
                    colSpan={columns.length}
                    className="h-32 text-center bg-gray-50"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Package className="h-12 w-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">No products found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
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
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} products
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