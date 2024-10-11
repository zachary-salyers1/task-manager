export type Client = {
  id: string;
  name: string;
};

export type Project = {
  id: string;
  clientId: string;
  name: string;
};

export type Task = {
  id: string;
  projectId: string;
  name: string;
  completionDate: Date;
};