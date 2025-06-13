export interface Group {
  _id: string;
  name: string;
  owner: string;
  members: {
    _id: string;
    name: string;
  }[];
  picture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
