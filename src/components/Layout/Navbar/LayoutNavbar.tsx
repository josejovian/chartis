import { useMemo } from "react";
import { Icon } from "semantic-ui-react";
import clsx from "clsx";
import { useScreen } from "@/hooks";
import { ResponsiveInlineStyleType, StateObject } from "@/types";
import { LayoutNavbarItem, LayoutNavbarItemProps } from "@/components";
import { useRouter } from "next/router";

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
  const router = useRouter();

  const links = useMemo<Record<string, LayoutNavbarItemProps[]>>(
    () => ({
      "": [
        {
          name: "Home",
          icon: "home",
          active: true,
        },
        {
          name: "Notification",
          icon: "bell",
        },
        {
          name: "Profile",
          icon: "user",
        },
      ],
      Events: [
        {
          name: "Post Event",
          icon: "calendar plus",
        },
        {
          name: "Your Events",
          icon: "calendar alternate",
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
        <div
          className={clsx(
            "!w-8 !h-8 flex justify-center !m-0",
            "rounded-md bg-slate-700 hover:bg-slate-600"
          )}
          style={{
            paddingTop: "0.35rem",
            paddingLeft: "0.15rem",
          }}
          onClick={() => {
            setNavBar((prev) => !prev);
          }}
        >
          <Icon
            className="!m-0"
            name={`chevron ${navBar ? "left" : "right"}`}
          />
        </div>
      ),
    [navBar, setNavBar, type]
  );

  const renderLogo = useMemo(
    () => <div className="w-8 h-8 rounded-md bg-amber-500" />,
    []
  );

  const renderHead = useMemo(
    () => (
      <div className="p-4 flex items-center justify-between font-bold">
        <div className="flex items-center">
          {renderLogo}
          <div className="ml-4" style={{ fontSize: "16px" }}>
            CHARTIS
          </div>
        </div>
        {renderNavBarToggle}
      </div>
    ),
    [renderLogo, renderNavBarToggle]
  );

  const renderSearch = useMemo(
    () => (
      <div
        className={clsx(
          "LayoutNavbarSearch",
          "mx-8 mt-4",
          "flex items-center",
          "bg-slate-800 hover:bg-slate-900 text-primary-5 border border-primary-5",
          "rounded-md cursor-pointer"
        )}
        onClick={() => {
          router.push("/search");
        }}
      >
        Search
      </div>
    ),
    [router]
  );

  const renderLinks = useMemo(
    () => (
      <>
        {Object.entries(links).map(([category, links], idx) => (
          <div
            className={clsx("mt-4", idx > 0 && "border-t border-slate-600")}
            key={`LayoutNavbarCategory_${category}`}
          >
            <div className={idx > 0 ? "p-4" : "hidden"}>
              <span className="text-slate-300 italic font-black uppercase">
                {category}
              </span>
            </div>
            {links.map((link) => (
              <LayoutNavbarItem
                key={`LayoutNavbarItem_${link.name}`}
                {...link}
              />
            ))}
          </div>
        ))}
      </>
    ),
    [links]
  );

  const renderNavBarContent = useMemo(
    () =>
      navBar ? (
        <>
          {renderHead}
          {renderSearch}
          {renderLinks}
        </>
      ) : (
        <div className="p-4">{renderNavBarToggle}</div>
      ),
    [navBar, renderHead, renderSearch, renderLinks, renderNavBarToggle]
  );

  return (
    <div
      className="z-30"
      style={
        type === "mobile" && navBar
          ? {
              width: 0,
            }
          : NAVBAR_WRAPPER_RESPONSIVE_STYLE[type]
      }
    >
      <div
        className={clsx("h-screen", "bg-slate-900 text-gray-50")}
        style={
          navBar ? NAVBAR_WIDTH_MAX_INLINE_STYLE : NAVBAR_WIDTH_MIN_INLINE_STYLE
        }
      >
        {renderNavBarContent}
      </div>
    </div>
  );
}
