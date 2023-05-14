import { useCallback, useMemo } from "react";
import clsx from "clsx";
import {
  useModal,
  useNavBar,
  useNotification,
  useScreen,
  useToast,
} from "@/hooks";
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

interface LayoutNavbarItemProps {
  category: string;
  name: string;
  icon: SemanticICONS;
  href: string;
  permission?: UserPermissionType;
  hidden?: boolean;
  alert?: boolean;
}

export interface LayoutNavbarProps {
  stateNavBar: StateObject<boolean>;
}

export function LayoutNavbar({ stateNavBar }: LayoutNavbarProps) {
  const [isNavBarVisible, setIsNavBarVisible] = stateNavBar;
  const { type } = useScreen();
  const { stateIdentification } = useIdentification();
  const screen = useScreen();
  const { togglable } = useNavBar({
    screen,
  });
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
    if (!user) setModal(<ModalAuthLogin />);
  }, [setModal, user]);

  const handleShowRegisterModal = useCallback(() => {
    if (!user) setModal(<ModalAuthRegister />);
  }, [setModal, user]);

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
          setIsNavBarVisible((prev) => !prev);
        }}
        icon={`chevron ${isNavBarVisible ? "left" : "right"}`}
        className={clsx(
          "!w-8 !h-8 !flex !justify-center !items-center",
          "!rounded-md !bg-slate-700 !text-gray-50",
          "!hover:bg-slate-600 !active:bg-slate-500 !focus:bg-slate-500 "
        )}
      />
    ),
    [isNavBarVisible, setIsNavBarVisible]
  );

  const renderHeader = useMemo(
    () => (
      <div className="p-4 flex items-center font-bold">
        <Link href="/" className={"mr-auto"}>
          <Image src="Logo.svg" alt="Chartis Logo" width={110} height={32} />
        </Link>
        {togglable && renderToggleButton}
      </div>
    ),
    [renderToggleButton, togglable]
  );

  const renderSearch = useMemo(
    () => (
      <div className={clsx("px-8 text-primary-5 hover:text-primary-5")}>
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
      <Link
        href={link.href}
        onClick={() => {
          if (togglable) setIsNavBarVisible(false);
        }}
      >
        <span
          className={clsx(
            "relative flex items-center h-8 border-l-4 text-sm pl-4",
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
        >
          <span
            className="flex items-center justify-center"
            style={{
              width: "2rem",
            }}
          >
            <Icon.Group>
              <Icon name={link.icon} />
              {link.alert && (
                <Icon name="circle" color="red" corner="top right" />
              )}
            </Icon.Group>
          </span>
          <span>{link.name}</span>
        </span>
      </Link>
    ),
    [router.asPath, setIsNavBarVisible, togglable]
  );

  const renderLinks = useMemo(
    () => (
      <div
        className={
          permission !== "guest" ? "divide-y divide-slate-600 space-y-4" : ""
        }
      >
        {Object.keys(links).map((categoryName, idx) => (
          <div key={`navbarmain${categoryName}`}>
            {permission !== "guest" && (
              <span
                className={clsx(
                  idx > 0 && "p-4",
                  "block text-slate-300 italic font-black uppercase"
                )}
              >
                {categoryName}
              </span>
            )}
            {links[categoryName].map((link) => renderNavBarLink(link))}
          </div>
        ))}
      </div>
    ),
    [links, permission, renderNavBarLink]
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
            <User id={user.id} type="all" truncate />
            <Button size="tiny" onClick={handleLogout} color="red">
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
      isNavBarVisible ? (
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
      renderAuth,
      renderHeader,
      renderLinks,
      renderSearch,
      renderToggleButton,
      isNavBarVisible,
    ]
  );

  const navBarStyle = useMemo(() => {
    if (isNavBarVisible) return NAVBAR_WRAPPER_RESPONSIVE_STYLE["desktop_lg"];
    return NAVBAR_WRAPPER_RESPONSIVE_STYLE[type];
  }, [isNavBarVisible, type]);

  const navBarFillerStyle = useMemo(() => {
    if (togglable) {
      return NAVBAR_WRAPPER_RESPONSIVE_STYLE[type];
    } else {
      setIsNavBarVisible(true);
      return NAVBAR_WRAPPER_RESPONSIVE_STYLE["desktop_lg"];
    }
  }, [setIsNavBarVisible, togglable, type]);

  return (
    <>
      <div style={navBarFillerStyle} />
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
