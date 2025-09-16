import { v4 as uuid } from "uuid";

export const generateId = (number) => {
  return uuid().substring(0, number);
};
