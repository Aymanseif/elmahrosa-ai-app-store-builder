export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  clerkId: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  status: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  stripeId?: string;
}

export interface Build {
  id: string;
  projectId: string;
  status: string;
  artifactUrl?: string;
}

export interface Audit {
  id: string;
  projectId: string;
  score: number;
  report: any;
}