import { useMemo } from "react";
import clsx from "clsx";
import { useNotification, useScreen } from "@/hooks";
import {
  ResponsiveInlineStyleType,
  StateObject,
  UserPermissionType,
} from "@/types";
import {
  LayoutNavbarAuth,
  LayoutNavbarButton,
  LayoutNavbarMain,
} from "@/components";
import { useIdentification } from "@/hooks/useIdentification";
import { type SemanticICONS } from "semantic-ui-react";
import { hasPermission } from "@/utils";

export interface LayoutNavbarItemProps {
  category: string;
  name: string;
  icon: SemanticICONS;
  href: string;
  onClick?: () => void;
  permission?: UserPermissionType;
  active?: boolean;
  hidden?: boolean;
  alert?: boolean;
}

export interface LayoutNavbarProps {
  stateNavBar: StateObject<boolean>;
}

export function LayoutNavbar({ stateNavBar }: LayoutNavbarProps) {
  const [navBar, setNavBar] = stateNavBar;
  const { type } = useScreen();
  const { stateIdentification } = useIdentification();
  const { user } = stateIdentification[0];
  const { notification } = useNotification();

  const unread = useMemo(() => notification.length > 0, [notification.length]);

  const permission = useMemo<UserPermissionType>(() => {
    if (user && user.role === "admin") return "admin";
    if (user) return "user";
    return "guest";
  }, [user]);

  const links: Record<string, LayoutNavbarItemProps[]> = useMemo(() => {
    const allLinks: LayoutNavbarItemProps[] = [
      {
        category: "",
        name: "Home",
        icon: "home",
        active: true,
        href: "/",
      },
      {
        category: "",
        name: "Notifications",
        icon: "bell",
        permission: "user",
        href: "/notifications",
        alert: unread,
      },
      {
        category: "",
        name: "Profile",
        icon: "user",
        permission: "user",
        href: `/profile/${user && user.id}`,
        hidden: !user,
      },
      {
        category: "Events",
        name: "Post Event",
        icon: "calendar plus",
        permission: "user",
        href: "/event/new",
      },
      {
        category: "Events",
        name: "Your Events",
        icon: "calendar alternate",
        permission: "user",
        href: "/event/created",
      },
      {
        category: "Events",
        name: "Followed Events",
        icon: "calendar check",
        permission: "user",
        href: "/event/subscribed",
      },
      {
        category: "Admin",
        name: "Manage Users",
        icon: "users",
        href: "/users",
        permission: "admin",
      },
      {
        category: "Admin",
        name: "Manage Reports",
        icon: "clipboard list",
        href: "/reports",
        permission: "admin",
      },
    ];

    const accessibleLinks = allLinks
      .filter(
        (link) => hasPermission(permission, link.permission) && !link.hidden
      )
      .reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (links: any, link) => {
          if (!links[link.category]) links[link.category] = [];
          links[link.category].push(link);
          return links;
        },
        { "": [] }
      );

    return accessibleLinks;
  }, [permission, unread, user]);

  const renderNavBarToggle = useMemo(
    () =>
      type !== "desktop_lg" && (
        <LayoutNavbarButton
          icon={`chevron ${navBar ? "left" : "right"}`}
          onClick={() => {
            setNavBar((prev) => !prev);
          }}
        />
      ),
    [navBar, setNavBar, type]
  );

  const renderNavBarContent = useMemo(
    () =>
      navBar ? (
        <>
          <LayoutNavbarMain
            links={links}
            permission={permission}
            stateNavBar={stateNavBar}
            type={type}
          />
          <LayoutNavbarAuth />
        </>
      ) : (
        <div className="p-4">{renderNavBarToggle}</div>
      ),
    [links, navBar, permission, renderNavBarToggle, stateNavBar, type]
  );

  const navBarStyle = useMemo(() => {
    if (navBar) return NAVBAR_WRAPPER_RESPONSIVE_STYLE["desktop_lg"];
    return NAVBAR_WRAPPER_RESPONSIVE_STYLE[type];
  }, [navBar, type]);

  return (
    <>
      <div style={NAVBAR_WRAPPER_RESPONSIVE_STYLE[type]} />
      <nav
        className={clsx(
          "fixed z-30",
          "h-full flex flex-col justify-between",
          "bg-slate-900 text-gray-50"
        )}
        style={navBarStyle}
      >
        {renderNavBarContent}
      </nav>
    </>
  );
}

const NAVBAR_WRAPPER_RESPONSIVE_STYLE: ResponsiveInlineStyleType = {
  desktop_lg: { minWidth: "300px" },
  desktop_sm: { minWidth: "64px" },
  mobile: { display: "none" },
};
