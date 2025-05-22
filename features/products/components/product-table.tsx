"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Check, Edit, Eye, MoreHorizontal, RefreshCw, XCircle, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Spinner } from "@/components/ui/spinner";

import { ProductListResponse } from "../types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProductTableProps {
  products: ProductListResponse["items"];
  onProductClick: (product: ProductListResponse["items"][0]) => void;
  onStatusChange?: (productId: string, status: string, rejectionReason?: string) => Promise<void>;
}

export function ProductTable({
  products,
  onProductClick,
  onStatusChange,
}: ProductTableProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectProductId, setRejectProductId] = useState<string | null>(null);
  const [rejectionType, setRejectionType] = useState("product_quality");
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // Filter products by various status combinations
  const publishedProducts = products.filter(
    (product) => product.verification_status === "approved" && product.is_active
  );
  const draftProducts = products.filter(
    (product) => product.verification_status === "approved" && !product.is_active
  );
  const pendingProducts = products.filter(
    (product) => product.verification_status === "pending"
  );
  const rejectedProducts = products.filter(
    (product) => product.verification_status === "rejected"
  );

  // Helper function to handle status change with loading state
  const handleStatusChange = async (
    productId: string | undefined,
    action: 'approve' | 'reject' | 'publish' | 'unpublish'
  ) => {
    if (!onStatusChange || !productId) return; // Skip if no ID or handler

    // For rejection, show the dialog instead of immediate action
    if (action === 'reject') {
      setRejectProductId(productId);
      setRejectionType("product_quality");
      setCustomReason("");
      setRejectionReason("");
      setShowRejectDialog(true);
      return;
    }

    try {
      setProcessingId(productId);
      
      // Map action to the right status change
      let status;
      switch(action) {
        case 'approve':
          status = 'approved';
          break;
        case 'publish':
          status = 'active';
          break;
        case 'unpublish':
          status = 'draft';
          break;
        default:
          return;
      }
      
      await onStatusChange(productId, status);
    } catch (error) {
      console.error("Error changing product status:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle the rejection confirmation
  const handleRejectConfirm = async () => {
    if (!rejectProductId || !onStatusChange) return;
    
    try {
      setProcessingId(rejectProductId);
      
      // Prepare rejection reason
      let finalReason = rejectionType === "other" 
        ? customReason 
        : getRejectionReasonText(rejectionType);
      
      await onStatusChange(rejectProductId, "rejected", finalReason);
      setShowRejectDialog(false);
    } catch (error) {
      console.error("Error rejecting product:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // Helper to get rejection reason text based on type
  const getRejectionReasonText = (type: string) => {
    switch (type) {
      case "product_quality":
        return "Product quality does not meet our standards";
      case "inadequate_information":
        return "Product information is incomplete or incorrect";
      case "pricing_issues":
        return "Product pricing issues need to be resolved";
      case "policy_violation":
        return "Product violates our marketplace policies";
      default:
        return customReason;
    }
  };

  // Helper function to get badge variant based on status
  const getStatusBadgeVariant = (status: string, isActive: boolean = true) => {
    // If the product is verified but not active, show special status
    if (status === "approved" && !isActive) {
      return "outline";
    }

    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Helper to get displayed status text
  const getStatusDisplayText = (product: any) => {
    if (product.verification_status === "approved") {
      return product.is_active ? "Published" : "Draft";
    } else if (product.verification_status === "rejected") {
      return "Rejected";
    } else {
      return "Pending";
    }
  };

  // Format date helper with consistent formatting to prevent hydration errors
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";

    try {
      // Check if the date is in DD/MM/YYYY format
      if (dateString.includes("/")) {
        const [day, month, year] = dateString.split("/");
        return format(new Date(`${year}-${month}-${day}`), "MMM d, yyyy");
      }

      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format price helper
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TZS"
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="all">
            All Products
            <Badge variant="secondary" className="ml-2">
              {products.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="published">
            Published
            <Badge variant="secondary" className="ml-2">
              {publishedProducts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="draft">
            Draft
            <Badge variant="secondary" className="ml-2">
              {draftProducts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2">
              {pendingProducts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            <Badge variant="secondary" className="ml-2">
              {rejectedProducts.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <AllProductsTab />
        <PublishedProductsTab />
        <DraftProductsTab />
        <PendingProductsTab />
        <RejectedProductsTab />
      </Tabs>

      {/* Rejection Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Product</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this product. This will be visible to the vendor.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <RadioGroup 
              value={rejectionType}
              onValueChange={setRejectionType}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="product_quality" id="product_quality" />
                  <Label htmlFor="product_quality">Product quality issues</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inadequate_information" id="inadequate_information" />
                  <Label htmlFor="inadequate_information">Inadequate product information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pricing_issues" id="pricing_issues" />
                  <Label htmlFor="pricing_issues">Pricing issues</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="policy_violation" id="policy_violation" />
                  <Label htmlFor="policy_violation">Policy violation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other (specify below)</Label>
                </div>
                
                {rejectionType === "other" && (
                  <Textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please provide specific reason for rejection..."
                    className="mt-2"
                  />
                )}
              </div>
            </RadioGroup>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleRejectConfirm();
              }}
              disabled={rejectionType === "other" && !customReason.trim()}
            >
              {processingId === rejectProductId ? (
                <Spinner />
              ) : null}
              Reject Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  // Component for the All Products tab
  function AllProductsTab() {
    return (
      <TabsContent value="all">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
                {products.map((product) => (
                  <TableRow 
                    key={product.product_id} 
                    className="cursor-pointer"
                    onClick={() => onProductClick(product)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded">
                          <AvatarImage
                            src={product.images?.[0]?.url || "/placeholder-product.svg"}
                            alt={product.name}
                          />
                          <AvatarFallback>
                            {product.name?.substring(0, 2).toUpperCase() || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {product.description?.substring(0, 50) || "No description"}
                            {product.description && product.description?.length > 50 ? "..." : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.sku || "N/A"}</TableCell>
                    <TableCell>{formatPrice(product.base_price)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(
                          product.verification_status || "pending",
                          product.is_active
                        )}
                      >
                        {getStatusDisplayText(product)}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.created_at}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/products/${product.product_id}`);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/products/${product.product_id}/edit`);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {product.verification_status === "pending" && (
                            <>
                              <DropdownMenuItem
                                disabled={!!processingId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(product.product_id, "approve");
                                }}
                              >
                                {processingId === product.product_id ? (
                                  <Spinner />
                                ) : (
                                  <Check className="mr-2 h-4 w-4" />
                                )}
                                Approve Product
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={!!processingId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(product.product_id, "reject");
                                }}
                              >
                                {processingId === product.product_id ? (
                                  <Spinner className="mr-2 h-4 w-4" />
                                ) : (
                                  <XCircle className="mr-2 h-4 w-4" />
                                )}
                                Reject Product
                              </DropdownMenuItem>
                            </>
                          )}
                          {product.verification_status === "approved" && (
                            <>
                              {product.is_active ? (
                                <DropdownMenuItem
                                  disabled={!!processingId}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(product.product_id, "unpublish");
                                  }}
                                >
                                  {processingId === product.product_id ? (
                                    <Spinner className="mr-2 h-4 w-4" />
                                  ) : (
                                    <XCircle className="mr-2 h-4 w-4" />
                                  )}
                                  Unpublish (Draft)
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  disabled={!!processingId}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(product.product_id, "publish");
                                  }}
                                >
                                  {processingId === product.product_id ? (
                                    <Spinner className="mr-2 h-4 w-4" />
                                  ) : (
                                    <Check className="mr-2 h-4 w-4" />
                                  )}
                                  Publish Product
                                </DropdownMenuItem>
                              )}
                            </>
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
    );
  }

  // Component for the Published Products tab
  function PublishedProductsTab() {
    return (
      <TabsContent value="published">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publishedProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No published products found
                    </TableCell>
                  </TableRow>
                )}
                {publishedProducts.map((product) => (
                  <TableRow 
                    key={product.product_id} 
                    className="cursor-pointer"
                    onClick={() => onProductClick(product)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded">
                          <AvatarImage
                            src={product.images?.[0]?.url || "/placeholder-product.svg"}
                            alt={product.name}
                          />
                          <AvatarFallback>
                            {product.name?.substring(0, 2).toUpperCase() || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {product.description?.substring(0, 50) || "No description"}
                            {product.description && product.description?.length > 50 ? "..." : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.sku || "N/A"}</TableCell>
                    <TableCell>{formatPrice(product.base_price)}</TableCell>
                    <TableCell>{product.created_at}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/products/${product.product_id}`);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/products/${product.product_id}/edit`);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={!!processingId}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(product.product_id, "unpublish");
                            }}
                          >
                            {processingId === product.product_id ? (
                              <Spinner className="mr-2 h-4 w-4" />
                            ) : (
                              <XCircle className="mr-2 h-4 w-4" />
                            )}
                            Unpublish (Draft)
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
    );
  }
  
  // Component for the Draft Products tab
  function DraftProductsTab() {
    return (
      <TabsContent value="draft">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No draft products found
                    </TableCell>
                  </TableRow>
                )}
                {draftProducts.map((product) => (
                  <TableRow 
                    key={product.product_id} 
                    className="cursor-pointer"
                    onClick={() => onProductClick(product)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded">
                          <AvatarImage
                            src={product.images?.[0]?.url || "/placeholder-product.svg"}
                            alt={product.name}
                          />
                          <AvatarFallback>
                            {product.name?.substring(0, 2).toUpperCase() || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {product.description?.substring(0, 50) || "No description"}
                            {product.description && product.description?.length > 50 ? "..." : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.sku || "N/A"}</TableCell>
                    <TableCell>{formatPrice(product.base_price)}</TableCell>
                    <TableCell>{product.created_at}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/products/${product.product_id}`);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/products/${product.product_id}/edit`);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={!!processingId}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(product.product_id, "publish");
                            }}
                          >
                            {processingId === product.product_id ? (
                              <Spinner className="mr-2 h-4 w-4" />
                            ) : (
                              <Check className="mr-2 h-4 w-4" />
                            )}
                            Publish Product
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
    );
  }

  // Component for the Pending Products tab
  function PendingProductsTab() {
    return (
      <TabsContent value="pending">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No pending products found
                    </TableCell>
                  </TableRow>
                )}
                {pendingProducts.map((product) => (
                  <TableRow 
                    key={product.product_id} 
                    className="cursor-pointer"
                    onClick={() => onProductClick(product)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded">
                          <AvatarImage
                            src={product.images?.[0]?.url || "/placeholder-product.svg"}
                            alt={product.name}
                          />
                          <AvatarFallback>
                            {product.name?.substring(0, 2).toUpperCase() || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {product.description?.substring(0, 50) || "No description"}
                            {product.description && product.description?.length > 50 ? "..." : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.sku || "N/A"}</TableCell>
                    <TableCell>{formatPrice(product.base_price)}</TableCell>
                    <TableCell>{product.created_at}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          disabled={!!processingId}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(product.product_id, "approve");
                          }}
                        >
                          {processingId === product.product_id ? (
                            <Spinner className="mr-1 h-3 w-3" />
                          ) : (
                            <Check className="mr-1 h-3 w-3" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-red-500 hover:text-red-600"
                          disabled={!!processingId}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(product.product_id, "reject");
                          }}
                        >
                          {processingId === product.product_id ? (
                            <Spinner className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          Reject
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
    );
  }

  // Component for the Rejected Products tab
  function RejectedProductsTab() {
    return (
      <TabsContent value="rejected">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rejection Reason</TableHead>
                  <TableHead>Rejected Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rejectedProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No rejected products found
                    </TableCell>
                  </TableRow>
                )}
                {rejectedProducts.map((product) => (
                  <TableRow 
                    key={product.product_id} 
                    className="cursor-pointer"
                    onClick={() => onProductClick(product)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded">
                          <AvatarImage
                            src={product.images?.[0]?.url || "/placeholder-product.svg"}
                            alt={product.name}
                          />
                          <AvatarFallback>
                            {product.name?.substring(0, 2).toUpperCase() || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {product.description?.substring(0, 50) || "No description"}
                            {product.description && product.description?.length > 50 ? "..." : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.sku || "N/A"}</TableCell>
                    <TableCell>{formatPrice(product.base_price)}</TableCell>
                    <TableCell>
                      <div className="max-w-[250px] truncate" title={product.rejection_reason}>
                        <span className="flex items-center gap-1 text-destructive">
                          <AlertTriangle className="h-4 w-4" />
                          {product.rejection_reason || "No reason provided"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{product.rejected_at}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/products/${product.product_id}`);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/products/${product.product_id}/edit`);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Product
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
    );
  }
}
