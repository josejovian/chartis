import { useMemo } from "react";
import clsx from "clsx";
import { useScreen } from "@/hooks";
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

const NAVBAR_WIDTH_MAX_INLINE_STYLE = {
  width: "300px",
  minWidth: "300px",
};

const NAVBAR_WIDTH_MIN_INLINE_STYLE = {
  width: "64px",
  minWidth: "64px",
};

const NAVBAR_WRAPPER_RESPONSIVE_STYLE: ResponsiveInlineStyleType = {
  desktop_lg: NAVBAR_WIDTH_MAX_INLINE_STYLE,
  desktop_sm: NAVBAR_WIDTH_MIN_INLINE_STYLE,
  mobile: { display: "none" },
};

export function LayoutNavbar({ stateNavBar }: LayoutNavbarProps) {
  const [navBar, setNavBar] = stateNavBar;
  const { type } = useScreen();
  const stateIdentification = useIdentification();
  const { user } = stateIdentification[0];

  const permission = useMemo<UserPermissionType>(
    () => (user ? "user" : "guest"),
    [user]
  );

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
          name: "Notification",
          icon: "bell",
        },
        {
          name: "Profile",
          icon: "user",
          permission: "user",
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
        },
      ],
      Following: [
        {
          name: "Followed Events",
          icon: "calendar check",
        },
        {
          name: "Followed Tags",
          icon: "tags",
        },
      ],
    }),
    []
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

  return (
    <div
      className="relative z-30"
      style={
        type === "mobile" && navBar
          ? {
              width: 0,
            }
          : NAVBAR_WRAPPER_RESPONSIVE_STYLE[type]
      }
    >
      <div
        className={clsx(
          "h-screen flex flex-col justify-between",
          "bg-slate-900 text-gray-50"
        )}
        style={
          navBar ? NAVBAR_WIDTH_MAX_INLINE_STYLE : NAVBAR_WIDTH_MIN_INLINE_STYLE
        }
      >
        {renderNavBarContent}
      </div>
    </div>
  );
}
