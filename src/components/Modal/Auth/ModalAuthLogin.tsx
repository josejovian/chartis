import { useMemo } from "react";
import { Button } from "semantic-ui-react";
import clsx from "clsx";
import { ModalAuthInput } from "@/components";
import { useModal, useScreen } from "@/hooks";

export function ModalAuthLogin() {
  const { type } = useScreen();
  const { showRegister } = useModal();

  const renderFormHead = useMemo(
    () => (
      <div className="flex flex-col items-center bg-white mb-8">
        <h2 className="text-20px">Login</h2>
        <span className="mt-2">
          No account?{" "}
          <u className="cursor-pointer" onClick={showRegister}>
            Register
          </u>{" "}
          instead.
        </span>
      </div>
    ),
    [showRegister]
  );

  const renderFormBody = useMemo(
    () => (
      <div
        className={clsx(
          "flex flex-col items-center bg-white",
          type === "mobile" ? "w-full" : "!w-80"
        )}
      >
        <ModalAuthInput iconLabel="mail" placeholder="Enter your email" />
        <ModalAuthInput iconLabel="key" placeholder="Enter your password" />
        <Button color="yellow">Login</Button>
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
