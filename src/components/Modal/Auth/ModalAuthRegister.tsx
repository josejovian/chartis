import { useMemo } from "react";
import { Button } from "semantic-ui-react";
import clsx from "clsx";
import { ModalAuthInput } from "@/components";
import { useModal, useScreen } from "@/hooks";

export function ModalAuthRegister() {
  const { type } = useScreen();
  const { showLogin } = useModal();

  const renderFormHead = useMemo(
    () => (
      <div className="flex flex-col items-center bg-white mb-8">
        <h2 className="text-20px">Register</h2>
        <span className="mt-2">
          Already have an account?{" "}
          <u className="cursor-pointer" onClick={showLogin}>
            Login
          </u>{" "}
          instead.
        </span>
      </div>
    ),
    [showLogin]
  );

  const renderFormBody = useMemo(
    () => (
      <div
        className={clsx(
          "flex flex-col items-center bg-white",
          type === "mobile" ? "w-full" : "!w-80"
        )}
      >
        <ModalAuthInput iconLabel="user" placeholder="Enter your full name" />
        <ModalAuthInput iconLabel="mail" placeholder="Enter your email" />
        <ModalAuthInput iconLabel="key" placeholder="Enter your password" />
        <Button color="yellow">Register</Button>
      </div>
    ),
    [type]
  );

  return (
    <div className="flex flex-col items-center">
      {renderFormHead}
      {renderFormBody}
    </div>
  );
}
