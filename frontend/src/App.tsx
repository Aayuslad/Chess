import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { Game } from "./pages/Game";

function App() {
	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<LandingPage />} />
					<Route path="/game" element={<Game />} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
