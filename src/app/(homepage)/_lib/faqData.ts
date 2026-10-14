export type HomeFAQ = {
  id: string;
  question: string;
  answer: string;
};

export const homeFAQs: HomeFAQ[] = [
  {
    id: "item-1",
    question: "What is Zedu?",
    answer:
      "Zedu is a communication and learning platform built for schools, bootcamps, and training programs. It combines structured channels, learning workflows, and AI-powered support to help educators teach and learners stay engaged.",
  },
  {
    id: "item-2",
    question: "How does Zedu support students and learners?",
    answer:
      "Zedu supports learners with organized class spaces, timely reminders, searchable learning materials, and quick help through AI assistants. Students can follow lessons, ask questions, and track progress in one place.",
  },
  {
    id: "item-3",
    question: "Is Zedu difficult to set up for a school or bootcamp?",
    answer:
      "No. Zedu is designed for quick onboarding with simple setup steps, guided workspace creation, and role-based controls. Most teams can start running cohorts or classes in a short time.",
  },
  {
    id: "item-4",
    question: "Can Zedu use our institution’s information to answer questions?",
    answer:
      "Yes. You can connect your institutional content such as course documents, policies, and internal resources so AI assistants can provide responses grounded in your own approved materials.",
  },
  {
    id: "item-5",
    question: "Is student support fully automated?",
    answer:
      "No. Zedu uses a hybrid model where AI handles routine questions and guidance, while educators and staff remain in control for mentoring, grading, and sensitive support decisions.",
  },
  {
    id: "item-6",
    question: "How does pricing work for educational institutions?",
    answer:
      "Pricing is flexible based on your institution size, usage needs, and required features. Zedu offers plans for growing cohorts and custom options for larger schools or multi-program organisations.",
  },
];
