export type LeadSource = "meta" | "google" | "architect" | "client_referral" | "partner_referral" | "organic";
export type LeadTemperature = "HOT" | "WARM" | "COLD";
export type LeadStatus = "new" | "contacted" | "qualified" | "offer_needed" | "lost" | "won";
export type OfferStatus = "draft" | "sent" | "negotiation" | "measurement_done" | "won" | "lost";
export type CampaignPlatform = "Meta" | "Google";
export type CampaignStatus = "active" | "paused" | "stopped";
export type ProductModel = "Tirana" | "Astana" | "Chaga" | "Waleta";

export interface LeadEntity {
  id: string;
  clientName: string;
  phone?: string;
  email?: string;
  source: LeadSource;
  campaignId?: string;
  owner?: "Magda 1" | "Magda 2";
  modelInterest?: ProductModel;
  budget: number;
  createdAt: string;
  lastContactAt?: string;
  status: LeadStatus;
  score?: number;
  temperature?: LeadTemperature;
}

export interface OfferEntity {
  id: string;
  leadId: string;
  campaignId?: string;
  owner: "Magda 1" | "Magda 2";
  model: ProductModel;
  value: number;
  status: OfferStatus;
  createdAt: string;
  sentAt?: string;
  lastFollowupAt?: string;
  winProbability: number;
  decisionReason?: string;
}

export interface CampaignEntity {
  id: string;
  name: string;
  platform: CampaignPlatform;
  model: ProductModel;
  monthlyBudget: number;
  status: CampaignStatus;
}

export interface MagdaTaskEntity {
  id: string;
  owner: "Magda 1" | "Magda 2";
  title: string;
  linkedLeadId?: string;
  linkedOfferId?: string;
  dueAt: string;
  priority: "highest" | "high" | "medium" | "low";
  done: boolean;
}

export interface PartnerEntity {
  id: string;
  name: string;
  kind: "architect" | "partner" | "client-advocate";
  lastContactAt?: string;
  owner?: "CEO" | "Magda 1" | "Magda 2";
}

export interface ForecastEntity {
  monthKey: string;
  revenuePlan: number;
}

export interface OperatingDataStore {
  leads: LeadEntity[];
  offers: OfferEntity[];
  campaigns: CampaignEntity[];
  magdaTasks: MagdaTaskEntity[];
  partners: PartnerEntity[];
  forecasts: ForecastEntity[];
}

export interface CampaignDerivedMetrics {
  campaignId: string;
  campaignName: string;
  model: ProductModel;
  leads: number;
  hotLeads: number;
  offers: number;
  sales: number;
  revenue: number;
  cost: number;
}
