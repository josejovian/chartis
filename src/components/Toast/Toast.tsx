import { useContext, useEffect, useMemo } from "react";
import { Icon, Message, SemanticICONS } from "semantic-ui-react";
import clsx from "clsx";
import { ToastContext } from "@/contexts";
import { ToastLiveType, ToastVariantType } from "@/types";

export function ToastWrapper() {
  const { toasts, setToasts } = useContext(ToastContext);

  const renderToasts = useMemo(
    () =>
      toasts.map(({ id, title, description, variant, time, preExpire }) => (
        <Message
          key={id}
          id={id}
          className={clsx(
            TOAST_BASE_STYLE,
            preExpire ? "toast-out" : time > 0 && "toast"
          )}
          positive={variant === "success"}
          negative={variant === "danger"}
        >
          <Icon size="large" name={TOAST_MESSAGE_ICON[variant]} />
          <div className="">
            <h3 className={clsx("leading-6 text-18px")}>{title}</h3>
            {description !== "" && (
              <p className="!mt-2 text-18px">{description}</p>
            )}
          </div>
        </Message>
      )),
    [toasts]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((prev) =>
        prev
          .map((toast) => {
            const now = new Date();
            const preExpireTime = new Date(toast.createdAt + 1000 * toast.time);
            const expireTime = new Date(
              toast.createdAt + 1000 * (toast.time + 1)
            );
            const preExpire = now >= preExpireTime && now < expireTime;
            const expire = now >= expireTime;

            return {
              ...toast,
              preExpire,
              expire,
            } as ToastLiveType;
          })
          .filter((toast) => !toast.expire)
      );
      return true;
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [setToasts]);

  return (
    <section
      className={clsx(
        "fixed right-16 bottom-16 w-96",
        "flex flex-col-reverse gap-8 justify-center z-50"
      )}
    >
      {renderToasts}
    </section>
  );
}

const TOAST_BASE_STYLE = clsx(
  "flex flex-row",
  "relative w-full py-4 px-4 gap-2 !my-0",
  "shadow-lg border rounded-md transition-all duration-600"
);

const TOAST_MESSAGE_ICON: Record<ToastVariantType, SemanticICONS> = {
  danger: "remove circle",
  success: "check circle",
};
