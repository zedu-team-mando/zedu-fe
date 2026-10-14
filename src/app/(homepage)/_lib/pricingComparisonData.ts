export type PricingComparisonCellValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type PricingComparisonPlan = {
  key: string;
  label: string;
};

export type PricingComparisonSectionIcon =
  | "community"
  | "communication"
  | "learning"
  | "automation"
  | "security";

export type PricingComparisonRow = {
  key: string;
  label: string;
  showInfoIcon?: boolean;
  values: Record<string, PricingComparisonCellValue>;
};

export type PricingComparisonSection = {
  key: string;
  title: string;
  titleIcon?: PricingComparisonSectionIcon;
  rows: PricingComparisonRow[];
};

export const pricingComparisonPlans: PricingComparisonPlan[] = [
  { key: "starter", label: "Starter" },
  { key: "pro", label: "Pro" },
  { key: "enterprise", label: "Enterprise" },
];

export const pricingComparisonSections: PricingComparisonSection[] = [
  {
    key: "workspace-community",
    title: "Workspace & Community",
    titleIcon: "community",
    rows: [
      {
        key: "workspaces",
        label: "Workspaces",
        showInfoIcon: true,
        values: {
          starter: 1,
          pro: "Unlimited",
          enterprise: "Unlimited",
        },
      },
      {
        key: "cohorts-bootcamps",
        label: "Cohorts / Bootcamps",
        showInfoIcon: true,
        values: {
          starter: 3,
          pro: "Unlimited",
          enterprise: "Unlimited",
        },
      },
      {
        key: "teachers-admins",
        label: "Teachers / Admins",
        showInfoIcon: true,
        values: {
          starter: "Up to 5",
          pro: "Up to 50",
          enterprise: "Unlimited",
        },
      },
      {
        key: "students-per-cohort",
        label: "Students per Cohort",
        showInfoIcon: true,
        values: {
          starter: "Limited",
          pro: "Up to 500",
          enterprise: "Custom",
        },
      },
      {
        key: "channels",
        label: "Channels",
        showInfoIcon: true,
        values: {
          starter: true,
          pro: true,
          enterprise: true,
        },
      },
      {
        key: "threaded-discussions",
        label: "Threaded Discussions",
        showInfoIcon: true,
        values: {
          starter: true,
          pro: true,
          enterprise: true,
        },
      },
    ],
  },
  {
    key: "communication-collaboration",
    title: "Communication & Collaboration",
    titleIcon: "communication",
    rows: [
      {
        key: "direct-messaging",
        label: "Direct Messaging",
        showInfoIcon: true,
        values: {
          starter: true,
          pro: true,
          enterprise: true,
        },
      },
      {
        key: "group-discussions",
        label: "Group Discussions",
        showInfoIcon: true,
        values: {
          starter: true,
          pro: true,
          enterprise: true,
        },
      },
      {
        key: "announcement-channels",
        label: "Announcements Channels",
        showInfoIcon: true,
        values: {
          starter: true,
          pro: true,
          enterprise: true,
        },
      },
      {
        key: "voice-video-calls",
        label: "Voice & Video Calls",
        showInfoIcon: true,
        values: {
          starter: false,
          pro: true,
          enterprise: true,
        },
      },
      {
        key: "screen-sharing",
        label: "Screen Sharing",
        showInfoIcon: true,
        values: {
          starter: false,
          pro: true,
          enterprise: true,
        },
      },
      {
        key: "class-recordings",
        label: "Class Recordings",
        showInfoIcon: true,
        values: {
          starter: false,
          pro: true,
          enterprise: true,
        },
      },
    ],
  },
  {
    key: "learning-tools",
    title: "Learning Tools",
    titleIcon: "learning",
    rows: [
      {
        key: "file-sharing",
        label: "File Sharing",
        showInfoIcon: true,
        values: {
          starter: true,
          pro: true,
          enterprise: true,
        },
      },
      {
        key: "assignment-discussions",
        label: "Assignment Discussions",
        showInfoIcon: true,
        values: {
          starter: true,
          pro: true,
          enterprise: true,
        },
      },
      {
        key: "course-channels",
        label: "Course Channels",
        showInfoIcon: true,
        values: {
          starter: true,
          pro: true,
          enterprise: true,
        },
      },
      {
        key: "shared-resources",
        label: "Shared Resources",
        showInfoIcon: true,
        values: {
          starter: false,
          pro: true,
          enterprise: true,
        },
      },
      {
        key: "ai-study-assistant",
        label: "AI Study Assistant",
        showInfoIcon: true,
        values: {
          starter: "Limited",
          pro: true,
          enterprise: "Advanced",
        },
      },
    ],
  },
  {
    key: "automation-ai",
    title: "Automation & AI",
    titleIcon: "automation",
    rows: [
      {
        key: "ai-message-summaries",
        label: "AI Message Summaries",
        showInfoIcon: true,
        values: {
          starter: false,
          pro: true,
          enterprise: true,
        },
      },
      {
        key: "ai-learning-assistants",
        label: "AI Learning Assistants",
        showInfoIcon: true,
        values: {
          starter: "Limited",
          pro: true,
          enterprise: "Advanced",
        },
      },
      {
        key: "workflow-automation",
        label: "Workflow Automation",
        showInfoIcon: true,
        values: {
          starter: false,
          pro: false,
          enterprise: true,
        },
      },
      {
        key: "ai-moderation",
        label: "AI Moderation",
        showInfoIcon: true,
        values: {
          starter: false,
          pro: false,
          enterprise: true,
        },
      },
    ],
  },
  {
    key: "administration-security",
    title: "Administration & Security",
    titleIcon: "security",
    rows: [
      {
        key: "admin-controls",
        label: "Admin Controls",
        showInfoIcon: true,
        values: {
          starter: "Basic",
          pro: "Advanced",
          enterprise: "Full",
        },
      },
      {
        key: "workspace-permissions",
        label: "Workspace Permissions",
        showInfoIcon: true,
        values: {
          starter: true,
          pro: true,
          enterprise: true,
        },
      },
      {
        key: "analytics-dashboard",
        label: "Analytics Dashboard",
        showInfoIcon: true,
        values: {
          starter: false,
          pro: true,
          enterprise: true,
        },
      },
      {
        key: "api-integrations",
        label: "API / Integrations",
        showInfoIcon: true,
        values: {
          starter: false,
          pro: "Limited",
          enterprise: "Full",
        },
      },
      {
        key: "dedicated-support",
        label: "Dedicated Support",
        showInfoIcon: true,
        values: {
          starter: false,
          pro: false,
          enterprise: true,
        },
      },
    ],
  },
];

export const pricingComparisonDemoSections: PricingComparisonSection[] = [
  ...pricingComparisonSections,
];
