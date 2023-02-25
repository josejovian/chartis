import clsx from "clsx";
import { Icon, Input, InputProps, SemanticICONS } from "semantic-ui-react";

export interface ModalAuthInputProps extends InputProps {
  iconLabel?: SemanticICONS;
  className?: string;
}

export function ModalAuthInput({
  className,
  iconLabel,
  ...rest
}: ModalAuthInputProps) {
  return (
    <Input
      className={clsx("w-full mb-8", className)}
      label={{
        content: <Icon className="text-secondary-4" fitted name={iconLabel} />,
      }}
      {...rest}
    />
  );
}
