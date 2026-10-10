export type ContributorRole = "Team Lead" | "Member";

export type Contributor = {
  fullName: string;
  zeduUsername: string;
  githubUsername: string;
  role: ContributorRole;
  field?: string;
};

export type Team = {
  name: string;
  contributors: Contributor[];
};

export const TEAM: Team = {
  name: "Zedu-Sparrow",
  contributors: [
    {
      fullName: "Abraham Bishop",
      zeduUsername: "dev_b",
      githubUsername: "abrahambishopcodes",
      role: "Team Lead",
      field: "Full-Stack Software Engineer",
    },
    {
      fullName: "Denise Moemeke",
      zeduUsername: "denise_davida",
      githubUsername: "deniseondata",
      role: "Member",
      field: "[Add your field of expertise]",
    },
    {
      fullName: "Medadi God'sglory Mitana",
      zeduUsername: "God'sglory",
      githubUsername: "medadimitana",
      role: "Member",
      field: "[Add your field of expertise]",
    },
    {
      fullName: "Kanyinsola Ogunwale",
      zeduUsername: "kanyinsolaogunwale",
      githubUsername: "kanyinsolaogunwale",
      role: "Member",
      field: "UI/UX Design",
    },
    {
      fullName: "Abdulmuiz Abdulsalam Olalekan",
      zeduUsername: "abdulmuiz abdulsalam olalekan",
      githubUsername: "Iampeace001",
      role: "Member",
      field: "UI/UX Design",
    },
    {
      fullName: "Victor Adeshile",
      zeduUsername: "Victor Adeshile",
      githubUsername: "davik4life",
      role: "Member",
      field: "Full-Stack Software Engineer",
    },
    {
      fullName: "Lawal Muhammed Olamide",
      zeduUsername: "muhammed",
      githubUsername: "OL4MID3",
      role: "Member",
      field: "AI Product Developer",
    },
    {
      fullName: "Boluwatife Adesola",
      zeduUsername: "Adesola",
      githubUsername: "adesolabolu",
      role: "Member",
      field: "Data Analysis",
    },
    {
      fullName: "Nwaohiri Emmanuel Uzodinma",
      zeduUsername: "99PlusOne",
      githubUsername: "Emmanuel-Xs",
      role: "Member",
      field: "Frontend Developer",
    },
    {
      fullName: "Obiageli Ezeokoli",
      zeduUsername: "Oby Ezeokoli",
      githubUsername: "AfrikTechie",
      role: "Member",
      field: "Data Analysis",
    },
    {
      fullName: "Pearl Koosi Akpaka",
      zeduUsername: "PearlAkpaka",
      githubUsername: "pearl-bit-tech",
      role: "Member",
      field: "Product Management",
    },
  ],
};
