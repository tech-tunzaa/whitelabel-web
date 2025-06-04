import React from 'react';

// Minimal props for testing, adjust if page.tsx complains about missing props
interface AffiliateDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  action?: "approve" | "reject" | null;
  onConfirm?: (reason?: string) => void;
  confirmLabel?: string;
  withReason?: boolean;
}

export const AffiliateDialog: React.FC<AffiliateDialogProps> = (props) => {
  return <div data-testid="affiliate-dialog-placeholder">Affiliate Dialog Placeholder</div>;
};

