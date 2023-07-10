import { useMemo } from "react";
import { getAuth } from "firebase/auth";
import { TemplateSearchEvent, TemplatePageGuestNotAllowed } from "@/components";
import { useAuthorization, useIdentification } from "@/hooks";

export default function CreatedEventPage() {
  const { stateIdentification } = useIdentification();
  const { user } = stateIdentification[0];
  const auth = getAuth();
  const isAuthorized = useAuthorization({
    auth,
    stateIdentification,
    minPermission: "user",
  });

  const renderGuestNotAllowed = useMemo(
    () => <TemplatePageGuestNotAllowed includeLayoutWrapper />,
    []
  );

  const renderPage = useMemo(
    () => (
      <TemplateSearchEvent
        title="Your Events"
        viewType="userCreatedEvents"
        userId={user ? user.id : undefined}
      />
    ),
    [user]
  );

  return isAuthorized ? renderPage : renderGuestNotAllowed;
}
