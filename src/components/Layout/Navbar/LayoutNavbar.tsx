import clsx from "clsx";
import { useMemo } from "react";
import { LayoutNavbarItem, LayoutNavbarItemProps } from "./LayoutNavbarItem";

export function LayoutNavbar() {
	const links = useMemo<Record<string, LayoutNavbarItemProps[]>>(
		() => ({
			"": [
				{
					name: "Home",
					icon: "home",
					active: true,
				},
				{
					name: "Notification",
					icon: "bell",
				},
				{
					name: "Profile",
					icon: "user",
				},
			],
			Events: [
				{
					name: "Post Event",
					icon: "calendar plus",
				},
				{
					name: "Your Events",
					icon: "calendar alternate",
				},
			],
			Following: [
				{
					name: "Followed Events",
					icon: "calendar check",
				},
				{
					name: "Followed Tags",
					icon: "tags",
				},
			],
		}),
		[]
	);

	const renderLogo = useMemo(
		() => (
			<div className="p-4 flex items-center font-bold">
				<div className="w-8 h-8 rounded-md bg-amber-500" />
				<div className="ml-4" style={{ fontSize: "16px" }}>
					CHARTIS
				</div>
			</div>
		),
		[]
	);

	const renderSearch = useMemo(
		() => (
			<div
				className={clsx(
					"LayoutNavbarSearch",
					"mx-8 mt-4",
					"flex items-center",
					"bg-slate-800 hover:bg-slate-900 text-primary-5 border border-primary-5",
					"rounded-md cursor-pointer"
				)}
			>
				Search
			</div>
		),
		[]
	);

	const renderLinks = useMemo(
		() => (
			<>
				{Object.entries(links).map(([category, links], idx) => (
					<div
						className={clsx(
							"mt-4",
							idx > 0 && "border-t border-slate-600"
						)}
						key={`LayoutNavbarCategory_${category}`}
					>
						<div className={idx > 0 ? "p-4" : "hidden"}>
							<span className="text-slate-300 italic font-black uppercase">
								{category}
							</span>
						</div>
						{links.map((link) => (
							<LayoutNavbarItem
								key={`LayoutNavbarItem_${link.name}`}
								{...link}
							/>
						))}
					</div>
				))}
			</>
		),
		[links]
	);

	return (
		<div
			className={clsx(
				"LayoutNavbar",
				"h-screen",
				"bg-slate-900 text-gray-50"
			)}
		>
			{renderLogo}
			{renderSearch}
			{renderLinks}
		</div>
	);
}
