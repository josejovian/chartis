import { Input, InputProps } from "semantic-ui-react";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PageViewEventCardDetailEditorProps extends InputProps {}

export function PageViewEventCardDetailEditor(
  props: PageViewEventCardDetailEditorProps
) {
  return <Input className="w-full !border-0" transparent {...props} />;
}
