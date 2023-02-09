import { useCallback, useEffect, useRef, useState } from "react";
import type { AppProps } from "next/app";

import { LayoutNavbar } from "@/components";
import { ScreenContext, SCREEN_CONTEXT_DEFAULT } from "@/contexts";
import { ScreenSizeType } from "@/types";
import { MOBILE_SCREEN_THRESHOLD } from "@/consts";

import "@/styles/globals.css";
import "semantic-ui-css/semantic.min.css";
import { Lato } from "@next/font/google";

const lato = Lato({ subsets: ["latin"], weight: ["400", "700", "900"] });

export default function App({ Component, pageProps }: AppProps) {
	const [screen, setScreen] = useState<ScreenSizeType>(
		SCREEN_CONTEXT_DEFAULT
	);
	const initialize = useRef(false);

	const handleInitialize = useCallback(() => {
		if (initialize.current) return;

		window.addEventListener("resize", () => {
			const width = window.innerWidth;
			const type = width > MOBILE_SCREEN_THRESHOLD ? "desktop" : "mobile";

			setScreen({
				width,
				type,
			});
		});
		initialize.current = true;
	}, []);

	useEffect(() => {
		handleInitialize();
	}, [handleInitialize]);

	return (
		<>
			<style jsx global>{`
				html {
					font-family: ${lato.style.fontFamily};
				}
			`}</style>
			<ScreenContext.Provider value={screen}>
				<div id="App" className="flex flex-row">
					<LayoutNavbar />
					<Component {...pageProps} />
				</div>
			</ScreenContext.Provider>
		</>
	);
}
