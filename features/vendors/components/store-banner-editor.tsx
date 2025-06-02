"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash, Plus } from "lucide-react";
import { StoreBanner } from "../types";
import { FormMessage } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useVendorStore } from "../store";
import { v4 as uuidv4 } from "uuid";

interface StoreBannerEditorProps {
  banners: StoreBanner[];
  onChange: (banners: StoreBanner[]) => void;
  storeId?: string;
  vendorId?: string;
  readOnly?: boolean;
  className?: string;
}

export function StoreBannerEditor({
  banners = [],
  onChange,
  storeId,
  vendorId,
  readOnly = false,
  className = "",
}: StoreBannerEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const vendorStore = useVendorStore();

  // Add a new banner with default values
  const addBanner = () => {
    const newBanner: StoreBanner = {
      title: "",
      image_url: "",
      alt_text: "",
      display_order: banners.length + 1,
      is_active: true,
    };
    
    onChange([...banners, newBanner]);
  };

  // Remove a banner by index
  const removeBanner = async (index: number, bannerId?: string) => {
    // If we have a store ID and the banner exists on the server, delete it through API
    if (storeId && bannerId) {
      try {
        setIsDeleting(bannerId);
        
        // Set up headers for API request if we have a tenant ID
        const headers: Record<string, string> = {};
        
        await vendorStore.deleteStoreBanner(storeId, bannerId, headers);
        toast.success("Banner deleted successfully");
      } catch (error) {
        console.error("Error deleting banner:", error);
        toast.error("Failed to delete banner");
        setIsDeleting(null);
        return; // Don't proceed with UI update if API call fails
      } finally {
        setIsDeleting(null);
      }
    }
    
    // Update the UI state
    const updatedBanners = [...banners];
    updatedBanners.splice(index, 1);
    onChange(updatedBanners);
  };

  // Update a banner field by index
  const updateBanner = (index: number, field: string, value: string | boolean | number) => {
    const updatedBanners = [...banners];
    updatedBanners[index] = {
      ...updatedBanners[index],
      [field]: value,
    };
    onChange(updatedBanners);
  };

  // Handle image upload for a banner
  const handleImageUpload = async (index: number, file: File) => {
    setIsUploading(true);
    
    try {
      // TODO: Replace with actual image upload logic using your upload service
      // For now, we'll just use a placeholder URL
      const imageUrl = URL.createObjectURL(file);
      
      // If we have a storeId and this is an existing banner, update it through API
      if (storeId && vendorId && banners[index].id) {
        // Set up headers for API request if we have a tenant ID
        const headers: Record<string, string> = {};
        
        // Call the API to update the banner
        await vendorStore.updateStore(
          vendorId,
          storeId,
          {
            banners: [
              {
                ...banners[index],
                image_url: imageUrl,
              }
            ]
          },
          headers
        );
      }
      
      // Update the banner in the local state
      updateBanner(index, "image_url", imageUrl);
      toast.success("Banner image uploaded successfully");
    } catch (error) {
      console.error("Error uploading banner image:", error);
      toast.error("Failed to upload banner image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Store Banners</h3>
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBanner}
            disabled={isUploading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Banner
          </Button>
        )}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No banners added yet
        </div>
      )}

      <div className="space-y-6">
        {banners.map((banner, index) => (
          <div
            key={banner.id || `new-banner-${index}`}
            className="border rounded-md p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Banner {index + 1}</h4>
              {!readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBanner(index, banner.id)}
                  disabled={isDeleting === banner.id}
                >
                  {isDeleting === banner.id ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <Trash className="h-4 w-4 mr-1 text-red-500" />
                  )}
                  <span className="text-red-500">Remove</span>
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor={`banner-title-${index}`}>Title</Label>
                <Input
                  id={`banner-title-${index}`}
                  value={banner.title}
                  onChange={(e) => updateBanner(index, "title", e.target.value)}
                  placeholder="Banner Title"
                  disabled={readOnly}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor={`banner-alt-${index}`}>Alt Text</Label>
                <Input
                  id={`banner-alt-${index}`}
                  value={banner.alt_text}
                  onChange={(e) => updateBanner(index, "alt_text", e.target.value)}
                  placeholder="Banner Alt Text"
                  disabled={readOnly}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Banner Image</Label>
                <div className="mt-1">
                  <ImageUpload
                    value={banner.image_url}
                    onChange={(file) => handleImageUpload(index, file)}
                    disabled={readOnly || isUploading}
                    onReset={() => updateBanner(index, "image_url", "")}
                  />
                  {!banner.image_url && (
                    <FormMessage>Please upload a banner image</FormMessage>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor={`banner-order-${index}`}>Display Order</Label>
                <Input
                  id={`banner-order-${index}`}
                  type="number"
                  value={banner.display_order}
                  onChange={(e) => updateBanner(index, "display_order", parseInt(e.target.value))}
                  placeholder="Display Order"
                  disabled={readOnly}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id={`banner-active-${index}`}
                  type="checkbox"
                  checked={banner.is_active}
                  onChange={(e) => updateBanner(index, "is_active", e.target.checked)}
                  disabled={readOnly}
                  className="h-4 w-4"
                />
                <Label htmlFor={`banner-active-${index}`}>Active</Label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
