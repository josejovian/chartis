/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { readData } from "@/utils";
import clsx from "clsx";
import {
  UserPicture,
  PageSearchEventCard,
  LayoutTemplateCard,
  PageProfileChangePasswordTab,
  PageProfileDetailTab,
  PageProfileEdit,
} from "@/components";
import { useScreen } from "@/hooks";
import { UserType, UserProfileTabNameType, ResponsiveStyleType } from "@/types";

export default function Profile() {
  const auth = getAuth();
  const user = auth.currentUser;
  const profileCardRef = createRef<HTMLDivElement>();

  const [activeCard, setActiveCard] =
    useState<UserProfileTabNameType>("detail");

  const { type } = useScreen();

  const router = useRouter();
  const { id } = router.query;
  const stateUser = useState<UserType>({
    id: "",
    name: "",
    email: "",
    joinDate: 0,
  });
  const [profile, setProfile] = stateUser;
  const [, setLoading] = useState(true);
  const [, setError] = useState(false);

  const handleGetProfile = useCallback(async () => {
    if (!id) return;

    await readData("users", id as string)
      .then((result) => {
        setLoading(false);
        if (result) {
          setError(false);
          setProfile(result as UserType);
        } else {
          throw Error("Invalid user data.");
        }
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, [id, setProfile]);

  const handleAdjustEventSearcherHeight = useCallback(() => {
    const eventSearcherEmbed = document.getElementsByClassName(
      "PageSearchEventCardEmbed"
    )[0];
    if (!profileCardRef.current || !eventSearcherEmbed) return;

    const profileCardHeight =
      profileCardRef.current.offsetHeight + type === "mobile" ? 16 : 272;

    (eventSearcherEmbed as HTMLDivElement).style.display = "initial";
    (
      eventSearcherEmbed as HTMLDivElement
    ).style.maxHeight = `calc(100% - ${profileCardHeight}px)`;
  }, [profileCardRef, type]);

  useEffect(() => {
    handleGetProfile();
  }, [handleGetProfile]);

  useEffect(() => {
    handleAdjustEventSearcherHeight();
  });

  const renderCardContent = useMemo(() => {
    switch (activeCard) {
      case "detail":
        return (
          <PageProfileDetailTab
            profile={profile}
            type={type}
            onClickEdit={() => setActiveCard("edit-profile")}
            onClickChangePassword={() => setActiveCard("edit-password")}
          />
        );
      case "edit-password":
        return (
          user && (
            <PageProfileChangePasswordTab
              profile={profile}
              type={type}
              user={user}
              onCancelEdit={() => setActiveCard("detail")}
            />
          )
        );
      case "edit-profile":
        return (
          <PageProfileEdit
            profile={profile}
            type={type}
            onCancelEdit={() => setActiveCard("detail")}
          />
        );
    }
  }, [activeCard, profile, type, user]);

  const renderProfileCard = useMemo(
    () => (
      <div
        ref={profileCardRef}
        className={clsx(
          "ProfileCard card ui !w-full !flex-row !h-fit",
          type !== "mobile" ? "!p-16 gap-16" : "!p-4"
        )}
      >
        <div>
          {type !== "mobile" && (
            <UserPicture fullName={profile.name ?? ""} size="big" />
          )}
        </div>
        <div className="ProfileCardDetail !w-full flex flex-col justify-between">
          {renderCardContent}
        </div>
      </div>
    ),
    [profile.name, profileCardRef, renderCardContent, type]
  );

  const renderEventSearcher = useMemo(
    () =>
      (type !== "mobile" || activeCard === "detail") && (
        <PageSearchEventCard
          className={clsx(
            "PageSearchEventCard PageSearchEventCardEmbed !bg-sky-50 !pb-0 !mx-0 !overflow-visible"
          )}
          type={type}
          viewType="userCreatedEvents"
        />
      ),
    [activeCard, type]
  );

  return (
    <LayoutTemplateCard
      title="Profile"
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
      classNameMain={clsx(
        LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type],
        "flex flex-col flex-auto !justify-start"
      )}
    >
      <>
        {renderProfileCard}
        {renderEventSearcher}
      </>
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20 !pb-0",
  desktop_sm: "!px-20 !pb-0",
  mobile: "!p-8 !pb-0",
};
