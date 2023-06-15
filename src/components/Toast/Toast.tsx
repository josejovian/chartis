import { useContext, useEffect, useMemo } from "react";
import { Icon, Message, type SemanticICONS } from "semantic-ui-react";
import clsx from "clsx";
import { ToastContext } from "@/contexts";
import { ToastLiveType, ToastVariantType } from "@/types";
import { useScreen } from "@/hooks";

export function ToastWrapper() {
  const { toasts, setToasts } = useContext(ToastContext);
  const { type } = useScreen();

  const renderToasts = useMemo(
    () =>
      toasts.map(({ id, title, description, variant, time, preExpire }) => (
        <Message
          key={id}
          id={id}
          className={clsx(
            TOAST_BASE_STYLE,
            type !== "mobile" ? "!ml-auto !mr-16" : "!mx-auto",
            preExpire ? "toast-out" : time > 0 && "toast"
          )}
          positive={variant === "success"}
          negative={variant === "danger"}
        >
          <Icon size="large" name={TOAST_MESSAGE_ICON[variant]} />
          <div className="">
            <h3
              className={clsx(
                type !== "mobile"
                  ? "leading-6 text-18px"
                  : "leading-2 text-14px"
              )}
            >
              {title}
            </h3>
            {description !== "" && (
              <p
                className={clsx(
                  type !== "mobile" ? "!mt-2 text-18px" : "!mt-2 text-12px"
                )}
                style={{
                  color: variant === "success" ? "#2C662D" : "#9F3A38",
                }}
              >
                {description}
              </p>
            )}
          </div>
          <button
            className="absolute right-4 hover:opacity-50 active:opacity-25 focus:opacity-25"
            onClick={() => {
              setToasts((prev) => prev.filter((temp) => temp.id !== id));
            }}
          >
            <Icon name="close" />
          </button>
        </Message>
      )),
    [setToasts, toasts, type]
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
        "fixed right-0",
        type !== "mobile" ? "bottom-16" : "bottom-0 !w-full",
        "flex flex-col-reverse gap-8 justify-center z-50"
      )}
    >
      {renderToasts}
    </section>
  );
}

const TOAST_BASE_STYLE = clsx(
  "flex flex-row",
  "relative max-w-[320px] w-full py-4 px-4 gap-2 !my-0",
  "shadow-lg border rounded-md transition-all duration-600"
);

const TOAST_MESSAGE_ICON: Record<ToastVariantType, SemanticICONS> = {
  danger: "exclamation circle",
  success: "check circle",
};
