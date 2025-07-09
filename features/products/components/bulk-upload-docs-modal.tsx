import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, XCircle, Info, AlertTriangle } from "lucide-react";

interface BulkUploadDocsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadTemplate?: () => void;
}

const sections = [
  { id: "structure", label: "Folder Structure" },
  { id: "customize", label: "Customize CSV" },
  { id: "images", label: "Replace Images" },
  { id: "folders", label: "Folder Rules" },
  { id: "zip", label: "Create ZIP" },
  { id: "upload", label: "Upload & Monitor" },
  { id: "validation", label: "Validation & Issues" },
  { id: "limits", label: "File Limits" },
  { id: "support", label: "Support" },
];

export const BulkUploadDocsModal: React.FC<BulkUploadDocsModalProps> = ({ open, onOpenChange, onDownloadTemplate }) => {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90vw] w-full max-h-[95vh] overflow-auto p-0 bg-background">
        {/* Sticky Close Button (only one) */}
        <button
          className="absolute top-4 right-4 z-20 rounded-full p-2 hover:bg-muted transition"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <XCircle className="h-6 w-6 text-muted-foreground" />
        </button>
        <div className="flex flex-col md:flex-row h-full relative">
          {/* Sidebar TOC */}
          <aside className="hidden md:flex flex-col gap-2 min-w-[220px] max-w-[240px] max-h-[95vh] border-r bg-muted/40 p-6 h-full sticky top-0 self-start" style={{ alignSelf: 'flex-start' }}>
            <h3 className="text-lg font-semibold mb-4">Guide Contents</h3>
            {sections.map((s) => (
              <button
                key={s.id}
                className="text-left px-2 py-1 rounded hover:bg-primary/10 focus:bg-primary/20 transition text-sm font-medium focus:outline-none"
                onClick={() => scrollToSection(s.id)}
              >
                {s.label}
              </button>
            ))}
          </aside>
          {/* Main Content */}
          <main className="flex-1 max-h-[95vh] overflow-y-auto p-0 md:p-8">
            <div className="w-full bg-white dark:bg-muted/60 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Bulk Product Upload Guide</h1>
                  <p className="text-lg text-muted-foreground">
                    Follow these steps to upload products in bulk using a ZIP file containing your CSV and product images. See the sample structure and tips below.
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="primary"
                  className="flex items-center gap-2 whitespace-nowrap"
                  onClick={onDownloadTemplate}
                  disabled={!onDownloadTemplate}
                >
                  <FileDown className="h-5 w-5" /> Download CSV Template
                </Button>
              </div>
              <div className="w-full text-base space-y-10">
                {/* Folder Structure */}
                <div ref={el => { sectionRefs.current["structure"] = el; }} id="structure" className="mb-10 scroll-mt-24">
                  <h2 className="text-2xl font-bold">Folder Structure Example</h2>
                  <div className="bg-muted p-4 rounded border text-xs overflow-x-auto mb-4">
<pre>{`products_upload_sample/
├── products.csv
├── Gaming Laptop Pro/
│   ├── main.jpg
│   ├── side-view.jpg
│   └── detail.jpg
├── Wireless Noise-Canceling Headphones/
│   ├── main.jpg
│   └── lifestyle.jpg
... (other product folders)
`}</pre>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><b>products.csv</b> must be in the root of the ZIP.</li>
                    <li>Each product image folder must match the <b>name</b> column in the CSV exactly (case-sensitive).</li>
                    <li>Each folder may contain multiple images for that product.</li>
                  </ul>
                </div>
                {/* Customize CSV */}
                <div ref={el => { sectionRefs.current["customize"] = el; }} id="customize" className="mb-10 scroll-mt-24">
                  <h2 className="text-2xl font-bold">Customize the CSV</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Edit <b>products.csv</b> with your actual product data.</li>
                    <li>Ensure all required fields are filled.</li>
                    <li>Use your actual categories (must exist in the system).</li>
                    <li>Set appropriate prices and inventory levels.</li>
                  </ul>
                  <div className="mt-4">
                    <b>Required fields:</b> name, sku, description, base_price, categories<br />
                    <b>Optional fields:</b> slug, short_description, barcode, sale_price, cost_price, inventory_quantity, tags, weight, is_active, is_featured, requires_shipping, low_stock_threshold
                  </div>
                </div>
                {/* Replace Images */}
                <div ref={el => { sectionRefs.current["images"] = el; }} id="images" className="mb-10 scroll-mt-24">
                  <h2 className="text-2xl font-bold">Replace Placeholder Images</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Replace all placeholder <code>.jpg</code> files with actual product images.</li>
                    <li><b>Supported formats:</b> JPG, JPEG, PNG, WebP</li>
                    <li><b>Size limit:</b> Maximum 5MB per image</li>
                    <li><b>Recommended resolution:</b> 800x600 pixels minimum</li>
                    <li><b>Quality:</b> High quality for best customer experience</li>
                  </ul>
                </div>
                {/* Folder Rules */}
                <div ref={el => { sectionRefs.current["folders"] = el; }} id="folders" className="mb-10 scroll-mt-24">
                  <h2 className="text-2xl font-bold">Folder Structure Rules</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Folder names must match product names in CSV exactly (case-sensitive).</li>
                    <li>Each product can have multiple images.</li>
                    <li>Images are sorted alphabetically (first image becomes main product image).</li>
                    <li>Use descriptive filenames for better organization.</li>
                  </ul>
                </div>
                {/* Create ZIP (no commands, just instructions) */}
                <div ref={el => { sectionRefs.current["zip"] = el; }} id="zip" className="mb-10 scroll-mt-24">
                  <h2 className="text-2xl font-bold">Create ZIP File</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Ensure your <b>products.csv</b> and all product image folders are inside a single parent folder (e.g., <code>products_upload_sample/</code>).</li>
                    <li>Right-click the folder and select <b>"Compress"</b> or <b>"Send to ZIP"</b> (depending on your operating system), or use your preferred ZIP tool.</li>
                    <li>The resulting ZIP file should contain <b>products.csv</b> and all product folders at the root level.</li>
                    <li>Do not include extra files (like <code>README.md</code>) unless required.</li>
                  </ul>
                </div>
                {/* Upload & Monitor */}
                <div ref={el => { sectionRefs.current["upload"] = el; }} id="upload" className="mb-10 scroll-mt-24">
                  <h2 className="text-2xl font-bold">Upload & Monitor</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Use the <b>Bulk Upload</b> tab to upload your ZIP file.</li>
                    <li>Monitor processing progress and review validation results.</li>
                    <li>Fix any errors and approve the batch once ready.</li>
                  </ul>
                </div>
                {/* Validation & Issues */}
                <div ref={el => { sectionRefs.current["validation"] = el; }} id="validation" className="mb-10 scroll-mt-24">
                  <h2 className="text-2xl font-bold">Validation Requirements & Common Issues</h2>
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded p-4 flex items-center gap-3 my-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                    <ul className="list-disc pl-5 space-y-1">
                      <li>All category names must exist in your marketplace (case-sensitive).</li>
                      <li>SKUs must be unique across your store.</li>
                      <li>base_price must be greater than 0; sale_price (if provided) should be less than base_price.</li>
                      <li>Each product should have at least one image; folder names must match product names exactly.</li>
                      <li>Common errors: missing categories, duplicate SKUs, invalid prices, missing images, folder mismatch, unsupported format, file too large, corrupted files.</li>
                    </ul>
                  </div>
                </div>
                {/* File Limits */}
                <div ref={el => { sectionRefs.current["limits"] = el; }} id="limits" className="mb-10 scroll-mt-24">
                  <h2 className="text-2xl font-bold">File Limits</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><b>CSV files:</b> Maximum 10 MB</li>
                    <li><b>ZIP files:</b> Maximum 100 MB</li>
                    <li><b>Individual images:</b> Maximum 5 MB</li>
                    <li><b>Total images per batch:</b> Maximum 500 MB</li>
                    <li><b>Recommended batch size:</b> Maximum 1000 products</li>
                  </ul>
                </div>
                {/* Support */}
                <div ref={el => { sectionRefs.current["support"] = el; }} id="support" className="mb-4 scroll-mt-24">
                  <h2 className="text-2xl font-bold">Support</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Check validation errors in batch details.</li>
                    <li>Review the user guide documentation.</li>
                    <li>Contact your system administrator or submit a support ticket with batch ID and error details.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 