const rejectionReasons: { id: string; label: string }[] = [
  { id: "incomplete_documents", label: "Incomplete or Unclear Documents" },
  { id: "failed_verification", label: "Failed Background/Verification Check" },
  { id: "no_vehicle", label: "No Vehicle or Invalid Vehicle Info" },
  { id: "other", label: "Other (Please specify)" },
];

const rejectionReasonsMap = new Map(
  rejectionReasons.map((reason) => [reason.id, reason.label])
);

/**
 * Generates a human-readable rejection reason string.
 * If the type is 'other', it returns the custom reason.
 * Otherwise, it looks up the reason from the map.
 * @param type The reason ID (e.g., 'incomplete_documents').
 * @param customReason The custom reason text, if type is 'other'.
 * @returns The formatted rejection reason string.
 */
export const getRejectionReasonText = (
  type: string,
  customReason?: string
): string => {
  if (type === "other" && customReason) {
    return customReason;
  }
  return rejectionReasonsMap.get(type) || type;
};
