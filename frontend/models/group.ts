export interface Group {
  _id: string;
  name: string;
  owner: string;
  members: {
    _id: string;
    name: string;
  }[];
  groupPicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
