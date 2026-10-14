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
      githubUsername: "databydenise",
      role: "Member",
      field: "Data Science / Engineering",
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
      zeduUsername: "victor_adeshile",
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
    {
      fullName: "Hafeezah Kadiri",
      zeduUsername: "Hafeey",
      githubUsername: "HAFEEZAH029",
      role: "Member",
      field: "Frontend Developer",
    },
    {
      fullName: "Joshua Emmanuel",
      zeduUsername: "joshua_emmanuel",
      githubUsername: "joshua-emmanuel",
      role: "Member",
      field: "Frontend Developer",
    },
    {
      fullName: "Uyanwanne Emmanuel Chukwudaru",
      zeduUsername: "emmyanzo",
      githubUsername: "emmyanzx",
      role: "Member",
      field: "Frontend Developer",
    },
    {
      fullName: "Obidigwe Francis Praise Chukwunonso",
      zeduUsername: "Francis-7-tech",
      githubUsername: "francis-7-tech",
      role: "Member",
      field: "Fullstack Development",
    },
    {
      fullName: "Eda Cynthia Itsekirimi",
      zeduUsername: "Cynthy",
      githubUsername: "Edacynthia",
      role: "Member",
      field: "Backend Developer",
    },
    {
      fullName: "Ejike Odoh",
      zeduUsername: "ejike",
      githubUsername: "EjikeOdoh",
      role: "Member",
      field: "Frontend Developer",
    },
    {
      fullName: "Paul Folorunsho",
      zeduUsername: "Paul Folorunsho",
      githubUsername: "folip01",
      role: "Member",
      field: "Backend Development",
    },
  ],
};
