export interface Member {
  id: string;
  membershipNo: string;
  nationalId: string;
  fullName: string;
  email: string;
  mobile: string;
  photo: string;
  status: 'Pending Verification' | 'Active' | 'Inactive' | 'Suspended';
  membershipLevel: 'Standard' | 'Silver' | 'Gold' | 'Platinum' | 'Committee';
  category: 'Youth' | 'Senior' | 'General' | 'Associate';
  province: string;
  municipality: string;
  committee: string;
  registrationDate: string;
  physicalCardStatus: 'Submitted' | 'Verification' | 'Approved' | 'Printing' | 'Quality Check' | 'Ready for Dispatch' | 'In Transit' | 'Available for Collection' | 'Collected';
  physicalCardEstDate: string;
  outstandingBalance: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  emergencyContact: { name: string; phone: string };
  occupation: string;
  employer: string;
  education: string;
  leadershipRoles: string[];
  registeredEvents: string[]; // event IDs
  completedCourses: string[]; // course IDs
  votedPolls: { [pollId: string]: string }; // pollId -> votedOption
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  source: 'National' | 'Regional' | 'Local';
  date: string;
  author: string;
  category: 'Campaign' | 'News' | 'Press Release' | 'Notice' | 'Emergency';
}

export interface PartyEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: 'National' | 'Provincial' | 'Municipal' | 'Local';
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  registeredCount: number;
  capacity: number;
  registeredMemberIds: string[];
}

export interface ChatMessage {
  sender: 'member' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatChannel {
  id: string;
  memberId: string;
  type: 'Local Committee' | 'Regional Office' | 'National Helpdesk';
  messages: ChatMessage[];
}

export interface SupportTicketReply {
  sender: 'member' | 'officer';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  memberId: string;
  type: 'Profile Correction' | 'Lost Card Report' | 'Card Replacement' | 'General Inquiry';
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedOfficer: string;
  estResolutionTime: string;
  createdAt: string;
  replies: SupportTicketReply[];
}

export interface SurveyPoll {
  id: string;
  title: string;
  description: string;
  options: string[];
  votes: { [option: string]: number }; // optionName -> voteCount
  votedMemberIds: string[];
  isAnonymous: boolean;
}

export interface PaymentLog {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  method: 'Credit Card' | 'EFT' | 'Mobile Money' | 'PayPal';
  status: 'Successful' | 'Pending' | 'Failed';
  purpose: 'Monthly Dues' | 'Annual Membership Renewal' | 'Donation' | 'Event Contribution';
}

export interface LearningCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  videoUrl?: string;
  contentMarkdown?: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  device: string;
  location: string;
  ip: string;
  details: string;
}

export interface InventoryStats {
  blankCards: number;
  printersStatus: 'Online' | 'Offline' | 'Maintenance';
  inkPercent: number;
  ribbonPercent: number;
  packagingEnvelopes: number;
  holograms: number;
}
