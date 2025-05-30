import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { RewardsConfig } from "../types";
import { useRewardsStore } from "../store";

export function RewardsSettingsForm() {
  const { config, updateConfig, loading, fetchConfig } = useRewardsStore();
  // Using sonner toast directly
  
  // Set default form data that doesn't depend on loading config
  const defaultConfig = {
    pointsPerTzs: 100,
    redemption: {
      points: 100,
      value: 500,
    },
    referralBonus: 50,
  };
  
  const [formData, setFormData] = useState<RewardsConfig>(defaultConfig);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load config once on mount and update form data
  useEffect(() => {
    // Fetch config if it doesn't exist
    if (!config) {
      fetchConfig()
        .then(loadedConfig => {
          if (loadedConfig) {
            setFormData(loadedConfig);
          }
        })
        .catch(err => {
          console.error('Failed to load config:', err);
          // Keep using default values if fetch fails
        });
    } else {
      // Use existing config if available
      setFormData(config);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "redemption.points" || name === "redemption.value") {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof RewardsConfig] as any,
          [child]: parseInt(value) || 0,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateConfig(formData);
      toast.success("Settings updated", {
        description: "Rewards configuration has been updated successfully",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update rewards configuration",
      });
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="flex items-center gap-2">
          <span className="p-1.5 rounded-full bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="M20 12h2" />
              <path d="M2 12h2" />
            </svg>
          </span>
          Rewards Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="text-sm font-semibold mb-3 text-primary">Points Earning</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsPerTzs" className="text-base">Points Per TZS</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-40">
                      <Input
                        id="pointsPerTzs"
                        name="pointsPerTzs"
                        type="number"
                        value={formData.pointsPerTzs}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      TZS spent to earn 1 point
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: If set to 100, customers earn 1 point for every TZS 100 spent.
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-card">
              <h3 className="text-sm font-semibold mb-3 text-primary">Redemption Rules</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="redemption.points" className="text-base">Points Required</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-40">
                      <Input
                        id="redemption.points"
                        name="redemption.points"
                        type="number"
                        value={formData.redemption.points}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Points needed for coupon
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redemption.value" className="text-base">Coupon Value (TZS)</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-40">
                      <Input
                        id="redemption.value"
                        name="redemption.value"
                        type="number"
                        value={formData.redemption.value}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      TZS discount value
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current rate: {formData.redemption.points} points = TZS {formData.redemption.value} discount
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-card">
              <h3 className="text-sm font-semibold mb-3 text-primary">Referral Program</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="referralBonus" className="text-base">Referral Bonus Points</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-40">
                      <Input
                        id="referralBonus"
                        name="referralBonus"
                        type="number"
                        value={formData.referralBonus}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Points for successful referral
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Points awarded to the referrer when a new user completes their first purchase.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mt-4">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Updating..." : "Save Rewards Configuration"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
