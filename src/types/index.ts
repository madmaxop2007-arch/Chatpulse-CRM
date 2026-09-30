export type UserRole = 'owner' | 'admin' | 'agent';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  organizationId: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  phone: string;
  email: string;
  location: string;
  currency: string;
  ownerId: string;
  leadStatuses?: string[];
  propertyTypes?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Member {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'invited' | 'inactive';
  joinedAt: string;
  assignedLeadsCount?: number;
  dealsCount?: number;
}

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Site Visit'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type LeadPriority = 'Hot' | 'Warm' | 'Cold';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  source: string;
  budgetMin: number;
  budgetMax: number;
  propertyType: string;
  preferredLocation: string;
  purpose: 'Buy' | 'Rent' | 'Investment';
  bedrooms?: string;
  status: LeadStatus;
  priority: LeadPriority;
  assignedAgentId: string;
  assignedAgentName: string;
  notes?: string;
  nextFollowUpDate?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type PropertyStatus = 'Available' | 'Reserved' | 'Sold' | 'Rented' | 'Inactive';
export type TransactionType = 'Sale' | 'Rent';

export interface Property {
  id: string;
  propertyCode: string;
  title: string;
  propertyType: string;
  transactionType: TransactionType;
  price: number;
  location: string;
  address: string;
  city: string;
  locality: string;
  bedrooms: number;
  bathrooms: number;
  area: number; // in sq ft
  furnishing: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
  floor: number;
  totalFloors: number;
  parking: number;
  facing: string;
  possessionStatus: string;
  description: string;
  amenities: string[];
  ownerName: string;
  ownerPhone: string;
  assignedAgentId: string;
  assignedAgentName: string;
  status: PropertyStatus;
  images: string[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ClientType = 'Buyer' | 'Tenant' | 'Investor' | 'Seller' | 'Landlord';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  whatsapp?: string;
  clientType: ClientType;
  budget: number;
  preferredLocation: string;
  propertyType: string;
  requirements?: string;
  assignedAgentId: string;
  assignedAgentName: string;
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type FollowUpType = 'Call' | 'WhatsApp' | 'Meeting' | 'Email' | 'Other';
export type FollowUpStatus = 'Pending' | 'Completed' | 'Missed' | 'Cancelled';

export interface FollowUp {
  id: string;
  relatedType: 'lead' | 'client';
  relatedId: string;
  relatedName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: FollowUpType;
  priority: 'Low' | 'Medium' | 'High';
  assignedAgentId: string;
  assignedAgentName: string;
  notes: string;
  status: FollowUpStatus;
  isDemo?: boolean;
  createdAt: string;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  assignedAgentId: string;
  assignedAgentName: string;
  relatedLeadId?: string;
  relatedLeadName?: string;
  relatedClientId?: string;
  relatedClientName?: string;
  isDemo?: boolean;
  createdAt: string;
}

export type SiteVisitStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';

export interface SiteVisit {
  id: string;
  leadId?: string;
  leadName?: string;
  clientId?: string;
  clientName?: string;
  propertyId: string;
  propertyTitle: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  assignedAgentId: string;
  assignedAgentName: string;
  status: SiteVisitStatus;
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
}

export type DealStage =
  | 'New'
  | 'Qualified'
  | 'Site Visit'
  | 'Negotiation'
  | 'Documentation'
  | 'Closed Won'
  | 'Closed Lost';

export interface Deal {
  id: string;
  dealName: string;
  leadId?: string;
  leadName?: string;
  clientId?: string;
  clientName?: string;
  propertyId?: string;
  propertyTitle?: string;
  assignedAgentId: string;
  assignedAgentName: string;
  dealValue: number;
  expectedClosingDate: string;
  stage: DealStage;
  probability: number;
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ActivityType =
  | 'Call'
  | 'WhatsApp'
  | 'Email'
  | 'Meeting'
  | 'Note'
  | 'Follow-up'
  | 'Site Visit'
  | 'Deal Update'
  | 'Lead Created'
  | 'Lead Updated'
  | 'Property Created'
  | 'Status Change';

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  relatedType: 'lead' | 'property' | 'client' | 'deal' | 'siteVisit' | 'task' | 'general';
  relatedId: string;
  relatedName: string;
  activityType: ActivityType;
  description: string;
  timestamp: string;
  isDemo?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'followup' | 'task' | 'siteVisit' | 'lead' | 'deal' | 'system';
  read: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalLeads: number;
  newLeads: number;
  activeProperties: number;
  siteVisitsMonth: number;
  dealsWon: number;
  pipelineValue: number;
  wonRevenue: number;
  hotLeads: number;
  qualifiedLeads: number;
}
