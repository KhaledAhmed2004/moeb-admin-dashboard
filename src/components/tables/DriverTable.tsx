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
import { IconBan, IconEye, IconTrash } from "@tabler/icons-react";
import { Download, Search, Sliders } from "lucide-react";
import { useEffect, useState } from "react";
import { DriverView } from "../page/driverManagement/DriverView";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MyModal } from "../shared/MyModal";
import { Skeleton } from "../ui/skeleton";
// import {
//   useBlockUserMutation,
//   useDeleteDriverMutation,
// } from "@/redux/service/driver/driverApi";
import { toast } from "sonner";
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
} from "@/components/ui/alert-dialog";
// import { useSendEmailMutation } from "@/redux/service/subscription/subscriptionApi";

interface Driver {
  _id: string;
  name: string;
  joinDate: string;
  phone: string;
  companyRole: string;
  role: string;
  vehicleType: string;
  status: "ACTIVE" | "PENDING" | "RESTRICTED";
  memberNumber: string;
  createdAt: Date;
  vehicles: { carType: string; licencePalet: string }[];
  subscription: subscription;
}

interface DriversTableProps {
  drivers?: Driver[];
  isLoading?: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | undefined;
  onStatusChange: (value: string | undefined) => void;
}

interface subscription {
  status: string;
  plan: string;
  currentPeriodEnd: string;
}

const tableHeaders = [
  "Name",
  "Member Number",
  "Status",
  "Vehicle Type",
  "Join Date",
  "Subscription Type",
  "Subscription Status",
  "Subscription End Date",
  "Actions",
];

export function DriverTable({
  drivers,
  isLoading = false,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: DriversTableProps) {
  const [driverId, setDriverId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearchChange]);

  // api
  // const [blockUser] = useBlockUserMutation();
  // const [deleteDriver] = useDeleteDriverMutation();
  // const [sendMail, {isLoading: isSendMailLoading}] = useSendEmailMutation();
  const isSendMailLoading = false;
  const handleDelete = (id: string) => {
    toast.success("Driver deleted successfully. (Mocked)");
  };

  const handleSuspend = (id: string) => {
    toast.success("Driver blocked successfully. (Mocked)");
    setOpen(false);
  };

  const handleSendMail = (id: string) => {
    toast.success("Email sent successfully. (Mocked)");
  };

  const handleExport = () => {
    if (!drivers || drivers.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Name",
      "Member Number",
      "Phone",
      "Status",
      "Vehicle Type",
      "Join Date",
      "Subscription Plan",
      "Subscription Status",
      "Subscription End Date",
    ];

    const csvRows = [
      headers.join(","),
      ...drivers.map((driver) =>
        [
          `"${driver.name || ""}"`,
          `"${driver.memberNumber || ""}"`,
          `"${driver.phone || ""}"`,
          `"${driver.status || ""}"`,
          `"${driver.vehicles?.[0]?.carType || "N/A"}"`,
          `"${driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : ""}"`,
          `"${driver.subscription?.plan || "N/A"}"`,
          `"${driver.subscription?.status || "N/A"}"`,
          `"${driver.subscription?.currentPeriodEnd ? new Date(driver.subscription.currentPeriodEnd).toLocaleDateString() : "N/A"}"`,
        ].join(","),
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `drivers_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="space-y-6 rounded-xl">
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-lg border border-gray-200 bg-white">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-gray-700 border-gray-200 bg-transparent h-[40px]"
            >
              <Sliders className="w-4 h-4" />
              {statusFilter ? statusFilter : "Status"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={(val) => onStatusChange(val === "ALL" ? undefined : val)}
            >
              <DropdownMenuRadioItem value="ALL">All Status</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ACTIVE">Active</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="PENDING">Pending</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="RESTRICTED">Restricted</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-2 text-gray-700 border-gray-200 bg-transparent h-[40px]"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200">
              {tableHeaders.map((title, idx) => (
                <TableHead
                  key={title}
                  className={`text-gray-700 uppercase font-semibold text-sm px-4 py-3 ${idx === 0 ? "text-left" : "text-center"}`}
                >
                  {title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {isLoading ? (
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="border-b last:border-b-0">
                  {Array.from({ length: 6 }).map((_, colIndex) => (
                    <TableCell key={colIndex} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              {drivers?.map((driver) => (
                <TableRow
                  key={driver?._id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <TableCell className="px-4 py-3">{driver?.name}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-center">
                    {driver?.phone}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-center">
                    <Badge
                      className={
                        driver?.status === "ACTIVE"
                          ? "bg-green-50 text-green-700 border-green-300"
                          : driver?.status === "PENDING"
                            ? "bg-orange-50 text-yellow-700 border-yellow-200"
                            : "bg-orange-50 text-red-700 border-red-200"
                      }
                      variant="outline"
                    >
                      {driver?.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-700 text-center">
                    {driver?.vehicles![0]?.carType}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-700 text-center">
                    {new Date(driver?.createdAt).toDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-center">
                    {driver?.subscription?.plan || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-center">
                    {driver?.subscription?.status === "active" 
                    ? "Active" 
                    : <Button onClick={() => handleSendMail(driver?._id)} disabled={isSendMailLoading}>Send Email</Button> }
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-center">
                    {driver?.subscription?.currentPeriodEnd ? new Date(driver?.subscription?.currentPeriodEnd).toDateString() : "N/A"}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-5">
                      <div
                        className="bg-transparent cursor-pointer hover:bg-gray-300 p-2 duration-300 rounded-full"
                        onClick={() => {
                          setOpen(!open);
                          setDriverId(driver._id);
                        }}
                      >
                        <IconEye color="blue" size={25} />
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="bg-transparent cursor-pointer hover:bg-gray-300 p-2 duration-300 rounded-full">
                            <IconBan color="red" size={16} />
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

                            <AlertDialogAction
                              onClick={() => handleSuspend(driver._id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="bg-transparent cursor-pointer hover:bg-gray-300 p-2 duration-300 rounded-full">
                            <IconTrash color="red" size={16} />
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

                            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90">
                              <div
                                className="bg-transparent cursor-pointer hover:bg-gray-300 p-2 duration-300 rounded-full"
                                onClick={() => handleDelete(driver._id)}
                              >
                                <IconTrash color="red" size={16} />
                              </div>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>
      <MyModal open={open} onOpenChange={(val: boolean) => setOpen(val)}>
        <DriverView setOpen={setOpen} driverId={driverId} />
      </MyModal>
    </div>
  );
}
