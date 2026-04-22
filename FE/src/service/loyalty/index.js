// Loyalty feature removed.
// This file kept as a harmless stub so remaining imports don't break the app while we delete UI and backend.
// All functions return safe defaults indicating the feature is disabled.

export const getAllLoyaltyTiers = async () => ({ status: 410, message: "Loyalty feature removed", result: [] });
export const createLoyaltyTier = async () => ({ status: 410, message: "Loyalty feature removed", result: null });
export const toggleLoyaltyStatus = async () => ({ status: 410, message: "Loyalty feature removed" });
export const updateLoyaltyTier = async () => ({ status: 410, message: "Loyalty feature removed", result: null });
export const getAllLoyaltyRules = async () => ({ status: 410, message: "Loyalty feature removed", result: [] });
export const createLoyaltyRule = async () => ({ status: 410, message: "Loyalty feature removed", result: null });
export const toggleLoyaltyRuleStatus = async () => ({ status: 410, message: "Loyalty feature removed" });
export const updateLoyaltyRule = async () => ({ status: 410, message: "Loyalty feature removed", result: null });
export const deleteLoyaltyTier = async () => ({ status: 410, message: "Loyalty feature removed" });
export const deleteLoyaltyRule = async () => ({ status: 410, message: "Loyalty feature removed" });
