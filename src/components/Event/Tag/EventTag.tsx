import { Label, type SemanticSIZES } from "semantic-ui-react";
import { EventTagType } from "@/types";

export interface EventTagProps extends EventTagType {
  size?: SemanticSIZES;
}

export function EventTag({ name, color, size = "small" }: EventTagProps) {
  return (
    <Label size={size} color={color} className="text-12px font-bold !uppercase">
      {name}
    </Label>
  );
}
