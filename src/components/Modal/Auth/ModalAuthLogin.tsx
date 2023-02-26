import { useCallback, useMemo } from "react";
import { login } from "@/firebase";
import { ModalAuthTemplate } from "@/components";
import { useModal } from "@/hooks";
import { FormLogin, SchemaLogin } from "@/utils";
import { FormLoginProps } from "@/types";

export function ModalAuthLogin() {
  const { showRegister } = useModal();

  const handleLogin = useCallback(async (values: unknown) => {
    await login({
      ...(values as FormLoginProps),
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

  return (
    <ModalAuthTemplate
      formFields={FormLogin}
      formHead={renderFormHead}
      formName="Login"
      formSchema={SchemaLogin}
      onSubmit={handleLogin}
    />
  );
}
