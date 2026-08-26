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
import { IconEye, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { MyModal } from "../shared/MyModal";
import { ProductCard } from "../cards/ProductCard";
import image1 from "@/assets/product1.png";
import { toast } from "sonner";
// import { useDeleteMarketPlaceMutation } from "@/redux/service/marketPlace/marketPlaceApi";
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
} from "@/components/ui/alert-dialog";

interface Stats {
  id: string;
  seller: {
    name: string;
    email: string;
  };
  status: "Sold" | "Not Sold";
  productName: string;
  price: number;
}

interface ProductsTableProps {
  data?: Stats[];
  marketPlaceLoading: boolean;
}

const tableHeaders = ["Seller", "Status", "Product Name", "Price", "Actions"];

export function MarketplaceTable({
  data,
  marketPlaceLoading,
}: ProductsTableProps) {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<any>({
    id: 1,
    image: image1,
    title: "Professional Car Tiers",
    price: 25,
    rating: 5.0,
    status: "New",
  });

  // api
  // const [deleteMarketPlace] = useDeleteMarketPlaceMutation();

  const handleSuspend = (id: string) => {
    toast.success("Product suspended successfully! (Mocked)");
  };
  const handleView = (product: any) => {
    setProduct(product);
    console.log(product);
    setOpen(!open);
  };
  return (
    <div className="space-y-6  rounded-xl">
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200">
              {tableHeaders.map((title, idx) => (
                <TableHead
                  key={title}
                  className={`text-gray-700 font-semibold text-sm px-4 py-3 ${
                    idx === 0 ? "text-left" : "text-center"
                  }`}
                >
                  {title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {marketPlaceLoading ? (
              Array.from({ length: 6 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>

                  <TableCell className="px-4 py-3 text-center">
                    <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                  </TableCell>

                  <TableCell className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-40 mx-auto" />
                  </TableCell>

                  <TableCell className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </TableCell>

                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : data?.length ? (
              data.map((product: any) => (
                <TableRow
                  key={product.id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  {/* Seller Name */}
                  <TableCell className="px-4 py-3 text-left">
                    {product?.createdBy?.name}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-4 py-3 text-center">
                    <Badge
                      className={
                        product.status === "AVAILABLE"
                          ? "bg-green-50 text-green-700 border-green-300"
                          : "bg-red-50 text-red-700 border-red-200"
                      }
                      variant="outline"
                    >
                      {product?.status}
                    </Badge>
                  </TableCell>

                  {/* Product Name */}
                  <TableCell className="px-4 py-3 text-center text-gray-700">
                    {product?.title}
                  </TableCell>

                  {/* Price */}
                  <TableCell className="px-4 py-3 text-center text-gray-700">
                    ${product?.price}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        className="bg-blue-700 cursor-pointer"
                        onClick={() => handleView(product)}
                      >
                        <IconEye size={16} />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="bg-transparent cursor-pointer hover:bg-gray-300 p-2 duration-300 rounded-full">
                            <Button
                              size="icon"
                              className="bg-red-600 cursor-pointer"
                            >
                              <IconTrash size={16} />
                            </Button>
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
                              <Button
                                size="icon"
                                className=" bg-red-600 cursor-pointer"
                                onClick={() => handleSuspend(product?._id)}
                              >
                                <IconTrash size={16} />
                              </Button>
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
                  colSpan={5}
                  className="text-center py-6 text-gray-500"
                >
                  No marketplace items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <MyModal open={open} onOpenChange={setOpen}>
        <ProductCard
          key={product?._id}
          image={product?.photos?.[0] || image1}
          title={product?.title}
          price={product?.price}
          status={product?.status}
        />
      </MyModal>
    </div>
  );
}
