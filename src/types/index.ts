// Shared domain types for the CasaPerks API

export interface Resident {
  id: string;
  name: string;
  email: string;
  unit: string;
  pointsBalance: number;
}

export type TransactionType = 'earned' | 'bonus' | 'redeemed' | 'expired';

export interface Transaction {
  id: string;
  residentId: string;
  type: TransactionType;
  points: number;
  description: string;
  date: string;
  giftCardId?: string;
}

export type GiftCardCategory = 'retail' | 'food' | 'entertainment' | 'other';

export interface GiftCard {
  id: string;
  brand: string;
  description: string;
  pointsCost: number;
  category: GiftCardCategory;
  inStock: boolean;
}
