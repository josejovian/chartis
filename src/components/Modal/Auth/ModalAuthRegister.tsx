import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { type UserCredential, updateProfile } from "firebase/auth";
import { auth, createData, register } from "@/firebase";
import { ModalAuthLogin, ModalAuthTemplate } from "@/components";
import { useModal, useToast } from "@/hooks";
import { FormRegister, SchemaRegister } from "@/utils";
import { FormRegisterProps } from "@/types";
import { FIREBASE_COLLECTION_USERS } from "@/consts";

export function ModalAuthRegister() {
  const [loading, setLoading] = useState(false);
  const { setModal, clearModal } = useModal();
  const { addToastPreset } = useToast();
  const router = useRouter();

  const handleShowLoginModal = useCallback(() => {
    setModal(<ModalAuthLogin />);
  }, [setModal]);

  const handleStoreUserData = useCallback(
    async (data: FormRegisterProps, cred: UserCredential) => {
      await createData(
        FIREBASE_COLLECTION_USERS,
        {
          name: data.name,
          email: data.email,
          joinDate: new Date().getTime(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        cred.user.uid
      )
        .then(async () => {
          setLoading(false);
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, {
              displayName: data.name,
            });
          } else throw Error("Auth somehow doesn't have currentUser.");
        })
        .then(() => {
          addToastPreset("auth-login");
          setLoading(false);
          clearModal();
          router.replace(router.asPath);
        })
        .catch(() => {
          addToastPreset("fail-generic");
        });
    },
    [addToastPreset, clearModal, router]
  );

  const handleRegister = useCallback(
    async (values: unknown) => {
      setLoading(true);
      const data = values as FormRegisterProps;
      await register({
        ...data,
        onSuccess: (cred) => handleStoreUserData(data, cred),
        onFail: () => {
          addToastPreset("fail-generic");
        },
      });
    },
    [addToastPreset, handleStoreUserData]
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
    />
  );
}
