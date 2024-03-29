/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getErrorMessage, login } from "@/firebase";
import { ModalAuthRegister, ModalAuthTemplate } from "@/components";
import { useModal, useToast } from "@/hooks";
import { FormLogin, SchemaLogin } from "@/utils";
import { FormLoginProps } from "@/types";

export function ModalAuthLogin() {
  const [loading, setLoading] = useState(false);
  const { setModal, clearModal } = useModal();
  const { addToast, addToastPreset } = useToast();
  const router = useRouter();

  const handleShowRegisterModal = useCallback(() => {
    setModal(<ModalAuthRegister />);
  }, [setModal]);

  const handleLogin = useCallback(
    async (values: unknown) => {
      setLoading(true);
      login(values as FormLoginProps)
        .then((userCredential) => {
          addToastPreset("auth-login");
          setLoading(false);
          clearModal();
          router.replace(router.asPath);
        })
        .catch((e) => {
          const errorMessage = getErrorMessage((e as any).code);
          addToast({
            title: "Login Failed",
            description: errorMessage.message,
            variant: "danger",
          });
          setLoading(false);
        });
    },
    [addToast, addToastPreset, clearModal, router]
  );

  const renderFormHead = useMemo(
    () => (
      <div className="flex flex-col items-center bg-white mb-8">
        <h2 className="text-20px">Login</h2>
        <span className="mt-2">
          No account?{" "}
          <u className="cursor-pointer" onClick={handleShowRegisterModal}>
            Register
          </u>{" "}
          instead.
        </span>
      </div>
    ),
    [handleShowRegisterModal]
  );

  return (
    <ModalAuthTemplate
      formFields={FormLogin}
      formHead={renderFormHead}
      formName="Login"
      formSchema={SchemaLogin}
      onSubmit={handleLogin}
      loading={loading}
    />
  );
}
