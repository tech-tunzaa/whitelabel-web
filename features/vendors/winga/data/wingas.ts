import { Winga } from "../types";

export const wingas: Winga[] = [
  {
    winga_id: "wnga001",
    tenant_id: "tnt001",
    vendor_id: "vnd001",
    affiliate_name: "Tech Connect Solutions",
    contact_person: "James Mbwambo",
    contact_email: "james@techconnect.co.tz",
    contact_phone: "+255 745 123 456",
    website: "https://techconnect.co.tz",
    address_line1: "Mikocheni B, Plot 221",
    city: "Dar es Salaam",
    state_province: "Dar es Salaam",
    postal_code: "14110",
    country: "Tanzania",
    tax_id: "TIN-76543210",
    commission_rate: "7.5",
    bank_account: {
      bank_name: "CRDB Bank",
      account_number: "0150123456789",
      account_name: "Tech Connect Solutions Ltd",
      branch_code: "015",
    },
    verification_documents: [
      {
        document_id: "doc001",
        document_type: "id_document",
        document_url: "/placeholder.svg?height=200&width=300",
        file_name: "ID_Front.jpg",
        verification_status: "approved",
        submitted_at: "2024-02-15T08:30:00Z",
        verified_at: "2024-02-16T10:15:00Z"
      },
      {
        document_id: "doc002",
        document_type: "business_license",
        document_url: "/placeholder.svg?height=200&width=300",
        file_name: "Business_License.pdf",
        verification_status: "approved",
        submitted_at: "2024-02-15T08:35:00Z",
        verified_at: "2024-02-16T10:15:00Z"
      }
    ],
    verification_status: "approved",
    is_active: true,
    created_at: "2024-02-15T08:30:00Z",
    updated_at: "2024-02-16T10:15:00Z",
    approved_at: "2024-02-16T10:15:00Z"
  },
  {
    winga_id: "wnga002",
    tenant_id: "tnt001",
    vendor_id: "vnd002",
    affiliate_name: "Safari Connections",
    contact_person: "Maria Njau",
    contact_email: "maria@safariconnections.co.tz",
    contact_phone: "+255 765 234 567",
    address_line1: "Arusha CBD, Plot 45",
    city: "Arusha",
    state_province: "Arusha",
    postal_code: "23101",
    country: "Tanzania",
    tax_id: "TIN-87654321",
    commission_rate: "8.0",
    bank_account: {
      bank_name: "NMB Bank",
      account_number: "0221987654321",
      account_name: "Safari Connections Ltd",
      branch_code: "022",
    },
    verification_documents: [
      {
        document_id: "doc003",
        document_type: "id_document",
        document_url: "/placeholder.svg?height=200&width=300",
        file_name: "ID_Front.jpg",
        verification_status: "pending",
        submitted_at: "2024-03-10T14:20:00Z"
      }
    ],
    verification_status: "pending",
    is_active: false,
    created_at: "2024-03-10T14:20:00Z",
    updated_at: "2024-03-10T14:20:00Z"
  },
  {
    winga_id: "wnga003",
    tenant_id: "tnt001",
    vendor_id: "vnd003",
    affiliate_name: "Digital Marketing Tanzania",
    contact_person: "John Mwakyusa",
    contact_email: "john@digitalmarketing.co.tz",
    contact_phone: "+255 789 345 678",
    website: "https://digitalmarketing.co.tz",
    address_line1: "Upanga East, Plot 78",
    address_line2: "3rd Floor, Upanga Plaza",
    city: "Dar es Salaam",
    state_province: "Dar es Salaam",
    postal_code: "11101",
    country: "Tanzania",
    tax_id: "TIN-98765432",
    commission_rate: "9.0",
    bank_account: {
      bank_name: "Stanbic Bank",
      account_number: "0335123987654",
      account_name: "Digital Marketing Tanzania Ltd",
      branch_code: "033",
    },
    verification_documents: [
      {
        document_id: "doc004",
        document_type: "id_document",
        document_url: "/placeholder.svg?height=200&width=300",
        file_name: "ID_Front.jpg",
        verification_status: "rejected",
        rejection_reason: "Document expired",
        submitted_at: "2024-01-05T09:45:00Z",
        verified_at: "2024-01-06T11:30:00Z"
      },
      {
        document_id: "doc005",
        document_type: "business_license",
        document_url: "/placeholder.svg?height=200&width=300",
        file_name: "Business_License.pdf",
        verification_status: "approved",
        submitted_at: "2024-01-05T09:50:00Z",
        verified_at: "2024-01-06T11:30:00Z"
      }
    ],
    verification_status: "rejected",
    rejection_reason: "Personal identification document expired",
    is_active: false,
    created_at: "2024-01-05T09:45:00Z",
    updated_at: "2024-01-06T11:30:00Z"
  }
];
