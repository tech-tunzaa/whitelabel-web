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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Filter, MoreHorizontal, Search, X } from "lucide-react";
import { DeliveryPartner } from "../types/delivery-partner";
import { useRouter } from "next/navigation";

interface DeliveryPartnerTableProps {
  deliveryPartners: DeliveryPartner[];
  onApproveDeliveryPartner: (
    id: string,
    commissionPercent: number,
    kycVerified: boolean
  ) => void;
  onRejectDeliveryPartner: (id: string) => void;
}

export function DeliveryPartnerTable({
  deliveryPartners,
  onApproveDeliveryPartner,
  onRejectDeliveryPartner,
}: DeliveryPartnerTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const filteredPartners = deliveryPartners.filter(
    (partner) =>
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingPartners = filteredPartners.filter(
    (partner) => !partner.kyc.verified
  );
  const activePartners = filteredPartners.filter(
    (partner) => partner.kyc.verified
  );
  const rejectedPartners = filteredPartners.filter(
    (partner) => partner.status === "rejected"
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search delivery partners..."
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
                <span className="mr-2">Status</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">Type</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">Registration Date</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">
            All Partners
            <Badge variant="secondary" className="ml-2">
              {filteredPartners.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Applications
            <Badge variant="secondary" className="ml-2">
              {pendingPartners.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            <Badge variant="secondary" className="ml-2">
              {rejectedPartners.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Commission
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Registered
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow
                      key={partner._id}
                      onClick={() =>
                        router.push(
                          `/dashboard/delivery-partners/${partner._id}`
                        )
                      }
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={partner.profilePicture || "/placeholder.svg"}
                              alt={partner.name}
                            />
                            <AvatarFallback>
                              {partner.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{partner.name}</div>
                            <div className="text-xs text-muted-foreground md:hidden">
                              {partner.type}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{partner.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {partner.commission_percent}%
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            partner.kyc.verified
                              ? "success"
                              : partner.status === "rejected"
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {partner.kyc.verified
                            ? "Active"
                            : partner.status === "rejected"
                            ? "Rejected"
                            : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(partner.created_at).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "2-digit", day: "2-digit" }
                        )}
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
                                router.push(
                                  `/dashboard/delivery-partners/${partner._id}/edit`
                                );
                              }}
                            >
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            {!partner.kyc.verified &&
                              partner.status !== "rejected" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onApproveDeliveryPartner(
                                        partner._id,
                                        partner.commission_percent,
                                        true
                                      );
                                    }}
                                  >
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRejectDeliveryPartner(partner._id);
                                    }}
                                  >
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            {partner.kyc.verified && (
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/delivery-partners/${partner._id}/suspend`
                                  )
                                }
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
                    <TableHead>Partner</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Commission
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Registered
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPartners.map((partner) => (
                    <TableRow
                      key={partner._id}
                      onClick={() =>
                        router.push(
                          `/dashboard/delivery-partners/${partner._id}`
                        )
                      }
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={partner.profilePicture || "/placeholder.svg"}
                              alt={partner.name}
                            />
                            <AvatarFallback>
                              {partner.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{partner.name}</div>
                            <div className="text-xs text-muted-foreground md:hidden">
                              {partner.type}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{partner.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {partner.commission_percent}%
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(partner.created_at).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "2-digit", day: "2-digit" }
                        )}
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

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onApproveDeliveryPartner(
                                  partner._id,
                                  partner.commission_percent,
                                  true
                                );
                              }}
                            >
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onRejectDeliveryPartner(partner._id);
                              }}
                            >
                              Reject
                            </DropdownMenuItem>
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

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Commission
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Registered
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedPartners.map((partner) => (
                    <TableRow
                      key={partner._id}
                      onClick={() =>
                        router.push(
                          `/dashboard/delivery-partners/${partner._id}`
                        )
                      }
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={partner.profilePicture || "/placeholder.svg"}
                              alt={partner.name}
                            />
                            <AvatarFallback>
                              {partner.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{partner.name}</div>
                            <div className="text-xs text-muted-foreground md:hidden">
                              {partner.type}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{partner.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {partner.commission_percent}%
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(partner.created_at).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "2-digit", day: "2-digit" }
                        )}
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
      </Tabs>
    </div>
  );
}
