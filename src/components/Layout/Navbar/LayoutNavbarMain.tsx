import { useMemo } from "react";
import clsx from "clsx";
import { ScreenSizeCategoryType, StateObject } from "@/types";
import { LayoutNavbarItem, LayoutNavbarItemProps } from "@/components";
import { useRouter } from "next/router";
import { LayoutNavbarButton } from "./LayoutNavbarButton";

export interface LayoutNavbarMainProps {
  links: Record<string, LayoutNavbarItemProps[]>;
  stateNavBar: StateObject<boolean>;
  type: ScreenSizeCategoryType;
}

export function LayoutNavbarMain({
  links,
  stateNavBar,
  type,
}: LayoutNavbarMainProps) {
  const router = useRouter();
  const [navBar, setNavBar] = stateNavBar;

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

  return (
    <div>
      {renderHead}
      {renderSearch}
      {renderLinks}
    </div>
  );
}
