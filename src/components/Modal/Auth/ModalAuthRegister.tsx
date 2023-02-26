import { useCallback, useMemo } from "react";
import { register } from "@/firebase";
import { ModalAuthTemplate } from "@/components";
import { useModal } from "@/hooks";
import { FormRegister, SchemaRegister } from "@/utils";
import { FormRegisterProps } from "@/types";

export function ModalAuthRegister() {
  const { showLogin } = useModal();

  const handleRegister = useCallback(async (values: unknown) => {
    await register({
      ...(values as FormRegisterProps),
      onSuccess: () => {
        console.log("Login Success!");
      },
      onFail: () => {
        console.log("Login Fail!");
      },
    });
  }, []);

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

  return (
    <ModalAuthTemplate
      formFields={FormRegister}
      formHead={renderFormHead}
      formName="Register"
      formSchema={SchemaRegister}
      onSubmit={handleRegister}
    />
  );
}
