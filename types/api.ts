// API Type Definitions for Formula Cardz
export interface AuthRequest {
  username?: string;
  password: string;
  email: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  profileImageUrl?: string;
  favoriteDrivers?: string[];
  favoriteConstructors?: string[];
}

export interface NewUserRequest {
  username: string;
  email: string;
  password: string;
  profileImageUrl?: string;
  favoriteConstructors: string[];
  favoriteDrivers: string[];
}

export interface AuthResponse {
  email: string;
  username: string;
  token: string;
  id: string;
  profileImageUrl: string;
  favoriteDrivers: string[];
  favoriteConstructors: string[];
  hasPremium?: boolean;
}

export interface CardCollectionResponse {
  // Card fields
  id: string;
  year: number;
  setName: string;
  cardNumber: string;
  driverName: string;
  constructorName: string;
  rookieCard: boolean;
  parallel?: string;
  imageUrl: string;

  // Ownership fields
  quantity: number;
  condition: string;
  purchasePrice?: number;
  purchaseDate?: Date;
}

export interface CardDropResponse {
  productName: string;
  releaseDate: Date;
  description: string;
  manufacturer: string;
  imageUrl: string;
  preorderUrl?: string;
}

export interface RemoveCardFromCollectionRequest {
  userId: string;
  cardId: string;
  quantityToSubtract: number;
  parallel?: string;
  condition: string;
}

export interface AddCardToCollectionRequest {
  userId: string;
  cardId: string;
  quantity: number;
  parallel?: string;
  purchasePrice?: number;
  purchaseDate?: Date;
  condition: string;
}

export interface UpdateCardInCollectionRequest {
  userId: string;
  cardId: string;
  oldParallel?: string;
  quantity?: number;
  parallel?: string;
  purchasePrice?: number;
  purchaseDate?: Date;
  condition?: string;
}

export interface EnabledParallel {
  name: string;
  imageUrl?: string;
  isOneOfOne?: boolean;
  isOneOfOneFound?: boolean;
}

export interface OneOfOneCardResponse {
  id: string;
  year: number;
  setName: string;
  cardNumber: string;
  driverName: string;
  constructorName: string;
  rookieCard: boolean;
  parallels: EnabledParallel[];
}

export interface Dropdown {
  value: string
  label: string
  id?: string
}