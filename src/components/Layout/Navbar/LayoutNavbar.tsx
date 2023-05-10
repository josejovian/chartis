import { useCallback, useMemo } from "react";
import clsx from "clsx";
import { useModal, useNotification, useScreen, useToast } from "@/hooks";
import {
  ResponsiveInlineStyleType,
  StateObject,
  UserPermissionType,
} from "@/types";
import { ModalAuthLogin, ModalAuthRegister, User } from "@/components";
import { useIdentification } from "@/hooks/useIdentification";
import { Button, Icon, type SemanticICONS } from "semantic-ui-react";
import { hasPermission } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { logout } from "@/firebase";

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
  const router = useRouter();
  const { setModal } = useModal();
  const { addToastPreset } = useToast();

  const isNotificationAlertVisible = useMemo(
    () => notification.length > 0,
    [notification.length]
  );

  // @todo move this to useAuthorization
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
        alert: isNotificationAlertVisible,
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
        {}
      );

    return accessibleLinks;
  }, [isNotificationAlertVisible, permission, user]);

  const handleShowLoginModal = useCallback(() => {
    setModal(<ModalAuthLogin />);
  }, [setModal]);

  const handleShowRegisterModal = useCallback(() => {
    setModal(<ModalAuthRegister />);
  }, [setModal]);

  const handleLogout = useCallback(async () => {
    await logout()
      .then(() => {
        addToastPreset("auth-logout");
        router.replace("/");
      })
      .catch(() => {
        addToastPreset("fail-generic");
      });
  }, [addToastPreset, router]);

  const renderToggleButton = useMemo(
    () => (
      <Button
        onClick={() => {
          setNavBar((prev) => !prev);
        }}
        icon={`chevron ${navBar ? "left" : "right"}`}
        className={clsx(
          "!w-8 !h-8 !flex !justify-center !items-center",
          "!rounded-md !bg-slate-700 !text-gray-50",
          "!hover:bg-slate-600 !active:bg-slate-500 !focus:bg-slate-500 "
        )}
      />
    ),
    [navBar, setNavBar]
  );

  const renderHeader = useMemo(
    () => (
      <div className="p-4 flex items-center font-bold">
        <Link href="/" className={"mr-auto"}>
          <Image src="Logo.svg" alt="Chartis Logo" width={110} height={32} />
        </Link>
        {type !== "desktop_lg" && renderToggleButton}
      </div>
    ),
    [renderToggleButton, type]
  );

  const renderSearch = useMemo(
    () => (
      <div className={clsx("px-8 pt-4 text-primary-5 hover:text-primary-5")}>
        <Link
          className={clsx(
            "flex items-center h-[36px] w-full px-[12px] rounded-md",
            "cursor-pointer hover:bg-slate-900 bg-slate-800",
            "border border-primary-5"
          )}
          href={"/search"}
        >
          Search
        </Link>
      </div>
    ),
    []
  );

  const renderNavBarLink = useCallback(
    (link: LayoutNavbarItemProps) => (
      <div
        className={clsx(
          "relative flex items-center h-8 border-l-4",
          router.asPath === link.href
            ? [
                "text-primary-3 bg-slate-800 hover:bg-slate-700",
                "border-l-4 border-primary-3",
              ]
            : [
                "!text-gray-50 hover:bg-slate-700 border-transparent",
                "cursor-pointer",
              ]
        )}
        onClick={() => {
          if (type !== "desktop_lg") setNavBar(false);
          router.push(link.href);
        }}
      >
        <span className="ml-4 relative">
          <Icon.Group>
            <Icon name={link.icon} />
            {link.alert && (
              <Icon name="circle" color="red" corner="top right" />
            )}
          </Icon.Group>
        </span>
        <span className="ml-2">{link.name}</span>
      </div>
    ),
    [router, setNavBar, type]
  );

  const renderLinks = useMemo(
    () => (
      <div className="divide-y divide-slate-600 space-y-4">
        {Object.keys(links).map((categoryName, idx) => (
          <div key={`navbarmain${categoryName}`}>
            <span
              className={clsx(
                idx > 0 && "p-4",
                "block text-slate-300 italic font-black uppercase"
              )}
            >
              {categoryName}
            </span>
            {links[categoryName].map((link) => renderNavBarLink(link))}
          </div>
        ))}
      </div>
    ),
    [links, renderNavBarLink]
  );

  const renderAuth = useMemo(
    () => (
      <div
        className={clsx(
          "h-12 py-2 px-4 mt-auto flex items-center",
          user ? "justify-between" : "justify-evenly"
        )}
      >
        {user ? (
          <>
            <User id={user.id} type="all" />
            <Button basic size="tiny" onClick={handleLogout} color="red">
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button size="tiny" onClick={handleShowRegisterModal}>
              Register
            </Button>
            <Button color="yellow" size="tiny" onClick={handleShowLoginModal}>
              Login
            </Button>
          </>
        )}
      </div>
    ),
    [handleLogout, handleShowLoginModal, handleShowRegisterModal, user]
  );

  const renderNavBarContent = useMemo(
    () =>
      navBar ? (
        <>
          <nav className="space-y-4">
            {renderHeader}
            {renderSearch}
            {renderLinks}
          </nav>
          {renderAuth}
        </>
      ) : (
        <div className="p-4">{renderToggleButton}</div>
      ),
    [
      navBar,
      renderAuth,
      renderHeader,
      renderLinks,
      renderSearch,
      renderToggleButton,
    ]
  );

  const navBarStyle = useMemo(() => {
    if (navBar) return NAVBAR_WRAPPER_RESPONSIVE_STYLE["desktop_lg"];
    return NAVBAR_WRAPPER_RESPONSIVE_STYLE[type];
  }, [navBar, type]);

  return (
    <>
      <div style={NAVBAR_WRAPPER_RESPONSIVE_STYLE[type]} />
      <div
        style={navBarStyle}
        className={clsx(
          "fixed z-30 h-full text-gray-50 bg-slate-900 divide-y divide-slate-600 flex flex-col"
        )}
      >
        {renderNavBarContent}
      </div>
    </>
  );
}

const NAVBAR_WRAPPER_RESPONSIVE_STYLE: ResponsiveInlineStyleType = {
  desktop_lg: { minWidth: "300px" },
  desktop_sm: { minWidth: "64px" },
  mobile: { display: "none" },
};
