export enum Role {
  INDIVIDUAL = 'Individual',
  LEADER = 'Leader',
  MEMBER = 'Member',
}

export enum Status {
  REGISTERED = 'Registered',
  STARTED = 'Started',
  COMPLETED = 'Completed',
}

export interface WhatsAppConfig {
  apiKey: string;
  baseUrl?: string; // Optional, default is usually constant
}

export interface HikeEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image: string;
  description: string;
  // Detailed fields
  longDescription: string;
  distance: string;
  duration: string;
  price: string;
  meetingPoint: string;
  schedule: { time: string; activity: string }[];
  // Integration
  whatsappConfig?: WhatsAppConfig;
  // Multi-Organizer Support
  organizerIds?: string[]; 
  // Certificate Customization
  certificateTemplate?: string; // Base64 image URL
}

export interface User {
  id: string;
  eventId: number; // Linked Event ID
  eventName: string; // Linked Event Name
  fullName: string;
  governorate: string;
  wilayat: string;
  village: string;
  birthDate: string;
  age: string;
  gender: 'Male' | 'Female';
  phone: string;
  teamName?: string;
  teamLogo?: string;
  healthStatus: string;
  notes?: string;
  role: Role;
  status: Status;
  groupId?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface Organizer {
  id: string;
  username: string;
  password?: string; // In real app, never store plain text
  name: string;
  phone: string; // Added for lookups
  assignedEventIds: number[]; // IDs of events they can manage
}

export interface RegistrationPayload {
  type: 'individual' | 'group';
  eventId: number; // Required
  eventName: string; // Required
  teamDetails?: {
    name: string;
    logo?: string;
  };
  leader: {
    fullName: string;
    governorate: string;
    wilayat: string;
    village: string;
    birthDate: string;
    gender: 'Male' | 'Female';
    phone: string;
    healthStatus: string;
    notes?: string;
    agreedToTerms: boolean;
  };
  members: Array<{
    fullName: string;
    birthDate: string;
    gender: 'Male' | 'Female';
    phone?: string; 
    healthStatus: string;
  }>;
}

export interface Stats {
  totalRegistered: number;
  totalStarted: number;
  totalCompleted: number;
}

// Broadcast Features
export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
}

export interface MessageLog {
  id: string;
  eventId: number;
  recipientName: string;
  recipientPhone: string;
  messageContent: string;
  status: 'Sent' | 'Failed' | 'Pending';
  timestamp: string;
}