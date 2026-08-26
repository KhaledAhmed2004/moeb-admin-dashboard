/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
// import {
//   useApproveUserMutation,
//   useBlockUserMutation,
//   useGetUserDetailsByIdQuery,
// } from "@/redux/service/driver/driverApi";
import { toast } from "sonner";

export function DriverView({ driverId, setOpen }: any) {
  // const { data, isLoading } = useGetUserDetailsByIdQuery(driverId, {
  //   skip: !driverId,
  // });
  const data: any = { data: null };
  const isLoading = false;

  // const [approveUser] = useApproveUserMutation();
  // const [blockUser] = useBlockUserMutation();
  const driver = data?.data;

  const handleBlock = (id: string) => {
    toast.success("Driver blocked successfully. (Mocked)");
    setOpen(false);
  };

  const handleApprove = (id: string) => {
    toast.success("Driver approved successfully. (Mocked)");
    setOpen(false);
  };

  return (
    <div className="bg-white w-full max-w-xl">
      {/* Header */}
      <div className="p-6 pb-4 border-b">
        <h2 className="text-xl font-bold text-foreground">
          Driver Verification
        </h2>
        <div className="mt-2">
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded">
            {driver?.status ?? "Pending"}
          </span>
        </div>
      </div>

      {/* Driver Info */}
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-lg font-bold text-foreground">
          {driver?.name ?? "N/A"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {driver?.email ?? "N/A"}
        </p>
        <p className="text-sm text-muted-foreground">
          {driver?.company ?? "N/A"}
        </p>
      </div>

      {/* Metadata */}
      <div className="px-6 py-4 border-t border-b grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Created
          </p>
          <p className="text-sm font-semibold text-foreground">
            {driver?.createdAt
              ? new Date(driver.createdAt).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Status
          </p>
          <p className="text-sm font-semibold text-foreground">
            {driver?.status ?? "Pending"}
          </p>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="px-6 pt-6 pb-4">
        <h4 className="text-sm font-bold text-foreground mb-4">
          Vehicle Details
        </h4>
        {driver?.vehicles?.map((vehicle: any, index: number) => (
          <div key={index} className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-sm text-foreground">Make & Model</p>
                <p className="text-sm font-semibold text-amber-600">
                  {vehicle ? `${vehicle.make} ${vehicle.model}` : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="text-sm text-foreground">Color</p>
                <p className="text-sm font-semibold text-amber-600">
                  {vehicle?.colorInside ?? "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-sm text-foreground">Year</p>
                <p className="text-sm font-semibold text-amber-600">
                  {vehicle?.year ?? "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="text-sm text-foreground">License Plate</p>
                <p className="text-sm font-semibold text-amber-600">
                  {vehicle?.licensePlate ?? "N/A"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Documents */}
      <div className="px-6 pt-6 pb-4 border-t">
        <h4 className="text-sm font-bold text-foreground mb-4">Documents</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-100 rounded-lg aspect-[3/4] flex items-center justify-center">
            <img
              src={driver?.vehicleRegistration?.image}
              alt="Front View"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Photos */}
      <div className="px-6 pt-6 pb-6 border-t">
        <h4 className="text-sm font-bold text-foreground mb-4">
          Vehicle Photos
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-lg aspect-video">
            {driver?.vehiclePhotos?.frontView && (
              <img
                src={driver?.vehiclePhotos?.frontView}
                alt="Front View"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>
          <div className="bg-gray-800 rounded-lg aspect-video">
            {driver?.vehiclePhotos?.interiorView && (
              <img
                src={driver?.vehiclePhotos?.interiorView}
                alt="Front View"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>
          <div className="bg-gray-800 rounded-lg aspect-video">
            {driver?.vehiclePhotos?.rearView && (
              <img
                src={driver?.vehiclePhotos?.rearView}
                alt="Front View"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-6 flex gap-3">
        <Button
          variant="outline"
          onClick={() => handleBlock(driver?._id)}
          className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
        >
          Reject
        </Button>
        <Button
          onClick={() => handleApprove(driver?._id)}
          className="flex-1 bg-black text-white hover:bg-gray-900 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Approve
        </Button>
      </div>
    </div>
  );
}
