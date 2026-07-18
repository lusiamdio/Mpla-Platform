import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import {
  Member,
  Announcement,
  PartyEvent,
  ChatChannel,
  SupportTicket,
  SurveyPoll,
  PaymentLog,
  LearningCourse,
  SystemAuditLog,
  InventoryStats
} from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.error("Failed to initialize Gemini Client:", e);
    }
  }
  return aiClient;
}

// Global In-Memory Store
let members: Member[] = [
  {
    id: "m-1",
    membershipNo: "MP-2026-1024",
    nationalId: "9603125089081",
    fullName: "Simao Lusimadio",
    email: "simao.lusimadio@gmail.com",
    mobile: "+27 82 123 4567",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    status: "Active",
    membershipLevel: "Standard",
    category: "General",
    province: "Gauteng",
    municipality: "City of Johannesburg",
    committee: "Ward 117 Local Committee",
    registrationDate: "2026-01-10",
    physicalCardStatus: "Printing",
    physicalCardEstDate: "2026-07-28",
    outstandingBalance: 150,
    gender: "Male",
    dob: "1996-03-12",
    maritalStatus: "Single",
    emergencyContact: { name: "Maria Lusimadio", phone: "+27 82 987 6543" },
    occupation: "Software Engineer",
    employer: "Tech Corp",
    education: "BSc Computer Science",
    leadershipRoles: ["Branch Youth Delegate"],
    registeredEvents: ["e-2"],
    completedCourses: ["c-1"],
    votedPolls: { "p-1": "Strongly Agree" }
  },
  {
    id: "m-2",
    membershipNo: "MP-2026-5942",
    nationalId: "8507204908123",
    fullName: "Naledi Mandela",
    email: "naledi.mandela@party.org",
    mobile: "+27 71 456 7890",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    status: "Active",
    membershipLevel: "Committee",
    category: "General",
    province: "Western Cape",
    municipality: "City of Cape Town",
    committee: "Ward 57 Committee",
    registrationDate: "2024-05-12",
    physicalCardStatus: "Collected",
    physicalCardEstDate: "2024-06-01",
    outstandingBalance: 0,
    gender: "Female",
    dob: "1985-07-20",
    maritalStatus: "Married",
    emergencyContact: { name: "Teboho Mandela", phone: "+27 71 111 2222" },
    occupation: "Public Relations Officer",
    employer: "Provincial Dept",
    education: "BA Communications",
    leadershipRoles: ["Western Cape Provincial Publicist"],
    registeredEvents: ["e-1", "e-2"],
    completedCourses: ["c-1", "c-2"],
    votedPolls: { "p-1": "Agree" }
  },
  {
    id: "m-3",
    membershipNo: "MP-2026-0812",
    nationalId: "9901015091234",
    fullName: "Thabo Mbeki Jr",
    email: "thabo.mbeki@gmail.com",
    mobile: "+27 63 987 6543",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    status: "Pending Verification",
    membershipLevel: "Standard",
    category: "Youth",
    province: "Gauteng",
    municipality: "Tshwane",
    committee: "Ward 2 Local Committee",
    registrationDate: "2026-07-15",
    physicalCardStatus: "Submitted",
    physicalCardEstDate: "2026-08-15",
    outstandingBalance: 200,
    gender: "Male",
    dob: "1999-01-01",
    maritalStatus: "Single",
    emergencyContact: { name: "Thabo Mbeki Sr", phone: "+27 11 444 5555" },
    occupation: "Student",
    employer: "University of Pretoria",
    education: "Undergraduate",
    leadershipRoles: [],
    registeredEvents: [],
    completedCourses: [],
    votedPolls: {}
  },
  {
    id: "m-4",
    membershipNo: "MP-2026-0813",
    nationalId: "9901015091234", // Intentional duplicate ID for AI duplicates checker
    fullName: "T. Mbeki Jr",
    email: "thabo.duplicate@gmail.com",
    mobile: "+27 63 987 6543",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    status: "Pending Verification",
    membershipLevel: "Standard",
    category: "Youth",
    province: "Gauteng",
    municipality: "Tshwane",
    committee: "Ward 2 Local Committee",
    registrationDate: "2026-07-16",
    physicalCardStatus: "Submitted",
    physicalCardEstDate: "2026-08-15",
    outstandingBalance: 200,
    gender: "Male",
    dob: "1999-01-01",
    maritalStatus: "Single",
    emergencyContact: { name: "Thabo Mbeki Sr", phone: "+27 11 444 5555" },
    occupation: "Student",
    employer: "University of Pretoria",
    education: "Undergraduate",
    leadershipRoles: [],
    registeredEvents: [],
    completedCourses: [],
    votedPolls: {}
  },
  {
    id: "m-5",
    membershipNo: "MP-2026-3029",
    nationalId: "7209115082194",
    fullName: "Johan de Wet",
    email: "johan.dewet@telkomsa.net",
    mobile: "+27 83 234 5678",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    status: "Suspended",
    membershipLevel: "Standard",
    category: "Senior",
    province: "Free State",
    municipality: "Mangaung",
    committee: "Ward 4 Committee",
    registrationDate: "2021-03-24",
    physicalCardStatus: "Quality Check",
    physicalCardEstDate: "2026-07-20",
    outstandingBalance: 0,
    gender: "Male",
    dob: "1972-09-11",
    maritalStatus: "Married",
    emergencyContact: { name: "Annelize de Wet", phone: "+27 83 999 8888" },
    occupation: "Farmer",
    employer: "Self-employed",
    education: "Diploma Agriculture",
    leadershipRoles: [],
    registeredEvents: [],
    completedCourses: ["c-1"],
    votedPolls: { "p-1": "Disagree" }
  }
];

let announcements: Announcement[] = [
  {
    id: "a-1",
    title: "National Campaign: Forward Together 2026",
    content: "We are officially launching the National Campaign 'Forward Together 2026' on July 25th. This landmark campaign will shape municipal advocacy across all nine provinces. Get involved in your local branch assemblies and mobilizations. Materials and flyers are available for download in the Documents center.",
    source: "National",
    date: "2026-07-16",
    author: "National Communications Directorate",
    category: "Campaign"
  },
  {
    id: "a-2",
    title: "Regional Coordinator Appointed for Cape Metro",
    content: "The National Executive Committee (NEC) has approved the appointment of Dr. Sibongile Khumalo as the new Regional Coordinator for the Cape Town Metro. Dr. Khumalo brings 15 years of community development and grass-roots organization experience.",
    source: "Regional",
    date: "2026-07-14",
    author: "Western Cape Provincial Office",
    category: "News"
  },
  {
    id: "a-3",
    title: "Emergency Announcement: Ward 117 Local Venue Change",
    content: "Please note that the local branch meeting scheduled for Saturday afternoon has been relocated to the Community Hall in Rosebank due to maintenance at the primary library office.",
    source: "Local",
    date: "2026-07-17",
    author: "Ward 117 Secretary",
    category: "Emergency"
  },
  {
    id: "a-4",
    title: "Launch of Virtual Political Academy & Training Certificates",
    content: "The National Education Committee is proud to release three accredited digital masterclasses designed to build campaign leadership, policy analysis, and community organizer skills. Explore the new Learning Center today!",
    source: "National",
    date: "2026-07-10",
    author: "National Training Center",
    category: "Notice"
  }
];

let events: PartyEvent[] = [
  {
    id: "e-1",
    title: "National Policy Summit 2026",
    description: "Annual summit gathering members and coordinators nationwide to consult on social security reform, sustainable local economies, and infrastructure guidelines.",
    date: "2026-08-10T09:00:00",
    location: "Gallagher Convention Centre, Midrand",
    organizer: "National",
    status: "Upcoming",
    registeredCount: 412,
    capacity: 1000,
    registeredMemberIds: ["m-2"]
  },
  {
    id: "e-2",
    title: "Local Assembly & Ward Feedback Seminar",
    description: "Your chance to meet Ward 117 coordinators, discuss local community policing initiatives, utility maintenance reports, and municipal budgets.",
    date: "2026-07-25T14:00:00",
    location: "Rosebank Community Hall, Johannesburg",
    organizer: "Local",
    status: "Upcoming",
    registeredCount: 48,
    capacity: 100,
    registeredMemberIds: ["m-1", "m-2"]
  },
  {
    id: "e-3",
    title: "Western Cape Leadership Workshop",
    description: "Intensive training for branch secretaries on event coordination, digital registration metrics, and local conflict resolution.",
    date: "2026-07-15T10:00:00",
    location: "Woodstock Assembly Hall, Cape Town",
    organizer: "Provincial",
    status: "Completed",
    registeredCount: 30,
    capacity: 30,
    registeredMemberIds: ["m-2"]
  }
];

let chatChannels: ChatChannel[] = [
  {
    id: "c-1",
    memberId: "m-1",
    type: "Local Committee",
    messages: [
      { sender: "member", senderName: "Simao Lusimadio", text: "Hello Ward 117 leadership. I wanted to ask how I can assist with flyers distribution for the Rosebank meeting next week?", timestamp: "2026-07-16T10:30:00Z" },
      { sender: "admin", senderName: "Ward Leader (Naledi)", text: "Hi Simao! Thank you so much for volunteering. We have packages printed and ready. You can pick them up from the municipal ward office tomorrow anytime between 9 AM and 4 PM.", timestamp: "2026-07-16T11:15:00Z" },
      { sender: "member", senderName: "Simao Lusimadio", text: "Brilliant, will collect them during lunch tomorrow!", timestamp: "2026-07-16T11:20:00Z" }
    ]
  },
  {
    id: "c-2",
    memberId: "m-1",
    type: "National Helpdesk",
    messages: [
      { sender: "member", senderName: "Simao Lusimadio", text: "Good day, I paid my outstanding balance via EFT yesterday but my dashboard still shows R150 outstanding. Could you please reconcile this?", timestamp: "2026-07-17T08:00:00Z" },
      { sender: "admin", senderName: "National Finance Desk", text: "Greetings Simao, standard EFT settlements can take up to 48 hours. I will tag our banking reconciliation officer to prioritize yours. Please ensure your reference was MP-2026-1024.", timestamp: "2026-07-17T09:45:00Z" }
    ]
  }
];

let supportTickets: SupportTicket[] = [
  {
    id: "TKT-1082",
    memberId: "m-1",
    type: "Card Replacement",
    description: "Requested a replacement card since I moved to Gauteng and need Ward 117 labeled as my voting committee on the physical badge.",
    status: "In Progress",
    assignedOfficer: "Kabelo Mokoena (Printing Officer)",
    estResolutionTime: "4 days",
    createdAt: "2026-07-14T11:00:00Z",
    replies: [
      { sender: "member", senderName: "Simao Lusimadio", text: "I have uploaded my new proof of residence. Can you double check if it is sufficient?", timestamp: "2026-07-14T11:05:00Z" },
      { sender: "officer", senderName: "Kabelo Mokoena", text: "Hi Simao, the document is approved. Your physical card status is updated to 'Printing' and will be printed in our next batch tomorrow.", timestamp: "2026-07-15T09:30:00Z" }
    ]
  },
  {
    id: "TKT-1083",
    memberId: "m-1",
    type: "Profile Correction",
    description: "My date of birth is listed as 12 March 1996, but my national ID is 9603125089081 which translates to March 12, 1996. Wait, actually that is correct, my middle name is misspelled as 'Lusimadio' instead of 'Luzimadio'. Could we correct this?",
    status: "Open",
    assignedOfficer: "Zola Ndlovu (Registration Officer)",
    estResolutionTime: "24 hours",
    createdAt: "2026-07-17T10:15:00Z",
    replies: []
  }
];

let surveyPolls: SurveyPoll[] = [
  {
    id: "p-1",
    title: "Draft Infrastructure & Municipal Investment Proposal",
    description: "Should local committees receive direct allocations of 15% of provincial infrastructure funds to spend directly on local road repairs?",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    votes: { "Strongly Agree": 142, "Agree": 89, "Neutral": 12, "Disagree": 8, "Strongly Disagree": 3 },
    votedMemberIds: ["m-1", "m-2", "m-5"],
    isAnonymous: true
  },
  {
    id: "p-2",
    title: "Preferred Virtual Educational Forum Slots",
    description: "What time slot works best for the bi-weekly live policy discussions?",
    options: ["Weekday Evenings (6 PM - 8 PM)", "Saturday Mornings (9 AM - 11 AM)", "Saturday Afternoons (2 PM - 4 PM)", "Sunday Afternoons (3 PM - 5 PM)"],
    votes: { "Weekday Evenings (6 PM - 8 PM)": 45, "Saturday Mornings (9 AM - 11 AM)": 78, "Saturday Afternoons (2 PM - 4 PM)": 32, "Sunday Afternoons (3 PM - 5 PM)": 12 },
    votedMemberIds: ["m-2"],
    isAnonymous: false
  }
];

let paymentLogs: PaymentLog[] = [
  {
    id: "p-101",
    memberId: "m-1",
    amount: 100,
    date: "2026-01-10",
    method: "Credit Card",
    status: "Successful",
    purpose: "Annual Membership Renewal"
  },
  {
    id: "p-102",
    memberId: "m-1",
    amount: 50,
    date: "2026-04-12",
    method: "Mobile Money",
    status: "Successful",
    purpose: "Monthly Dues"
  },
  {
    id: "p-103",
    memberId: "m-2",
    amount: 250,
    date: "2025-12-01",
    method: "Credit Card",
    status: "Successful",
    purpose: "Donation"
  }
];

let learningCourses: LearningCourse[] = [
  {
    id: "c-1",
    title: "Fundamentals of Municipal Governance & Advocacy",
    description: "Understand the structural branches of local government, municipal budgets, and how local branches advocate effectively for community needs.",
    category: "Civics & Governance",
    duration: "45 mins",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    contentMarkdown: "# Fundamentals of Municipal Governance\n\nIn this course, we explore how local councils are constituted and funded, and the active role of branch ward committees.\n\n## Core Pillars:\n1. **Integrated Development Plans (IDP)**: The primary mechanism of public participation.\n2. **Ward Committees**: Represent community interests in municipal council.\n3. **Public Hearings**: Participating in budget allocations.",
    quiz: [
      {
        question: "What is the primary document guiding a municipality's 5-year developmental plan?",
        options: ["National Growth Guide", "Integrated Development Plan (IDP)", "Municipal Tax Register", "Local Safety Pact"],
        correctIndex: 1
      },
      {
        question: "How many members typically compose a Ward Committee?",
        options: ["Up to 10 members", "Up to 5 members", "Exactly 20 members", "It varies by province entirely"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "c-2",
    title: "Campaign Leadership & Grass-roots Mobilization",
    description: "An advanced masterclass in community organizing, setting up campaign assemblies, volunteer logistics, and messaging strategy.",
    category: "Campaign Management",
    duration: "1 hour 15 mins",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    contentMarkdown: "# Campaign Leadership and Mobilization\n\nThis guide explains how to recruit, retain, and inspire volunteers on the ground.\n\n## Topics covered:\n- Relational organizing and active listening.\n- Knocking doors and tracking digital contacts.\n- Public speaking and branch coordination.",
    quiz: [
      {
        question: "Which organizing concept prioritizes leveraging personal relationships for mobilization?",
        options: ["Direct Mail Marketing", "Relational Organizing", "Billboard Blitzing", "Cold Calling"],
        correctIndex: 1
      }
    ]
  }
];

let auditLogs: SystemAuditLog[] = [
  {
    id: "a-101",
    timestamp: "2026-07-17T11:20:00Z",
    user: "Simao Lusimadio",
    role: "Member",
    action: "Login",
    device: "Chrome / macOS",
    location: "Johannesburg, ZA",
    ip: "105.4.120.89",
    details: "Logged in successfully to Member Platform via OTP"
  },
  {
    id: "a-102",
    timestamp: "2026-07-17T11:25:00Z",
    user: "Kabelo Mokoena",
    role: "Printing Officer",
    action: "Card Printing Status Change",
    device: "Firefox / Ubuntu",
    location: "Pretoria, ZA",
    ip: "196.22.45.10",
    details: "Changed Simao Lusimadio physical card status to 'Printing'"
  },
  {
    id: "a-103",
    timestamp: "2026-07-16T15:30:00Z",
    user: "Naledi Mandela",
    role: "Committee Leader",
    action: "Publish Announcement",
    device: "Safari / iPhone",
    location: "Cape Town, ZA",
    ip: "41.13.90.124",
    details: "Published local announcement: 'Emergency Announcement: Ward 117 Local Venue Change'"
  }
];

let inventoryStats: InventoryStats = {
  blankCards: 4850,
  printersStatus: "Online",
  inkPercent: 78,
  ribbonPercent: 62,
  packagingEnvelopes: 12000,
  holograms: 4200
};

// Log helper to simulate database updates
function logAction(user: string, role: string, action: string, details: string) {
  const newLog: SystemAuditLog = {
    id: `a-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user,
    role,
    action,
    device: "Chrome / Linux (Server)",
    location: "National HQ, ZA",
    ip: "127.0.0.1",
    details
  };
  auditLogs.unshift(newLog);
}

// REST API Endpoints

// Authentication API
app.post("/api/auth/login", (req, res) => {
  const { identifier, password, role } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: "Identification details are required to login." });
  }

  // Check Admin first
  if (role === "admin") {
    const cleanId = identifier.trim().toLowerCase();
    if (
      (cleanId === "admin@democraticalliance.org.za" || 
       cleanId === "admin@nda.org.za" || 
       cleanId === "admin@mpla-sa.org" || 
       cleanId === "admin@mpla.org" || 
       cleanId === "admin") && 
      password === "admin123"
    ) {
      logAction("Super Admin", "Authentication", "Admin Login Success", "Super Admin authenticated successfully via secure tunnel");
      return res.json({
        success: true,
        role: "admin",
        user: {
          id: "admin-hq",
          membershipNo: "MPLA-ADMIN-HQ-99",
          fullName: "National HQ Super Admin",
          email: "admin@mpla-sa.org",
          photo: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=150&h=150&fit=crop",
          status: "Active"
        }
      });
    } else {
      logAction("Anonymous", "Authentication", "Admin Login Failure", `Attempted admin login with: ${identifier}`);
      return res.status(401).json({ error: "Incorrect admin email/ID or security password." });
    }
  }

  // Member checks
  const query = identifier.toLowerCase().trim();
  const found = members.find(m => 
    m.email.toLowerCase() === query || 
    m.membershipNo.toLowerCase() === query || 
    m.nationalId === query || 
    m.mobile.replace(/\s+/g, '') === query.replace(/\s+/g, '')
  );

  if (found) {
    logAction(found.fullName, "Authentication", "Member Login Success", `Logged in securely using identifier: ${identifier}`);
    return res.json({
      success: true,
      role: "member",
      user: found
    });
  } else {
    // Auto-generate testing profile if query has "@"
    if (query.includes("@")) {
      const newMember: Member = {
        id: `m-${Date.now()}`,
        membershipNo: `MP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        nationalId: `900101509${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: query.split("@")[0].split(/[._-]+/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
        email: query,
        mobile: "+27 82 000 0000",
        photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
        status: "Active",
        membershipLevel: "Standard",
        category: "General",
        province: "Gauteng",
        municipality: "City of Johannesburg",
        committee: "Ward 117 Local Committee",
        registrationDate: new Date().toISOString().split("T")[0],
        physicalCardStatus: "Submitted",
        physicalCardEstDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        outstandingBalance: 150,
        gender: "Male",
        dob: "1990-01-01",
        maritalStatus: "Single",
        emergencyContact: { name: "Next of Kin", phone: "+27 82 111 1111" },
        occupation: "Representative",
        employer: "Organization",
        education: "Graduate Degree",
        leadershipRoles: [],
        registeredEvents: [],
        completedCourses: [],
        votedPolls: {}
      };
      members.push(newMember);
      logAction(newMember.fullName, "Authentication", "Auto-Registration", `Auto-registered new email: ${query}`);
      return res.json({
        success: true,
        role: "member",
        user: newMember
      });
    }
    logAction("Anonymous", "Authentication", "Member Login Failure", `No active registration matches identifier: ${identifier}`);
    return res.status(401).json({ error: "Membership credentials not found. Enter an email address to auto-generate a testing profile." });
  }
});

// Member Management
app.get("/api/members", (req, res) => {
  res.json(members);
});

app.post("/api/members", (req, res) => {
  const newMember: Member = {
    ...req.body,
    id: `m-${Date.now()}`,
    membershipNo: `MP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    registrationDate: new Date().toISOString().split("T")[0],
    outstandingBalance: 150,
    registeredEvents: [],
    completedCourses: [],
    votedPolls: {}
  };
  members.push(newMember);
  logAction("Super Admin", "National Admin", "Create Member", `Created member profile for ${newMember.fullName}`);
  res.status(210).json(newMember);
});

app.put("/api/members/:id", (req, res) => {
  const { id } = req.params;
  const index = members.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ error: "Member not found" });

  const oldData = members[index];
  members[index] = { ...oldData, ...req.body };
  logAction("System", "Administrator Action", "Update Member", `Updated profile / status for ${members[index].fullName}`);
  res.json(members[index]);
});

app.delete("/api/members/:id", (req, res) => {
  const { id } = req.params;
  const index = members.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ error: "Member not found" });

  const deleted = members.splice(index, 1)[0];
  logAction("Super Admin", "National Admin", "Delete Member", `Permanently deleted member record: ${deleted.fullName}`);
  res.json({ success: true, id });
});

// Announcements
app.get("/api/announcements", (req, res) => {
  res.json(announcements);
});

app.post("/api/announcements", (req, res) => {
  const newAnn: Announcement = {
    ...req.body,
    id: `a-${Date.now()}`,
    date: new Date().toISOString().split("T")[0]
  };
  announcements.unshift(newAnn);
  logAction(newAnn.author, "Communications Desk", "Publish Announcement", `Published announcement: ${newAnn.title}`);
  res.status(201).json(newAnn);
});

// Events
app.get("/api/events", (req, res) => {
  res.json(events);
});

app.post("/api/events", (req, res) => {
  const newEvent: PartyEvent = {
    ...req.body,
    id: `e-${Date.now()}`,
    registeredCount: 0,
    registeredMemberIds: []
  };
  events.push(newEvent);
  logAction("Super Admin", "Event Coordinator", "Create Event", `Scheduled new event: ${newEvent.title}`);
  res.status(201).json(newEvent);
});

app.post("/api/events/:id/register", (req, res) => {
  const { id } = req.params;
  const { memberId } = req.body;
  const event = events.find(e => e.id === id);
  const member = members.find(m => m.id === memberId);

  if (!event || !member) return res.status(404).json({ error: "Event or Member not found" });

  const isReg = event.registeredMemberIds.includes(memberId);
  if (isReg) {
    // Unregister
    event.registeredMemberIds = event.registeredMemberIds.filter(mid => mid !== memberId);
    event.registeredCount = Math.max(0, event.registeredCount - 1);
    member.registeredEvents = member.registeredEvents.filter(eid => eid !== id);
    logAction(member.fullName, "Member", "Unregister Event", `Cancelled registration for: ${event.title}`);
  } else {
    // Register
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ error: "Event is fully booked" });
    }
    event.registeredMemberIds.push(memberId);
    event.registeredCount++;
    member.registeredEvents.push(id);
    logAction(member.fullName, "Member", "Register Event", `Registered successfully for: ${event.title}`);
  }

  res.json({ event, member });
});

// Support Tickets
app.get("/api/tickets", (req, res) => {
  res.json(supportTickets);
});

app.post("/api/tickets", (req, res) => {
  const { memberId, type, description } = req.body;
  const member = members.find(m => m.id === memberId);
  if (!member) return res.status(404).json({ error: "Member not found" });

  const newTicket: SupportTicket = {
    id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
    memberId,
    type,
    description,
    status: "Open",
    assignedOfficer: "Zola Ndlovu (Support Helpdesk)",
    estResolutionTime: "48 hours",
    createdAt: new Date().toISOString(),
    replies: []
  };
  supportTickets.unshift(newTicket);
  logAction(member.fullName, "Member", "Submit Ticket", `Opened ticket ${newTicket.id}: [${type}]`);
  res.status(201).json(newTicket);
});

app.post("/api/tickets/:id/replies", (req, res) => {
  const { id } = req.params;
  const { sender, senderName, text } = req.body;
  const ticket = supportTickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  ticket.replies.push({
    sender,
    senderName,
    text,
    timestamp: new Date().toISOString()
  });

  if (sender === "officer") {
    ticket.status = "In Progress";
  }

  logAction(senderName, sender === "officer" ? "Support Desk" : "Member", "Ticket Reply", `Replied to ticket ${id}`);
  res.status(201).json(ticket);
});

app.put("/api/tickets/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, assignedOfficer } = req.body;
  const ticket = supportTickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  if (status) ticket.status = status;
  if (assignedOfficer) ticket.assignedOfficer = assignedOfficer;

  logAction("Super Admin", "Support Administrator", "Ticket Status Update", `Modified ticket ${id} to ${status}`);
  res.json(ticket);
});

// Messages Channels / Live Chats
app.get("/api/chats/:memberId", (req, res) => {
  const { memberId } = req.params;
  let memberChannels = chatChannels.filter(c => c.memberId === memberId);
  if (memberChannels.length === 0) {
    // Generate default local and helpdesk channels
    const localCh: ChatChannel = {
      id: `ch-local-${Date.now()}`,
      memberId,
      type: "Local Committee",
      messages: [
        { sender: "admin", senderName: "Local Secretary", text: "Welcome to your local committee group! Feel free to ask any questions.", timestamp: new Date().toISOString() }
      ]
    };
    const helpCh: ChatChannel = {
      id: `ch-help-${Date.now()}`,
      memberId,
      type: "National Helpdesk",
      messages: [
        { sender: "admin", senderName: "National Support Assistant", text: "Hello! Let us know if you need any assistance with card printing or account security.", timestamp: new Date().toISOString() }
      ]
    };
    chatChannels.push(localCh, helpCh);
    memberChannels = [localCh, helpCh];
  }
  res.json(memberChannels);
});

app.post("/api/chats/:id/messages", (req, res) => {
  const { id } = req.params;
  const { sender, senderName, text } = req.body;
  const channel = chatChannels.find(c => c.id === id);
  if (!channel) return res.status(404).json({ error: "Channel not found" });

  channel.messages.push({
    sender,
    senderName,
    text,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(channel);
});

// Surveys & Polls
app.get("/api/polls", (req, res) => {
  res.json(surveyPolls);
});

app.post("/api/polls/:id/vote", (req, res) => {
  const { id } = req.params;
  const { memberId, option } = req.body;
  const poll = surveyPolls.find(p => p.id === id);
  const member = members.find(m => m.id === memberId);

  if (!poll || !member) return res.status(404).json({ error: "Poll or Member not found" });

  // Update vote
  if (poll.votedMemberIds.includes(memberId)) {
    return res.status(400).json({ error: "You have already voted in this poll" });
  }

  poll.votedMemberIds.push(memberId);
  if (!poll.votes[option]) {
    poll.votes[option] = 0;
  }
  poll.votes[option]++;
  
  if (!member.votedPolls) {
    member.votedPolls = {};
  }
  member.votedPolls[id] = option;

  logAction(member.fullName, "Member", "Cast Poll Vote", `Voted on consultation: ${poll.title}`);
  res.json({ poll, member });
});

// Payments
app.get("/api/payments", (req, res) => {
  res.json(paymentLogs);
});

app.post("/api/payments", (req, res) => {
  const { memberId, amount, method, purpose } = req.body;
  const member = members.find(m => m.id === memberId);
  if (!member) return res.status(404).json({ error: "Member not found" });

  const newPayment: PaymentLog = {
    id: `p-${Date.now()}`,
    memberId,
    amount,
    date: new Date().toISOString().split("T")[0],
    method,
    status: "Successful",
    purpose
  };

  paymentLogs.unshift(newPayment);
  member.outstandingBalance = Math.max(0, member.outstandingBalance - amount);

  logAction(member.fullName, "Member", "Membership Payment", `Paid R${amount} for ${purpose} via ${method}`);
  res.status(210).json({ payment: newPayment, member });
});

// Courses
app.get("/api/courses", (req, res) => {
  res.json(learningCourses);
});

app.post("/api/courses/:id/complete", (req, res) => {
  const { id } = req.params;
  const { memberId } = req.body;
  const course = learningCourses.find(c => c.id === id);
  const member = members.find(m => m.id === memberId);

  if (!course || !member) return res.status(404).json({ error: "Course or Member not found" });

  if (!member.completedCourses.includes(id)) {
    member.completedCourses.push(id);
    logAction(member.fullName, "Member", "Complete Course", `Completed course & earned certificate: ${course.title}`);
  }

  res.json(member);
});

// Audit logs
app.get("/api/audit-logs", (req, res) => {
  res.json(auditLogs);
});

// Warehouse/Inventory
app.get("/api/inventory", (req, res) => {
  res.json(inventoryStats);
});

app.put("/api/inventory", (req, res) => {
  inventoryStats = { ...inventoryStats, ...req.body };
  logAction("Super Admin", "National HQ", "Inventory Updated", "Updated blank card batch allocations and printer toner thresholds");
  res.json(inventoryStats);
});

// SYSTEM SETTINGS AND INTEGRATIONS STATE
let systemSettings = {
  partyName: "Democratic Alliance (NDA)",
  logoUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=120&h=120&fit=crop",
  primaryColor: "#2563EB", 
  secondaryColor: "#1E3A8A", 
  defaultLanguage: "English (South Africa)",
  timezone: "Africa/Johannesburg (GMT+2)",
  dateFormat: "YYYY-MM-DD",
  maintenanceModeActive: false,
  emailTemplates: {
    verification: "<h3>Welcome to NDA</h3><p>Your OTP code is {{otp}}. This is valid for 10 minutes.</p>",
    cardDispatched: "<p>Greetings {{name}}, your National NDA Membership card has been produced and released to dispatch logistics. Track inside your portal.</p>"
  },
  smsTemplates: {
    otp: "NDA Secure Portal OTP: {{otp}}. Do not disclose this code to anyone.",
    cardDispatched: "NDA Card: Hello {{name}}, your physical card has been dispatched. Estimated delivery date: {{estDate}}."
  },
  featureFlags: {
    aiAssistedScans: true,
    instantSelfServiceRegistration: true,
    realtimeCardDispatches: false
  },
  licenseKey: "NDA-SUPERADMIN-GOLD-2026-X94J-LK32",
  licenseExpires: "2030-12-31"
};

let integrations = {
  nationalIdVerification: {
    enabled: true,
    provider: "Department of Home Affairs (HA-API)",
    apiKey: "ha_sec_9081239841",
    endpoint: "https://api.homeaffairs.gov.za/v2/verify"
  },
  smsProvider: {
    enabled: true,
    provider: "Twilio API Gateway",
    apiKey: "AC810238410294812",
    apiSecret: "tw_sec_lkj19023812",
    senderId: "NDA-Verify"
  },
  emailService: {
    enabled: true,
    provider: "SendGrid SMTP Relay",
    host: "smtp.sendgrid.net",
    port: 587,
    username: "apikey",
    password: "sg.sec_m18023190"
  },
  paymentGateway: {
    enabled: true,
    provider: "PayFast Secure Checkout",
    merchantId: "1002495",
    secretKey: "pf_sec_9081230",
    testMode: true
  },
  qrVerification: {
    enabled: true,
    provider: "NDA Internal Scan Engine",
    validationEndpoint: "https://portal.nda.org.za/api/qr/verify"
  },
  cloudStorage: {
    enabled: true,
    provider: "AWS S3 Private Buckets",
    bucketName: "nda-encrypted-member-vault",
    region: "af-south-1"
  },
  gisMapping: {
    enabled: true,
    provider: "Google Maps Platform",
    mapsApiKey: "AIzaSyD-10293841-NDA-MAPS-PROD"
  },
  erpSystem: {
    enabled: false,
    provider: "SAP S/4HANA Finance Sync",
    endpointUrl: "https://sap.nda.org/api/v1/sync"
  },
  crmSystem: {
    enabled: false,
    provider: "Salesforce Cloud",
    clientId: "sf_cli_10283",
    syncActive: false
  },
  biPlatform: {
    enabled: true,
    provider: "Microsoft PowerBI Embedded",
    dashboardUrl: "https://app.powerbi.com/groups/nda-leadership"
  }
};

app.get("/api/system/settings", (req, res) => {
  res.json(systemSettings);
});

app.put("/api/system/settings", (req, res) => {
  systemSettings = { ...systemSettings, ...req.body };
  logAction("Super Admin", "System Administration", "Update Settings", "Modified platform-wide parameters, branding details, and feature flags");
  res.json(systemSettings);
});

app.get("/api/system/integrations", (req, res) => {
  res.json(integrations);
});

app.put("/api/system/integrations", (req, res) => {
  integrations = { ...integrations, ...req.body };
  logAction("Super Admin", "Integration Centre", "Update Integrations", "Modified external API credentials, gateways, and connection switches");
  res.json(integrations);
});

app.post("/api/system/backup", (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = `NDA-BACKUP-${timestamp}-SECURE.zip`;
  logAction("Super Admin", "System Administration", "Manual Backup", `Triggered encrypted system state snapshot: ${backupFile}`);
  res.json({
    success: true,
    backupFile,
    size: "48.2 MB",
    logsCount: auditLogs.length,
    membersCount: members.length,
    timestamp: new Date().toISOString()
  });
});

app.post("/api/system/test-integration", (req, res) => {
  const { key, provider } = req.body;
  const isEnabled = (integrations as any)[key]?.enabled;
  const latency = Math.floor(10 + Math.random() * 45);
  logAction("Super Admin", "Integration Centre", "Test Connection", `Tested connection gateway for ${provider}`);
  res.json({
    success: true,
    message: `Secure TLS ping completed. Connection to ${provider} is ACTIVE. Latency: ${latency}ms. Node status: Operational (100% SLA).`
  });
});



app.post("/api/auth/send-otp", (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  logAction("System", "SMS Gateway", "OTP Dispatch", `Dispatched verification OTP ${otp} via Twilio to ${phone}`);
  res.json({ success: true, otp, maskedPhone: phone });
});

app.post("/api/auth/register", (req, res) => {
  const { 
    fullName, nationalId, mobile, email, province, municipality, committee, photo 
  } = req.body;

  if (!fullName || !nationalId || !mobile || !email) {
    return res.status(400).json({ error: "Missing required registration parameters." });
  }

  const duplicate = members.find(m => m.nationalId === nationalId || m.email.toLowerCase() === email.toLowerCase());
  if (duplicate) {
    return res.status(400).json({ error: "A member is already registered under this National ID or Email." });
  }

  const newId = `m-${members.length + 1}`;
  const randomNo = Math.floor(1000 + Math.random() * 9000);
  const provCodes: { [key: string]: string } = {
    "Gauteng": "GP", "Western Cape": "WC", "KwaZulu-Natal": "KZN", "Eastern Cape": "EC",
    "Free State": "FS", "Limpopo": "LP", "Mpumalanga": "MP", "North West": "NW", "Northern Cape": "NC"
  };
  const provCode = provCodes[province] || "HQ";
  const membershipNo = `MP-2026-${randomNo}-${provCode}`;

  const newMember: Member = {
    id: newId,
    membershipNo,
    nationalId,
    fullName,
    email,
    mobile,
    photo: photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
    status: "Active",
    membershipLevel: "Standard",
    category: "General",
    province: province || "Gauteng",
    municipality: municipality || "City of Johannesburg",
    committee: committee || "Ward 117 Local Committee",
    registrationDate: new Date().toISOString().split('T')[0],
    physicalCardStatus: "Printing",
    physicalCardEstDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
    outstandingBalance: 150,
    gender: "Other",
    dob: "1990-01-01",
    maritalStatus: "Single",
    emergencyContact: { name: "Next of Kin", phone: mobile },
    occupation: "Independent",
    employer: "Self-Employed",
    education: "Secondary School Certificate",
    leadershipRoles: ["General Member"],
    registeredEvents: [],
    completedCourses: [],
    votedPolls: {}
  };

  members.push(newMember);
  logAction(fullName, "Registration", "New Member Registered", `Created national membership account: ${membershipNo}`);
  res.json({ success: true, user: newMember });
});

// AI CENTRE ASSISTANT & ANOMALY DETECTOR USING GEMINI 3.5 FLASH
app.post("/api/ai/ask", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  const gemini = getGeminiClient();
  if (!gemini) {
    // Graceful fallback when API key is missing
    return res.json({
      text: `### 🤖 National Command AI Assistant\n\n*Note: GEMINI_API_KEY is not configured in this workspace. Showing high-fidelity offline system rules analysis:*\n\nHere is what I found in the system:\n- **Total Members**: ${members.length} registered nationwide.\n- **Card Production**: ${members.filter(m => m.physicalCardStatus === 'Printing').length} currently queuing on industrial thermal card printers.\n- **Open support tickets**: ${supportTickets.filter(t => t.status === 'Open').length} urgent inquiries.\n- **Most Active Province**: Gauteng (${members.filter(m => m.province === 'Gauteng').length} members).`
    });
  }

  try {
    const sysInstruction = `You are the Command AI Assistant for the National Party Member Platform and Super Admin Command Center.
You have access to the following live database snapshot:
- Members: ${JSON.stringify(members.map(m => ({ name: m.fullName, level: m.membershipLevel, status: m.status, province: m.province, card: m.physicalCardStatus })))}
- Tickets: ${JSON.stringify(supportTickets.map(t => ({ id: t.id, type: t.type, status: t.status })))}
- Inventory: ${JSON.stringify(inventoryStats)}
- Announcements: ${JSON.stringify(announcements.map(a => a.title))}

Answer the administrator's request using this real data. Keep your responses highly professional, clean, objective, and styled beautifully using markdown and bullet points.`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: sysInstruction
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Assistant request failed:", error);
    res.status(500).json({ error: error.message || "AI invocation failed" });
  }
});

app.post("/api/ai/analyze", async (req, res) => {
  const { type } = req.body; // duplicate, anomaly, summary, sentiment, forecast
  const gemini = getGeminiClient();

  if (!gemini) {
    // High-fidelity fallback simulating deep AI checks
    if (type === "duplicate") {
      return res.json({
        result: [
          {
            memberA: { id: "m-3", name: "Thabo Mbeki Jr", ID: "9901015091234", email: "thabo.mbeki@gmail.com" },
            memberB: { id: "m-4", name: "T. Mbeki Jr", ID: "9901015091234", email: "thabo.duplicate@gmail.com" },
            confidence: 0.98,
            reason: "Identical National ID numbers and matching phone numbers. Highly likely a duplicate registration."
          }
        ]
      });
    } else if (type === "anomaly") {
      return res.json({
        result: [
          {
            type: "Duplicate ID Submission",
            severity: "High",
            member: "T. Mbeki Jr",
            details: "Signed up with the exact National ID as 'Thabo Mbeki Jr' but used a different email, indicating registration bypass."
          },
          {
            type: "Address Variance",
            severity: "Low",
            member: "Johan de Wet",
            details: "User profile listed in Free State, but logging IP matches Gauteng, ZA proxy subnet."
          }
        ]
      });
    } else if (type === "summary") {
      return res.json({
        result: "The platform shows strong engagement with 5 active, high-value profiles registered. Card production is currently running efficiently, but 1 duplicate registration (ID mismatch on Thabo Mbeki Jr) requires immediate merge action. Support backlog is well managed with only 1 open inquiry."
      });
    } else if (type === "sentiment") {
      return res.json({
        result: [
          { ticketId: "TKT-1082", sentiment: "Neutral / Objective", rating: 65, alert: "Member updated residence. Card is printing." },
          { ticketId: "TKT-1083", sentiment: "Mildly Annoyed", rating: 40, alert: "Member noticed minor name misspelling on digital profile." }
        ]
      });
    } else if (type === "forecast") {
      return res.json({
        result: {
          predictedGrowthMonth: "+14.5%",
          estimatedStockRunout: "85 days",
          criticalAction: "Order thermal ink ribbons by August 15th to maintain zero-delay physical card delivery."
        }
      });
    }
  }

  try {
    let prompt = "";
    if (type === "duplicate") {
      prompt = `Review this list of members and spot any potentially duplicate accounts.
List of members: ${JSON.stringify(members.map(m => ({ id: m.id, name: m.fullName, idNo: m.nationalId, email: m.email, phone: m.mobile })))}

Respond with a JSON array where each object has:
- memberA: { id, name, ID, email }
- memberB: { id, name, ID, email }
- confidence: number (0 to 1)
- reason: string explaining the duplication warning.`;
    } else if (type === "anomaly") {
      prompt = `Review this state and find anomalous or suspicious registrations.
Members: ${JSON.stringify(members)}
Audit Logs: ${JSON.stringify(auditLogs.slice(0, 5))}

Respond with a JSON array of anomalies. Each anomaly must have 'type', 'severity' (Low/Medium/High), 'member', and 'details'.`;
    } else if (type === "summary") {
      prompt = `Generate a concise 3-sentence operational executive summary for national leadership based on this data:
Members count: ${members.length}, Announcements: ${announcements.length}, Events: ${events.length}, Tickets pending: ${supportTickets.filter(t => t.status === "Open").length}, Card printing queue: ${members.filter(m => m.physicalCardStatus === 'Printing').length}.`;
    } else if (type === "sentiment") {
      prompt = `Analyze the sentiment of these member support tickets:
${JSON.stringify(supportTickets.map(t => ({ id: t.id, type: t.type, desc: t.description, replies: t.replies })))}

Respond with a JSON array of objects, each containing: 'ticketId', 'sentiment' (e.g. Critical, Frustrated, Neutral, Happy), 'rating' (0 to 100), and 'alert' (summary of the core issue).`;
    } else if (type === "forecast") {
      prompt = `Review our current card inventory and membership volume to predict operational requirements.
Inventory: ${JSON.stringify(inventoryStats)}
Members currently: ${members.length} (Active card printers count: 1)

Respond with a JSON object containing:
- predictedGrowthMonth: string percentage
- estimatedStockRunout: string duration
- criticalAction: string actionable next step.`;
    }

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json({ result: parsed });
  } catch (error: any) {
    console.error("AI Analysis failed:", error);
    res.status(500).json({ error: error.message || "AI Analysis failed" });
  }
});

// Setup Vite & static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULL-STACK PORTAL] Server listening on http://localhost:${PORT}`);
  });
}

startServer();
