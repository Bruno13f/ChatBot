export interface Group {
  _id: string;
  name: string;
  owner: string;
  members: {
    _id: string;
    name: string;
    profilePicture?: string;
  }[];
  groupPicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
  messageCount?: number;
}
