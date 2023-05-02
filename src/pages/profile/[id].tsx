/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import {
  LayoutTemplate,
  UserPicture,
  PageSearchEventCard,
  ModalAuthInput,
} from "@/components";
import { useEvent, useScreen } from "@/hooks";
import { getDateMonthYear } from "@/utils";
import { useRouter } from "next/router";
import { Button, Card } from "semantic-ui-react";
import { readData, updateData } from "@/firebase";
import { UserType, FormCustomFieldProps } from "@/types";
import { Formik, Form } from "formik";
import { FIREBASE_COLLECTION_USERS } from "@/consts";
import {
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const FieldOldPassword: FormCustomFieldProps = {
  id: "oldPassword",
  initial: "",
  name: "Password",
  placeholder: "Enter your current password",
  type: "password",
  iconLabel: "key",
};

const FieldNewPassword: FormCustomFieldProps = {
  id: "newPassword",
  initial: "",
  name: "Password",
  placeholder: "Enter your new password",
  type: "password",
  iconLabel: "key",
};

const FieldConfirmPassword: FormCustomFieldProps = {
  id: "confirmPassword",
  initial: "",
  name: "Password",
  placeholder: "Enter your new password again",
  type: "password",
  iconLabel: "key",
};

const FieldChangeName: FormCustomFieldProps = {
  id: "name",
  initial: "",
  name: "Full Name",
  placeholder: "Enter your name",
  type: "text",
  iconLabel: "user",
};

export default function Profile() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [activeCard, setActiveCard] = useState("First");

  const stateFocusDate = useState(getDateMonthYear(new Date()));
  //const stateSideBar = useState(false);
  const focusDate = stateFocusDate[0];
  const { type } = useScreen();

  const router = useRouter();
  const { id } = router.query;
  const stateUser = useState<UserType>({
    name: "jeff jeffry",
    email: "jeff@email.com",
  });
  const [profile, setProfile] = stateUser;
  const [, setLoading] = useState(true);
  const [, setError] = useState(false);
  //const initialize = useRef(0);
  //const stateIdentification = useIdentification();
  //const { user } = stateIdentification[0];

  const handleGetProfile = useCallback(async () => {
    if (!id) return;

    await readData("users", id as string)
      .then((result) => {
        setLoading(false);
        if (result) {
          setError(false);
          setProfile(result as UserType);
        } else {
          throw Error("Invalid user data.");
        }
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, [id, setProfile]);

  const {
    filteredEvents,
    getEvents,
    handleUpdateEvent,
    stateFilters,
    stateQuery,
    stateSortBy,
    stateSortDescending,
  } = useEvent({});

  //const auth = getAuth();

  const { getEventsMonthly } = useEvent({});

  const handlePopulateCalendar = useCallback(() => {
    getEventsMonthly(focusDate.month, focusDate.year);
  }, [focusDate.month, focusDate.year, getEventsMonthly]);

  useEffect(() => {
    handlePopulateCalendar();
  }, [handlePopulateCalendar]);

  useEffect(() => {
    getEvents();
  }, [getEvents]);

  useEffect(() => {
    handleGetProfile();
  }, [handleGetProfile]);

  function changePassword(currentPass: string, newPass: string): void {
    if (!user) return;
    if (!user.email) return;

    const credential = firebase.auth.EmailAuthProvider.credential(
      user.email,
      currentPass
    );

    reauthenticateWithCredential(user, credential)
      .then(() => {
        updatePassword(user, newPass)
          .then(() => {
            // Password successfully updated
          })
          .catch((error: any) => {
            // There was an error updating the user's password
            /* eslint-disable no-console */
            console.error(error);
          });
      })
      .catch((error: any) => {
        // There was an error reauthenticating the user
        /* eslint-disable no-console */
        console.error(error);
      });
  }

  return (
    <LayoutTemplate
      title="Profile"
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
    >
      <div className="md:container md:mx-auto px-72 py-20">
        {
          {
            First: activeCard === "First",
            Second: activeCard === "Second",
            Third: activeCard === "Third",
          }[activeCard]
        }
        {activeCard === "First" && (
          <Card className="flex !flex-row" fluid>
            <div className="py-12 px-12 h-full justify-between">
              <UserPicture fullName={profile?.name ?? ""} size="big" />
            </div>
            <div className="container mx-auto py-12 px-3">
              <div className="px-3">
                <h1>{profile?.name}</h1>
              </div>
              <div className="py-2 px-3.5">
                <h6>{profile.email}</h6>
              </div>
              <div className="py-2 px-3">
                <Button onClick={() => setActiveCard("Second")}>
                  Edit Profile
                </Button>
                <Button onClick={() => setActiveCard("Third")}>
                  Change Password
                </Button>
              </div>
            </div>
          </Card>
        )}
        {activeCard === "Second" && (
          <Card className="flex !flex-row" fluid>
            <div className="py-12 px-12 h-full justify-between">
              <UserPicture fullName={profile?.name ?? ""} size="big" />
            </div>
            <div className="container mx-auto py-12 px-3">
              {/* Form For Edit */}
              {/* <div className="px-3">
                <h1>{profile?.name}</h1>
              </div>
              <div className="py-2 px-3.5">
                <h6>{profile.email}</h6>
              </div> */}
              <Formik
                initialValues={{ name: profile.name }}
                onSubmit={(values) => {
                  updateData(FIREBASE_COLLECTION_USERS, id as string, {
                    name: values.name,
                  });
                }}
                validate={(values) => {
                  const errors: any = {};
                  if (values.name === profile.name) {
                    errors.name =
                      "Name should be different from previous name!";
                  }
                  if (values.name === "") {
                    errors.name = "Name cannot be empty!";
                  }
                  return errors;
                }}
                validateOnBlur
                validateOnChange
              >
                {({ errors }) => (
                  <Form>
                    <ModalAuthInput props={{ ...FieldChangeName }} />
                    <div className="py-2 px-3">
                      <Button onClick={() => setActiveCard("First")}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          Object.keys(errors).length > 0 || errors === undefined
                        }
                        //onClick={window.location.reload}
                      >
                        Save
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </Card>
        )}
        {activeCard === "Third" && (
          <Card className="flex !flex-row" fluid>
            <div className="py-12 px-12 h-full justify-between">
              <UserPicture fullName={profile?.name ?? ""} size="big" />
            </div>
            <div className="container mx-auto py-12 px-3">
              {/* Form for Change Password */}
              {/* <div className="px-3">
                <h1>{profile?.name}</h1>
              </div>
              <div className="py-2 px-3.5">
                <h6>{profile.email}</h6>
              </div> */}
              <Formik
                initialValues={{
                  oldPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                }}
                onSubmit={(values) => {
                  // updateData(FIREBASE_COLLECTION_USERS, id as string, {
                  //   name: values.name,
                  // });
                  // handleValidatePassword(user)
                  changePassword(values.oldPassword, values.newPassword);
                }}
                validate={(values) => {
                  const errors: any = {};
                  if (values.newPassword !== values.confirmPassword) {
                    errors.name =
                      "New password should be the same as confirm password!";
                  }
                  if (values.newPassword === values.oldPassword) {
                    errors.name =
                      "New password cannot be the same as old password!";
                  }
                  if (values.confirmPassword === "") {
                    errors.name = "Fill in confirm password!";
                  }
                  return errors;
                }}
                validateOnBlur
                validateOnChange
              >
                {({ errors }) => (
                  <Form>
                    <ModalAuthInput props={FieldOldPassword} />
                    <ModalAuthInput props={FieldNewPassword} />
                    <ModalAuthInput props={FieldConfirmPassword} />
                    <div className="py-2 px-3">
                      <Button onClick={() => setActiveCard("First")}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          Object.keys(errors).length > 0 || errors === undefined
                        }
                        //onClick={window.location.reload}
                      >
                        Save
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </Card>
        )}
        <PageSearchEventCard
          className="PageSearchEventCard !bg-sky-50 p-4 !pb-0 !h-full !mx-0"
          stateQuery={stateQuery}
          stateFilters={stateFilters}
          stateSortBy={stateSortBy}
          stateSortDescending={stateSortDescending}
          events={filteredEvents}
          type={type}
          updateEvent={handleUpdateEvent}
        />
      </div>
    </LayoutTemplate>
  );
}
