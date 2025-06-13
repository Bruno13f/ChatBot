export interface Group {
  _id: string;
  name: string;
  owner: string;
  members: string[];
  picture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
