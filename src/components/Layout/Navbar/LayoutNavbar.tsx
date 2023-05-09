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
  LayoutNavbarItemProps,
  LayoutNavbarMain,
} from "@/components";
import { useIdentification } from "@/hooks/useIdentification";

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

  const links = useMemo<Record<string, LayoutNavbarItemProps[]>>(
    () => ({
      "": [
        {
          name: "Home",
          icon: "home",
          active: true,
          href: "/",
        },
        {
          name: "Followed Events",
          icon: "calendar check",
          permission: "guest",
          href: "/event/subscribed",
        },
        {
          name: "Notifications",
          icon: "bell",
          permission: "user",
          href: "/notifications",
          alert: unread,
        },
        {
          name: "Profile",
          icon: "user",
          permission: "user",
          href: `/profile/${user && user.id}`,
          hidden: !user,
        },
      ],
      Events: [
        {
          name: "Post Event",
          icon: "calendar plus",
          permission: "user",
          href: "/event/new",
        },
        {
          name: "Your Events",
          icon: "calendar alternate",
          permission: "user",
          href: "/event/created",
        },
        {
          name: "Followed Events",
          icon: "calendar check",
          permission: "user",
          href: "/event/subscribed",
        },
      ],
      Admin: [
        {
          name: "Manage Users",
          icon: "users",
          href: "/users",
          permission: "admin",
        },
        {
          name: "Manage Reports",
          icon: "clipboard list",
          href: "/reports",
          permission: "admin",
        },
      ],
    }),
    [unread, user]
  );

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
