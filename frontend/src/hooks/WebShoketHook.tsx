import { useEffect, useState } from "react";

export function useWebShoket() {
	const [socket, setsocket] = useState<WebSocket | null>(null);

	useEffect(() => {
		const ws = new WebSocket("ws://localhost:8080");

		console.log("Exectured");

		ws.onopen = () => {
			setsocket(ws);
			console.log("Connected to WebShoket");
		};

		ws.onmessage = (event) => {
			console.log("Received message from WebShoket");
		};

		ws.onclose = () => {
			console.log("Disconnected from WebShoket");
		};

		return () => {
			ws.close();
		};
	}, []);

	return socket;
}
