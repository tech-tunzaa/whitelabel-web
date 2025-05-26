// Temporary file to hold fixed components
// Copy these components into delivery-partner-form.tsx

function DocumentsTab() {
  // Define document types for KYC documents
  const documentTypes = [
    { id: "national_id", name: "National ID" },
    { id: "passport", name: "Passport" },
    { id: "driver_license", name: "Driver's License" },
    { id: "vehicle_registration", name: "Vehicle Registration" },
    { id: "vehicle_insurance", name: "Vehicle Insurance" },
    { id: "bank_statement", name: "Bank Statement" }
  ]
  
  // State to store documents
  const [documents, setDocuments] = useState<DocumentWithMeta[]>([])
  
  // Get the existing documents from form values if available
  const formValues = form.getValues();
  const existingKycDocuments = formValues?.kyc?.documents || [];
  
  // Initialize documents with existing data
  useEffect(() => {
    if (existingKycDocuments.length > 0) {
      const initialDocs = existingKycDocuments.map((doc: any) => ({
        id: doc.type,
        document_id: doc.type,
        document_type: doc.type,
        document_url: doc.link,
        file_name: doc.type,
        verification_status: doc.verified ? "verified" : "pending",
        number: doc.number
      }));
      setDocuments(initialDocs);
    }
  }, [existingKycDocuments]);
  
  // Update form values when documents change
  const handleDocumentsChange = (updatedDocuments: DocumentWithMeta[]) => {
    setDocuments(updatedDocuments);
    
    // Convert to the format expected by the form schema
    const formattedDocuments = updatedDocuments.map(doc => ({
      type: doc.document_type,
      number: doc.number || "",
      link: doc.document_url || "",
      verified: doc.verification_status === "verified"
    }));
    
    // Update the form values
    form.setValue("kyc.documents", formattedDocuments);
  };
  
  return (
    <TabsContent value="documents" className="space-y-6 pt-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">KYC Documents</h3>
        <DocumentUpload
          id="kyc-documents"
          label="Upload Identity Documents"
          description="Upload clear images of your identity documents such as National ID, Passport, Driver's License, Vehicle Registration, etc."
          documentTypes={documentTypes}
          existingDocuments={documents}
          onDocumentsChange={handleDocumentsChange}
          className="w-full"
        />
      </div>
    </TabsContent>
  )
}

function ReviewTab() {
  // Create safe function to render KYC documents
  const renderKycDocuments = () => {
    const kycDocs = form.watch("kyc.documents");
    if (!kycDocs || kycDocs.length === 0) {
      return <p className="text-sm text-muted-foreground">No documents uploaded.</p>;
    }
    
    return (
      <ul className="list-disc list-inside">
        {kycDocs.map((doc: any, index: number) => (
          <li key={index} className="text-sm">
            {doc.type}: {doc.number || "No number provided"}
            {doc.verified && " (Verified)"}
          </li>
        ))}
      </ul>
    );
  };
  
  return (
    <TabsContent value="review" className="space-y-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Business Name</h4>
              <p className="text-base">{form.watch("businessName") || "—"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
              <p className="text-base">{form.watch("email") || "—"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
              <p className="text-base">{form.watch("phone") || "—"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
              <p className="text-base">{form.watch("type") || "—"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Tax ID</h4>
              <p className="text-base">{form.watch("taxId") || "—"}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Business Description
          </h4>
          <p className="text-base">{form.watch("description") || "—"}</p>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Business Address</h3>
          <p className="text-base">{form.watch("street") || "—"}</p>
          <p className="text-base">
            {form.watch("city") || "—"},{" "}
            {form.watch("state") || "—"}{" "}
            {form.watch("zip") || "—"}
          </p>
          <p className="text-base">{form.watch("country") || "—"}</p>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Service Area</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Latitude</h4>
              <p className="text-base">{form.watch("latitude") || "—"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Longitude</h4>
              <p className="text-base">{form.watch("longitude") || "—"}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Vehicle Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Vehicle Type</h4>
              <p className="text-base">{form.watch("vehicleType") || "—"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Vehicle Plate Number</h4>
              <p className="text-base">{form.watch("plateNumber") || "—"}</p>
            </div>
            {verificationSuccess && (
              <div className="mt-2 border-t pt-2">
                <h4 className="text-sm font-medium text-green-700">Verified Vehicle Details</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                  <div>
                    <span className="text-xs text-muted-foreground">Make:</span>
                    <p className="text-sm">{form.watch("vehicleMake") || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Model:</span>
                    <p className="text-sm">{form.watch("vehicleModel") || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Year:</span>
                    <p className="text-sm">{form.watch("vehicleYear") || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Insurance:</span>
                    <p className="text-sm">{form.watch("vehicleInsurance") || "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Commission & Rider Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Commission Percentage</h4>
              <p className="text-base">{form.watch("commissionPercent") || "—"}%</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Rider Name</h4>
              <p className="text-base">{form.watch("riderName") || "—"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Rider Phone</h4>
              <p className="text-base">{form.watch("riderPhone") || "—"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Rider Email</h4>
              <p className="text-base">{form.watch("riderEmail") || "—"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Rider License</h4>
              <p className="text-base">{form.watch("riderLicense") || "—"}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Uploaded Documents</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">KYC Documents</h4>
              {renderKycDocuments()}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            By submitting this application, you confirm that all
            information provided is accurate and complete. The
            delivery partner application will be reviewed by our team, and
            you will be notified once a decision has been made.
          </p>
        </div>
      </div>
    </TabsContent>
  );
}
