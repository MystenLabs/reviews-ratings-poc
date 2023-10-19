import { UserRole } from "../types/Authentication";

interface IUserRoles {
  ROLE_1: UserRole;
  ROLE_2: UserRole;
}

export const USER_ROLES: IUserRoles = {
  ROLE_1: "serviceOwner",
  ROLE_2: "user",
};
