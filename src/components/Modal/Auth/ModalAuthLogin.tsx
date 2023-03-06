import { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { login } from "@/firebase";
import { ModalAuthTemplate } from "@/components";
import { useModal } from "@/hooks";
import { FormLogin, SchemaLogin } from "@/utils";
import { FormLoginProps } from "@/types";

export function ModalAuthLogin() {
  const { clearModal, showRegister } = useModal();
  const router = useRouter();

  const handleLogin = useCallback(
    async (values: unknown) => {
      await login({
        ...(values as FormLoginProps),
        onSuccess: () => {
          clearModal();
          router.replace(router.asPath);
        },
      });
    },
    [clearModal, router]
  );

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
