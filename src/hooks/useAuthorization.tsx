import { useCallback, useEffect, useRef, useState } from "react";
import { type Auth } from "firebase/auth";
import { hasPermission } from "@/utils";
import { IdentificationType, StateObject, UserPermissionType } from "@/types";

interface useAuthorizationProps {
  auth: Auth;
  minPermission?: UserPermissionType;
  stateIdentification: StateObject<IdentificationType>;
  onFail?: () => void;
}

export function useAuthorization({
  auth,
  minPermission,
  stateIdentification,
  onFail,
}: useAuthorizationProps) {
  const resolved = useRef(false);
  const [verdict, setVerdict] = useState<boolean>();
  const [{ user, initialized }] = stateIdentification;

  const handleCheckPermission = useCallback(() => {
    if (verdict !== undefined || !initialized) return;

    if (auth.currentUser && user) {
      const permission = user.role;

      setVerdict(
        Boolean(permission && hasPermission(permission, minPermission))
      );
    } else {
      setVerdict(false);
    }
  }, [auth.currentUser, initialized, minPermission, user, verdict]);

  const handleDealWithVerdict = useCallback(() => {
    if (verdict === false && !resolved.current) {
      onFail && onFail();
      resolved.current = true;
    }
  }, [onFail, verdict]);

  useEffect(() => {
    handleCheckPermission();
  }, [handleCheckPermission, stateIdentification]);

  useEffect(() => {
    handleDealWithVerdict();
  }, [handleDealWithVerdict, verdict]);

  return verdict;
}
