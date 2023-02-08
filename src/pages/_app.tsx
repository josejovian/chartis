import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { LayoutNavbar } from "@/components";
import { Lato } from "@next/font/google";
import "semantic-ui-css/semantic.min.css";

const lato = Lato({ subsets: ["latin"], weight: ["400", "700", "900"] });

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<style jsx global>{`
				html {
					font-family: ${lato.style.fontFamily};
				}
			`}</style>
			<div className="flex flex-row">
				<LayoutNavbar />
				<Component {...pageProps} />
			</div>
		</>
	);
}
