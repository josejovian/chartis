import { useContext, useEffect, useMemo } from "react";
import { Icon } from "semantic-ui-react";
import clsx from "clsx";
import { ToastContext } from "@/contexts";
import { ToastLiveType, ToastVariantType } from "@/types";

export function ToastWrapper() {
  const { toasts, setToasts } = useContext(ToastContext);

  const renderToasts = useMemo(
    () =>
      toasts.map(({ id, title, description, variant, time, preExpire }) => (
        <article
          key={id}
          id={id}
          className={clsx(
            TOAST_BASE_STYLE,
            TOAST_WRAPPER_VARIANT_STYLE[variant],
            preExpire ? "toast-out" : time > 0 && "toast"
          )}
        >
          <Icon
            size="big"
            className={clsx("align-self-center place-self-center")}
            name={variant === "danger" ? "remove circle" : "check circle"}
          />
          <div className="">
            <h3 className={clsx("leading-6 text-18px")}>{title}</h3>
            <p className="text-18px">{description}</p>
          </div>
        </article>
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
  "relative w-full py-4 px-8 gap-2",
  "shadow-lg border rounded-md transition-all duration-600"
);

const TOAST_WRAPPER_VARIANT_STYLE: Record<ToastVariantType, string> = {
  danger: "bg-red-100 border-red-600 text-red-600",
  success: "bg-green-100 border-green-600 text-green-600",
};
