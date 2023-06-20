import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getErrorMessage, register } from "@/firebase";
import { ModalAuthLogin, ModalAuthTemplate } from "@/components";
import { useModal, useToast } from "@/hooks";
import { FormRegister, SchemaRegister } from "@/utils";
import { FormRegisterProps } from "@/types";

export function ModalAuthRegister() {
  const [loading, setLoading] = useState(false);
  const { setModal, clearModal } = useModal();
  const { addToast } = useToast();
  const router = useRouter();

  const handleShowLoginModal = useCallback(() => {
    setModal(<ModalAuthLogin />);
  }, [setModal]);

  const handleRegister = useCallback(
    async (values: unknown) => {
      setLoading(true);
      const data = values as FormRegisterProps;
      register(data)
        .then(() => {
          addToast({
            title: "Registration Success",
            description: "Welcome",
            variant: "success",
          });
          clearModal();
          router.replace(router.asPath);
        })
        .catch((e) => {
          const errorMessage = getErrorMessage(e.code);
          addToast({
            title: "Registration Failed",
            description: errorMessage.message,
            variant: "danger",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [addToast, clearModal, router]
  );

  const renderFormHead = useMemo(
    () => (
      <div className="flex flex-col items-center bg-white mb-8">
        <h2 className="text-20px">Register</h2>
        <span className="mt-2">
          Already have an account?{" "}
          <u className="cursor-pointer" onClick={handleShowLoginModal}>
            Login
          </u>{" "}
          instead.
        </span>
      </div>
    ),
    [handleShowLoginModal]
  );

  return (
    <ModalAuthTemplate
      formFields={FormRegister}
      formHead={renderFormHead}
      formName="Register"
      formSchema={SchemaRegister}
      onSubmit={handleRegister}
      loading={loading}
      validate={(values) => {
        const casted = values as FormRegisterProps;
        const errors: Record<string, string> = {};
        if (casted.password !== casted.confirmPassword) {
          errors.confirmPassword = "Password doesn't match.";
        }
        if (casted.name === "") {
          errors.name = "Name is required.";
        }
        return errors;
      }}
    />
  );
}
