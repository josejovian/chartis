import { useMemo } from "react";
import clsx from "clsx";
import {
  ScreenSizeCategoryType,
  StateObject,
  UserPermissionType,
} from "@/types";
import { LayoutNavbarItem, LayoutNavbarItemProps } from "@/components";
import { useRouter } from "next/router";
import { LayoutNavbarButton } from "./LayoutNavbarButton";
import { hasPermission } from "@/utils";
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
        {Object.entries(links).map(([category, links], idx) => {
          const allowedLinks = links.filter((link) =>
            hasPermission(permission, link.permission)
          );

          return (
            allowedLinks.length > 0 && (
              <div
                className={clsx("mt-4", idx > 0 && "border-t border-slate-600")}
                key={`LayoutNavbarCategory_${category}`}
              >
                <div className={idx > 0 ? "p-4" : "hidden"}>
                  <span className="text-slate-300 italic font-black uppercase">
                    {category}
                  </span>
                </div>
                {allowedLinks.map(({ onClick, ...link }) => (
                  <LayoutNavbarItem
                    key={`LayoutNavbarItem_${link.name}`}
                    {...link}
                    onClick={() => {
                      onClick && onClick();
                      if (type !== "desktop_lg") setNavBar(false);
                    }}
                  />
                ))}
              </div>
            )
          );
        })}
      </>
    ),
    [links, permission, setNavBar, type]
  );

  return (
    <div>
      {renderHead}
      {renderSearch}
      {renderLinks}
    </div>
  );
}
