export const ISSUE_CATEGORIES = [
  'Roads & Traffic',
  'Water & Sewerage',
  'Electricity',
  'Street Lighting',
  'Waste Management',
  'Parks & Recreation',
  'Public Transport',
  'Other',
] as const;

export const ISSUE_STATUS_FLOW = [
  'Pending',
  'Verified',
  'In Progress',
  'Resolved',
] as const;

export const OFFICER_ALLOWED_EMAILS = [
  'commissioner@city.gov',
  'admin@city.gov',
  'operations@city.gov',
  'publicworks@city.gov',
] as const;

export type IssueStatus = (typeof ISSUE_STATUS_FLOW)[number];