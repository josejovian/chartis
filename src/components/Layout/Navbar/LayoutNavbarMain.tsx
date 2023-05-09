import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  ScreenSizeCategoryType,
  StateObject,
  UserPermissionType,
} from "@/types";
import { LayoutNavbarItem, LayoutNavbarItemProps } from "@/components";
import { useRouter } from "next/router";
import { LayoutNavbarButton } from "./LayoutNavbarButton";
import Image from "next/image";
import Link from "next/link";

export interface LayoutNavbarMainProps {
  links: Record<string, LayoutNavbarItemProps[]>;
  permission: UserPermissionType;
  stateNavBar: StateObject<boolean>;
  type: ScreenSizeCategoryType;
}

export function LayoutNavbarMain({
  links,
  permission,
  stateNavBar,
  type,
}: LayoutNavbarMainProps) {
  const router = useRouter();
  const [navBar, setNavBar] = stateNavBar;
  const [categoryOrder] = useState(["", "Events", "Admin"]);

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

  const renderHead = useMemo(
    () => (
      <div className="p-4 flex items-center justify-between font-bold">
        <div className="flex items-center">
          <Link href="/">
            <Image src="Logo.svg" alt="Chartis Logo" width={110} height={32} />
          </Link>
        </div>
        {renderNavBarToggle}
      </div>
    ),
    [renderNavBarToggle]
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
        {categoryOrder.map((categoryName, idx) => {
          if (!links[categoryName]) return <></>;
          return (
            <>
              <div
                className={clsx("mt-4", idx > 0 && "border-t border-slate-600")}
                key={`LayoutNavbarCategory_${categoryName}`}
              >
                <div className={idx > 0 ? "p-4" : "hidden"}>
                  <span className="text-slate-300 italic font-black uppercase">
                    {categoryName}
                  </span>
                </div>
                {links[categoryName].map(({ onClick, ...link }) => (
                  <LayoutNavbarItem
                    key={`LayoutNavbarItem_${link.name}`}
                    {...link}
                    onClick={() => {
                      if (type !== "desktop_lg") setNavBar(false);
                    }}
                  />
                ))}
              </div>
            </>
          );
        })}
      </>
    ),
    [categoryOrder, links, setNavBar, type]
  );

  return (
    <div>
      {renderHead}
      {renderSearch}
      {renderLinks}
    </div>
  );
}
