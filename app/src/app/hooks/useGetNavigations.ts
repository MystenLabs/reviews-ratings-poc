import React from "react";
import { NavigationLink } from "../types/NavigationLink";
import { useAuthentication } from "./useAuthentication";
import { USER_ROLES } from "../constants/USER_ROLES";

const globalNavigations: NavigationLink[] = [];

export const useGetNavigations = () => {
  const { user } = useAuthentication();
  const navigations = React.useMemo<NavigationLink[]>(() => {
    let userNavigations: NavigationLink[] = [];
    const userRoleName =
      user.role.slice(0, 1).toUpperCase() + user.role.slice(1);
    if (user.role === USER_ROLES.ROLE_2) {
      userNavigations = [
        {
          title: "Services",
          href: `/${USER_ROLES.ROLE_2}`,
        },
        {
          title: "My POEs",
          href: "/user/ownedPoes",
        },
        // {
        //   title: `${userRoleName} Test Page`,
        //   href: `/${USER_ROLES.ROLE_2}/test`,
        // },
      ];
    } else if (user.role === USER_ROLES.ROLE_1) {
      userNavigations = [
        {
          title: "Services",
          href: `/${USER_ROLES.ROLE_1}`,
        },
        {
          title: "My Services",
          href: "/serviceOwner/ownedServices",
        },
        // {
        //   title: `${userRoleName} Test Page`,
        //   href: `/${USER_ROLES.ROLE_1}/test`,
        // },
      ];
    } else {
      userNavigations = [
        // {
        //   title: "Home",
        //   href: "/",
        // },
      ];
    }
    return [...userNavigations, ...globalNavigations];
  }, [user.role]);

  return { navigations };
};
