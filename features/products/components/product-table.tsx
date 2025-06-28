"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

import { Product } from "../types";

interface ProductTableProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onUpdateProduct: (
    productId: string,
    data: Partial<Product>
  ) => Promise<void>;
  onDelete: (product: Product) => void;
}

export function ProductTable({
  products,
  onProductClick,
  onUpdateProduct,
  onDelete,
}: ProductTableProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [productToReject, setProductToReject] = useState<Product | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async (productId: string) => {
    setProcessingId(productId);
    try {
      await onUpdateProduct(productId, { verification_status: "approved" });
    } catch (error) {
      // Error is handled in the parent component's toast
    } finally {
      setProcessingId(null);
    }
  };

  const handleSuspend = async (productId: string) => {
    setProcessingId(productId);
    try {
      await onUpdateProduct(productId, { verification_status: "suspended" });
    } catch (error) {
      // Error is handled in the parent component's toast
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (product: Product) => {
    setProductToReject(product);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!productToReject) return;
    await onUpdateProduct(productToReject.product_id, {
      verification_status: "rejected",
      rejection_reason: rejectionReason,
    });
    setShowRejectDialog(false);
    setRejectionReason("");
    setProductToReject(null);
  };

  const handleToggleIsActive = (product: Product) => {
    onUpdateProduct(product.product_id, { is_active: !product.is_active });
  };

  const getApprovalStatusBadge = (status: Product["verification_status"]) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "suspended":
        return <Badge variant="warning">Suspended</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean | undefined) => {
    return isActive ? (
      <Badge variant="default">Published</Badge>
    ) : (
      <Badge variant="outline">Draft</Badge>
    );
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM, yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Approval Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow
                    key={product.product_id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => onProductClick(product)}
                  >
                    <TableCell
                      className="font-medium"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-md">
                          <AvatarImage
                            src={product.images?.[0]?.url || ""}
                            alt={product.name}
                          />
                          <AvatarFallback className="rounded-md">
                            {product.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            SKU: {product.sku || "N/A"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.categories?.slice(0, 2).map((cat) => (
                          <Badge key={cat.category_id} variant="secondary">
                            {cat.name}
                          </Badge>
                        ))}
                        {product.categories && product.categories.length > 2 && (
                          <Badge variant="outline">
                            +{product.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getApprovalStatusBadge(product.verification_status)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(product.is_active)}
                    </TableCell>
                    <TableCell>
                      {`Tsh ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(product.base_price ?? 0)}`}
                    </TableCell>
                    <TableCell>{formatDate(product.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        {processingId === product.product_id ? (
                          <Spinner size="sm" />
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/products/${product.product_id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/products/${product.product_id}/edit`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {product.verification_status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleApprove(product.product_id)}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleReject(product)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {product.verification_status === "approved" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleToggleIsActive(product)}
                                  >
                                    {product.is_active ? (
                                      <>
                                        <ToggleLeft className="mr-2 h-4 w-4" />
                                        Unpublish
                                      </> 
                                    ) : (
                                      <>
                                        <ToggleRight className="mr-2 h-4 w-4" />
                                        Publish
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleSuspend(product.product_id)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4 text-yellow-500" />
                                    Suspend
                                  </DropdownMenuItem>
                                </>
                              )}
                              {product.verification_status === "suspended" && (
                                <DropdownMenuItem
                                  onClick={() => handleApprove(product.product_id)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No products found for the selected filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Product</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting "
              {productToReject?.name}". This will be visible to the vendor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="e.g., Images are low quality, description is incomplete, etc."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim() || !!processingId}
            >
              {processingId === productToReject?.product_id ? <Spinner size="sm" className="mr-2"/> : null}
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}