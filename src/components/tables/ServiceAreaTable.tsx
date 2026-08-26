/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Pencil, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { AddServiceAreaForm } from "../forms/AddServiceAreaForm";
import { MyModal } from "../shared/MyModal";
import { Switch } from "../ui/switch";
import { EditServiceAreaForm } from "../forms/EditServiceAreaForm";
import SwitchWithState from "../shared/SwitchWithState";
// import {
//   useDeleteServiceAreaMutation,
//   useUpdateServiceAreaMutation,
// } from "@/redux/service/serviceArea/serviceAreaApi";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { IconBan } from "@tabler/icons-react";

interface ServiceAreaProps {
  areas: any;
  setSearchTerm: (term: string) => void;
  loading: boolean;
}

const tableHeaders = ["Area Name", "Status", "City", "Actions"];

// const defaultServices: Service[] = [
//   {
//     id: "1",
//     areaName: "Florida",
//     status: "Open",
//     city: "Miami, Orlando, Palm Beach, Fort Lauderdale, Naples, Tampa",
//     isActive: true,
//   },
//   {
//     id: "2",
//     areaName: "Texas",
//     status: "Close",
//     city: "Austin, Dallas, Houston",
//     isActive: true,
//   },
//   {
//     id: "3",
//     areaName: "New York",
//     status: "Close",
//     city: "New York",
//     isActive: true,
//   },
//   {
//     id: "4",
//     areaName: "Massachusetts",
//     status: "Close",
//     city: "Boston",
//     isActive: true,
//   },
//   {
//     id: "5",
//     areaName: "District of Columbia",
//     status: "Close",
//     city: "Washington DC",
//     isActive: false,
//   },
//   {
//     id: "6",
//     areaName: "Georgia",
//     status: "Close",
//     city: "Atlanta",
//     isActive: true,
//   },
//   {
//     id: "7",
//     areaName: "Nevada",
//     status: "Close",
//     city: "Las Vegas",
//     isActive: false,
//   },
//   {
//     id: "8",
//     areaName: "Washington",
//     status: "Close",
//     city: "Seattle",
//     isActive: true,
//   },
// ];

export function ServiceAreaTable({
  areas,
  setSearchTerm,
  loading,
}: ServiceAreaProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  // const [deleteServiceArea] = useDeleteServiceAreaMutation();
  // const [updateServiceArea] = useUpdateServiceAreaMutation();

  const handleDelete = (id: string) => {
    toast.success("Service area deleted successfully! (Mocked)");
  };

  const handleSwitchChange = (isActive: boolean, id: string) => {
    console.log(`Service area with ID ${id} is now ${isActive ? "ACTIVE" : "INACTIVE"}`);
    toast.success("Service area status updated successfully! (Mocked)");
  };
  return (
    <div className="space-y-6 rounded-xl">
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-lg border border-gray-200 bg-white">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
          className="gap-2 text-white border-gray-200 bg-light-black cursor-pointer"
        >
          <MapPin className="w-4 h-4" />
          Add Service Area
        </Button>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200">
              {tableHeaders.map((title, idx) => (
                <TableHead
                  key={title}
                  className={`text-gray-700 font-semibold text-sm px-4 py-3 ${idx === 0 ? "text-left" : "text-center"}`}
                >
                  {title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {/* Area Name */}
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-4 py-3 text-center">
                    <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                  </TableCell>

                  {/* City */}
                  <TableCell className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-40 mx-auto" />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Skeleton className="h-6 w-10 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : areas?.length ? (
              areas.map((area: any) => (
                <TableRow
                  key={area?.id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <TableCell className="px-4 py-3">{area?.areaName}</TableCell>

                  <TableCell className="px-4 py-3 text-center">
                    <Badge
                      className={
                        area?.status === "ACTIVE"
                          ? "bg-green-50 text-green-700 border-green-300"
                          : "bg-red-100 text-orange-700 border-orange-600"
                      }
                      variant="outline"
                    >
                      {area?.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-700 text-center">
                    {area?.city}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <SwitchWithState
                        id={area?._id}
                        onchange={handleSwitchChange}
                        isActive={area?.status === "ACTIVE"}
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditOpen(!editOpen);
                          setSelectedService(area);
                        }}
                        className="h-8 w-8 p-0 cursor-pointer"
                      >
                        <Pencil className="h-4 w-4 text-gray-700" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="bg-transparent cursor-pointer hover:bg-gray-300 p-2 duration-300 rounded-full">
                            <Trash2 className="h-4 w-4 text-orange-500" />
                          </div>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the driver.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>

                            <AlertDialogAction className="bg-red-600 text-white hover:bg-destructive/90">
                              <div
                                onClick={() => handleDelete(area?._id)}
                                className=" p-0 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 text-white" />
                              </div>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-gray-500"
                >
                  No service areas found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <MyModal open={open} onOpenChange={(val: boolean) => setOpen(val)}>
        <AddServiceAreaForm setOpen={setOpen} />
      </MyModal>
      <MyModal
        open={editOpen}
        onOpenChange={(val: boolean) => setEditOpen(val)}
      >
        <EditServiceAreaForm
          defaultValues={selectedService}
          setOpen={setEditOpen}
        />
      </MyModal>
    </div>
  );
}
