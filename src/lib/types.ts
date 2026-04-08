export type Project = {
  id: number;
  node_id: string;
  title: string;
  description: string;
  techs: string[];
  demo: string | null;
  repo: string | null;
  sort_order: number;
  created_at: string;
};

export type GuestbookEntry = {
  id: number;
  username: string;
  message: string;
  created_at: string;
};

export type CvVersion = {
  id: number;
  name: string;
  content: string;
  is_primary: boolean;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "created_at">;
        Update: Partial<Omit<Project, "id" | "created_at">>;
      };
      guestbook: {
        Row: GuestbookEntry;
        Insert: Omit<GuestbookEntry, "id" | "created_at">;
        Update: Partial<Omit<GuestbookEntry, "id" | "created_at">>;
      };
    };
  };
};
