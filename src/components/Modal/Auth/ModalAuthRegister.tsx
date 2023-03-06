import { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { updateProfile } from "firebase/auth";
import { auth, register, setDataToPath } from "@/firebase";
import { ModalAuthTemplate } from "@/components";
import { useModal } from "@/hooks";
import { FormRegister, SchemaRegister } from "@/utils";
import { FormRegisterProps } from "@/types";

export function ModalAuthRegister() {
  const { clearModal, showLogin } = useModal();
  const router = useRouter();

  const handleRegister = useCallback(
    async (values: unknown) => {
      const data = values as FormRegisterProps;
      await register({
        ...data,
        onSuccess: async (cred) => {
          await setDataToPath(`/user/${cred.user.uid}`, {
            name: data.name,
          })
            .then(async () => {
              if (auth.currentUser)
                await updateProfile(auth.currentUser, {
                  displayName: data.name,
                });
              else throw Error("Auth somehow doesn't have currentUser.");
            })
            .then(() => {
              clearModal();
              router.replace(router.asPath);
            });
        },
      });
    },
    [clearModal, router]
  );

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
