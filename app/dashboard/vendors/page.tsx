"use client";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Filter, MoreHorizontal, Search, X } from "lucide-react";

import { VendorDetails } from "./vendor-details";

import data from "./data.json";
import { useRouter } from "next/navigation";

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState(data.vendors);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const isDesktop = !isMobile;

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingVendors = filteredVendors.filter(
    (vendor) => vendor.status === "pending"
  );
  const activeVendors = filteredVendors.filter(
    (vendor) => vendor.status === "active"
  );
  const rejectedVendors = filteredVendors.filter(
    (vendor) => vendor.status === "rejected"
  );

  const handleApproveVendor = (vendorId, commissionPlan, kycVerified) => {
    setVendors(
      vendors.map((vendor) =>
        vendor.id === vendorId
          ? { ...vendor, status: "active", commissionPlan, kycVerified }
          : vendor
      )
    );
    setOpen(false);
  };

  const handleRejectVendor = (vendorId: any) => {
    setVendors(
      vendors.map((vendor) =>
        vendor.id === vendorId ? { ...vendor, status: "rejected" } : vendor
      )
    );
    setOpen(false);
  };

  const handleVendorClick = (vendor: any) => {
    setSelectedVendor(vendor);
    setOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage vendor applications and accounts
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/vendors/add")}>
          Add Vendor
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vendors..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Checkbox id="status" className="mr-2" />
                  <label htmlFor="status">Status</label>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Checkbox id="category" className="mr-2" />
                  <label htmlFor="category">Category</label>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Checkbox id="date" className="mr-2" />
                  <label htmlFor="date">Registration Date</label>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">
              All Vendors
              <Badge variant="secondary" className="ml-2">
                {filteredVendors.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Applications
              <Badge variant="secondary" className="ml-2">
                {pendingVendors.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              <Badge variant="secondary" className="ml-2">
                {rejectedVendors.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Category
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Registered
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                      <TableRow
                        key={vendor.id}
                        onClick={() => handleVendorClick(vendor)}
                        className="cursor-pointer"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={vendor.logo || "/placeholder.svg"}
                                alt={vendor.businessName}
                              />
                              <AvatarFallback>
                                {vendor.businessName.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{vendor.businessName}</div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                {vendor.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {vendor.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {vendor.category}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              vendor.status === "active"
                                ? "success"
                                : vendor.status === "pending"
                                ? "warning"
                                : "destructive"
                            }
                          >
                            {vendor.status.charAt(0).toUpperCase() +
                              vendor.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {vendor.registrationDate}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVendorClick(vendor);
                                }}
                              >
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {vendor.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApproveVendor(
                                        vendor.id,
                                        "standard",
                                        true
                                      );
                                    }}
                                  >
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRejectVendor(vendor.id);
                                    }}
                                  >
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {vendor.status === "active" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle suspend
                                  }}
                                >
                                  Suspend
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Registered
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingVendors.map((vendor) => (
                      <TableRow
                        key={vendor.id}
                        onClick={() => handleVendorClick(vendor)}
                        className="cursor-pointer"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={vendor.logo || "/placeholder.svg"}
                                alt={vendor.businessName}
                              />
                              <AvatarFallback>
                                {vendor.businessName.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{vendor.businessName}</div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                {vendor.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {vendor.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {vendor.category}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {vendor.registrationDate}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectVendor(vendor.id);
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVendorClick(vendor);
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" /> Review
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Registered
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedVendors.map((vendor) => (
                      <TableRow
                        key={vendor.id}
                        onClick={() => handleVendorClick(vendor)}
                        className="cursor-pointer"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={vendor.logo || "/placeholder.svg"}
                                alt={vendor.businessName}
                              />
                              <AvatarFallback>
                                {vendor.businessName.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{vendor.businessName}</div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                {vendor.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {vendor.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {vendor.category}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {vendor.registrationDate}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveVendor(vendor.id, "standard", true);
                            }}
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Vendor Application</DialogTitle>
              <DialogDescription>
                Review the vendor's information and documents
              </DialogDescription>
            </DialogHeader>
            {selectedVendor && (
              <VendorDetails
                vendor={selectedVendor}
                onApprove={handleApproveVendor}
                onReject={handleRejectVendor}
              />
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Vendor Application</DrawerTitle>
              <DrawerDescription>
                Review the vendor's information and documents
              </DrawerDescription>
            </DrawerHeader>
            {selectedVendor && (
              <VendorDetails
                vendor={selectedVendor}
                onApprove={handleApproveVendor}
                onReject={handleRejectVendor}
                isMobile={true}
              />
            )}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
