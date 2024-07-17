import { useNavigate } from "react-router-dom";
import chessBoard from "../assets/ChessBoard.jpeg";

export function LandingPage() {
	const navigate = useNavigate();

	return (
		<div className="landing-page bg-[#35155D] w-screen h-screen flex items-center justify-center">
			<div className="flex items-center justify-around">
				<div className="image-container basis-[50%] max-w-[50vw]">
					<img src={chessBoard} alt="Chess Board" />
				</div>
				<div className="buttonContainer basis-[50%]  flex flex-col items-center justify-center">
					<button
						type="button"
						className="bg-[#4477CE] py-3 px-10 text-xl rounded-2xl font-semibold text-white"
						onClick={() => navigate("/game")}
					>
						Play as Guest
					</button>
				</div>
			</div>
		</div>
	);
}
