export const categoryLabels: Record<string, string> = {
  KITCHEN: "Bucătărie",
  BATHROOM: "Baie",
  BEDROOM: "Dormitor",
  LIVING: "Living",
  GENERAL: "General",
};

export function getCategoryLabel(category: string): string {
  return categoryLabels[category] || category;
}

