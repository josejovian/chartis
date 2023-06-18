/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { readData, sleep, updateData } from "@/utils";
import clsx from "clsx";
import {
  UserPicture,
  LayoutTemplateCard,
  PageProfileChangePasswordTab,
  PageProfileDetailTab,
  PageProfileEdit,
  TemplateSearchEvent,
  LayoutNotice,
} from "@/components";
import { useIdentification, useScreen, useToast } from "@/hooks";
import {
  UserType,
  UserProfileTabNameType,
  ResponsiveStyleType,
  UserProfileViewNameType,
} from "@/types";
import { ASSET_NO_CONTENT } from "@/consts";
import { Button } from "semantic-ui-react";

export default function Profile() {
  const auth = getAuth();
  const authUser = auth.currentUser;
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
  const setUser = stateUser[1];
  const { stateIdentification } = useIdentification();

  const { initialized, user } = stateIdentification[0];
  const setIdentification = stateIdentification[1];
  const { addToastPreset } = useToast();

  const [profile, setProfile] = stateUser;
  const [viewType, setViewType] = useState<UserProfileViewNameType>("default");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(false);

  const handleGetProfile = useCallback(async () => {
    if (!id) return;

    await readData("users", id as string)
      .then((result) => {
        setLoading(false);
        if (result) {
          setIdentification((prev) => ({
            ...prev,
            users: {
              ...prev.users,
              [id as string]: {
                ...result,
                id: id as string,
              },
            },
          }));
          setError(false);
          setProfile({ ...result, id } as UserType);
          const thisViewType = (() => {
            if (initialized && user && authUser) {
              if (user.id === id) return "self";
              if (user.role === "admin") return "admin";
            }
            return "default";
          })();
          setViewType(thisViewType);
        } else {
          throw Error("Invalid authUser data.");
        }
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, [authUser, id, initialized, setIdentification, setProfile, user]);

  const handleAdjustEventSearcherHeight = useCallback(() => {
    const eventSearcherEmbed = document.getElementsByClassName(
      "PageSearchEventCardEmbed"
    )[0];
    if (!profileCardRef.current || !eventSearcherEmbed) return;

    let profileCardHeight = profileCardRef.current.offsetHeight;

    if (type === "mobile") profileCardHeight += 170;
    else profileCardHeight += 128;

    (eventSearcherEmbed as HTMLDivElement).style.display = "initial";
    (
      eventSearcherEmbed as HTMLDivElement
    ).style.maxHeight = `calc(100% - ${profileCardHeight}px)`;
  }, [profileCardRef, type]);

  const handleToggleBanUser = useCallback(
    async (isBanned: boolean) => {
      if (processing) return;

      setProcessing(true);
      await sleep(200);
      setUser((prev) => ({
        ...prev,
        ban: !isBanned,
      }));

      await updateData("users", id as string, {
        ban: !isBanned,
      })
        .then(async () => {
          await sleep(200);
          setProcessing(false);
          addToastPreset(!isBanned ? "feat-user-ban" : "feat-user-unban");
        })
        .catch(() => {
          setProcessing(false);
          addToastPreset("fail-post");
          setUser((prev) => ({
            ...prev,
            ban: isBanned,
          }));
        });
    },
    [addToastPreset, id, processing, setUser]
  );

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
            viewType={viewType}
            onClickEdit={() => setActiveCard("edit-profile")}
            onClickChangePassword={() => setActiveCard("edit-password")}
            onBanUser={() => handleToggleBanUser(Boolean(profile.ban))}
            loadingBan={processing}
          />
        );
      case "edit-password":
        return (
          authUser && (
            <PageProfileChangePasswordTab
              profile={profile}
              type={type}
              user={authUser}
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
  }, [
    activeCard,
    profile,
    type,
    viewType,
    processing,
    authUser,
    handleToggleBanUser,
  ]);

  const renderProfileCard = useMemo(
    () => (
      <div
        ref={profileCardRef}
        className={clsx(
          "ProfileCard card ui !w-full !flex-row !h-fit",
          type === "desktop_lg" && "!p-16 gap-16",
          type === "desktop_sm" && "!p-8 gap-8",
          type === "mobile" && "!p-4"
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
    [profile, profileCardRef, renderCardContent, type]
  );

  const renderEventSearcher = useMemo(
    () =>
      /** @todos this won't show the currently viewed events */
      activeCard === "detail" && (
        <TemplateSearchEvent
          className="PageSearchEventCard PageSearchEventCardEmbed !bg-sky-50 !pb-0 !mx-0 !overflow-visible"
          title="Your Events"
          viewType="userCreatedEvents"
          userId={id as string}
          noWrapper
        />
      ),
    [activeCard, id]
  );

  const renderContent = useMemo(() => {
    if (loading) return <LayoutNotice preset="loader" />;

    if (error)
      return (
        <LayoutNotice
          illustration={ASSET_NO_CONTENT}
          title="This user does not exist"
          descriptionElement={
            <Button color="yellow" onClick={() => router.push("/")}>
              Go to Home
            </Button>
          }
        />
      );

    return (
      <>
        {renderProfileCard}
        {renderEventSearcher}
      </>
    );
  }, [error, loading, renderEventSearcher, renderProfileCard, router]);

  return (
    <LayoutTemplateCard
      title="Profile"
      htmlTitle={error ? "User Not Found" : `${profile.name}'s Profile`}
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
      {renderContent}
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20 !pb-0",
  desktop_sm: "!px-20 !pb-0",
  mobile: "!p-4 !pb-0",
};
