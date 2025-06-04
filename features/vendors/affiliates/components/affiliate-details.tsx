import React from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, FileText, Building, CreditCard, MapPin, Phone, Mail, Globe, User } from "lucide-react";
import { Affiliate } from "../types";
import { formatDate } from "@/lib/utils";

interface AffiliateDetailsProps {
  affiliate: Affiliate;
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
}

export function AffiliateDetails({ affiliate, onApprove, onReject, onEdit }: AffiliateDetailsProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{affiliate.affiliate_name}</h1>
          <p className="text-muted-foreground">
            Affiliate ID: {affiliate.affiliate_id} • Status: {getStatusBadge(affiliate.verification_status)}
          </p>
        </div>
        <div className="flex space-x-2">
          {affiliate.verification_status === "pending" && (
            <>
              {onApprove && (
                <Button onClick={onApprove} variant="outline" className="gap-1">
                  <Check className="h-4 w-4" /> Approve
                </Button>
              )}
              {onReject && (
                <Button onClick={onReject} variant="outline" className="gap-1">
                  <X className="h-4 w-4" /> Reject
                </Button>
              )}
            </>
          )}
          {onEdit && (
            <Button onClick={onEdit} variant="default">
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Contact Person</div>
                <div>{affiliate.contact_person}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" /> Email
                  </div>
                </div>
                <div>{affiliate.contact_email}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" /> Phone
                  </div>
                </div>
                <div>{affiliate.contact_phone}</div>
              </div>

              {affiliate.website && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" /> Website
                    </div>
                  </div>
                  <div>
                    <a 
                      href={affiliate.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {affiliate.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Address</div>
                <div>{affiliate.address_line1}</div>
                {affiliate.address_line2 && <div>{affiliate.address_line2}</div>}
                <div>{affiliate.city}, {affiliate.state_province} {affiliate.postal_code}</div>
                <div>{affiliate.country}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Vendor ID</div>
                <div>{affiliate.vendor_id}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Commission Rate</div>
                <div>{affiliate.commission_rate}%</div>
              </div>

              {affiliate.tax_id && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Tax ID</div>
                  <div>{affiliate.tax_id}</div>
                </div>
              )}

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(affiliate.verification_status)}
                  {affiliate.is_active ? (
                    <Badge variant="outline" className="bg-green-50">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50">Inactive</Badge>
                  )}
                </div>
              </div>

              {affiliate.approved_at && affiliate.verification_status === "approved" && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Approved At</div>
                  <div>{affiliate.approved_at}</div>
                </div>
              )}

              {affiliate.rejection_reason && affiliate.verification_status === "rejected" && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Rejection Reason</div>
                  <div className="text-red-600">{affiliate.rejection_reason}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Banking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {affiliate.bank_account && (
                <>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Bank Name</div>
                    <div>{affiliate.bank_account.bank_name}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Account Name</div>
                    <div>{affiliate.bank_account.account_name}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Account Number</div>
                    <div>{affiliate.bank_account.account_number}</div>
                  </div>

                  {affiliate.bank_account.branch_code && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Branch Code</div>
                      <div>{affiliate.bank_account.branch_code}</div>
                    </div>
                  )}

                  {affiliate.bank_account.swift_bic && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">SWIFT/BIC</div>
                      <div>{affiliate.bank_account.swift_bic}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Documents */}
      {affiliate.verification_documents && affiliate.verification_documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Verification Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {affiliate.verification_documents.map((document, index) => (
                <div key={document.document_id || index} className="space-y-2">
                  <div className="rounded-md border p-2">
                    <img 
                      src={document.document_url} 
                      alt={document.file_name || document.document_type}
                      className="h-36 w-full object-cover"
                    />
                    <div className="mt-2 space-y-1 p-2">
                      <div className="font-medium">{document.file_name || document.document_type}</div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {document.document_type.replace('_', ' ')}
                        </span>
                        {getStatusBadge(document.verification_status || 'pending')}
                      </div>
                      {document.submitted_at && (
                        <div className="text-xs text-muted-foreground">
                          Submitted: {formatDate(document.submitted_at)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <div className="font-medium">Affiliate Created</div>
                <div className="text-sm text-muted-foreground">{formatDate(affiliate.created_at)}</div>
              </div>
            </div>

            {affiliate.updated_at && affiliate.updated_at !== affiliate.created_at && (
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <div className="font-medium">Last Updated</div>
                  <div className="text-sm text-muted-foreground">{formatDate(affiliate.updated_at)}</div>
                </div>
              </div>
            )}

            {affiliate.approved_at && (
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <div className="font-medium">Approved</div>
                  <div className="text-sm text-muted-foreground">{formatDate(affiliate.approved_at)}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
