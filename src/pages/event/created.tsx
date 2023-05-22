import { useMemo } from "react";
import { getAuth } from "firebase/auth";
import { TemplateSearchEvent, TemplatePageGuestNotAllowed } from "@/components";
import { useAuthorization, useIdentification } from "@/hooks";

export default function SubscribedEvent() {
  const { stateIdentification } = useIdentification();
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
      <TemplateSearchEvent title="Your Events" viewType="userCreatedEvents" />
    ),
    []
  );

  return isAuthorized ? renderPage : renderGuestNotAllowed;
}
