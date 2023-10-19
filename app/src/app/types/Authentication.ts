export type UserRole = "serviceOwner" | "user";

export interface UserProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface AuthenticationContextProps {
  user: UserProps;
  isLoading: boolean;
  handleLoginAs: (user: UserRole) => void;
  handleLogout: () => void;
}
