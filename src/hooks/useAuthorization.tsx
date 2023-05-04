import { useCallback, useEffect, useRef, useState } from "react";
import { type Auth } from "firebase/auth";
import { hasPermission } from "@/utils";
import { IdentificationType, StateObject, UserPermissionType } from "@/types";

interface useAuthorizationProps {
  auth: Auth;
  permission?: UserPermissionType;
  stateIdentification: StateObject<IdentificationType>;
  onFail?: () => void;
}

export function useAuthorization({
  auth,
  permission,
  stateIdentification,
  onFail,
}: useAuthorizationProps) {
  const resolved = useRef(false);
  const [verdict, setVerdict] = useState<boolean>();
  const [{ user, users, initialized }] = stateIdentification;

  const handleCheckPermission = useCallback(() => {
    if (verdict !== undefined || !initialized) return;

    if (auth.currentUser) {
      const userPermission = user && users[user.uid].role;

      if (!user || !users[user.uid]) return;

      setVerdict(
        Boolean(userPermission && hasPermission(userPermission, permission))
      );
    } else {
      setVerdict(false);
    }
  }, [auth, initialized, permission, user, users, verdict]);

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
