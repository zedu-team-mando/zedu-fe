export interface ResourceTab {
  id: "guides" | "case-studies" | "templates" | "webinars" | "help-center";
  label: string;
}

export interface ResourceItem {
  id: number;
  tab: ResourceTab["id"];
  category: string;
  title: string;
  description?: string;
  image: string;
  link: string;
  duration?: string;
}

export const tabs: ResourceTab[] = [
  { id: "guides", label: "Guides" },
  { id: "case-studies", label: "Case studies" },
  { id: "templates", label: "Templates" },
  { id: "webinars", label: "Webinars" },
  { id: "help-center", label: "Help center" },
];

export const resources: ResourceItem[] = [
  {
    id: 1,
    tab: "guides",
    category: "Guides",
    title: "Organizing Courses with Channels",
    description:
      "How universities structure course discussions using Zedu to keep topics clear and accessible.",
    image: "/images/homepage/resources/image-1.png",
    link: "#",
  },
  {
    id: 2,
    tab: "guides",
    category: "Guides",
    title: "Running Active Class Discussions",
    description:
      "Tips for teachers to encourage student participation and build a thriving online classroom.",
    image: "/images/homepage/resources/image-2.png",
    link: "#",
  },
  {
    id: 3,
    tab: "guides",
    category: "Guides",
    title: "Managing Bootcamp Cohorts",
    description:
      "How bootcamps organize fast-paced learning programs, coordinate mentors, and track progress.",
    image: "/images/homepage/resources/image-3.png",
    link: "#",
  },
  {
    id: 4,
    tab: "guides",
    category: "Guides",
    title: "Using AI assistant for Learning",
    description:
      "Discover how AI help summarize discussions, answer questions, and support students Zedu workspace.",
    image: "/images/homepage/resources/image-4.png",
    link: "#",
  },
  {
    id: 6,
    tab: "webinars",
    category: "Webinar",
    title: "Getting Started with Zedu for Universities",
    image: "/images/homepage/resources/webinar-1.png",
    duration: "45 min",
    link: "#",
  },
  {
    id: 7,
    tab: "webinars",
    category: "Webinar",
    title: "Running Bootcamp Cohorts on Zedu Platform",
    image: "/images/homepage/resources/webinar-2.png",
    duration: "60 min",
    link: "#",
  },
  {
    id: 8,
    tab: "webinars",
    category: "Webinar",
    title: "Using AI assistants in Simplifying Education",
    image: "/images/homepage/resources/webinar-3.png",
    duration: "30 min",
    link: "#",
  },
];
