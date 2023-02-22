import Image from "next/image";

export interface LayoutNoticeProps {
  title: string;
  desc: string;
}

export function LayoutNotice({ title, desc }: LayoutNoticeProps) {
  return (
    <div
      style={{ width: "75%" }}
      className="flex flex-col items-center justify-center mx-auto"
    >
      <Image
        src="/no-events.png"
        width="290"
        height="180"
        alt="Calendar Image"
      />
      <span className="text-18px italic font-bold text-slate-500">{title}</span>
      <span className="mt-1 text-16px italic text-slate-500">{desc}</span>
    </div>
  );
}
