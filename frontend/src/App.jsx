import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import SignUp from "./pages/signup/SignUp";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./context/AuthContext";
import IncomingCallModal from "./components/call/IncomingCallModal";
import ActiveCallModal from "./components/call/ActiveCallModal";

function App() {
	const { authUser } = useAuthContext();
	return (
		<div className='min-h-screen w-full flex items-center justify-center p-2 sm:p-4 md:p-6 relative selection:bg-indigo-500 selection:text-white font-sans'>
			<Routes>
				<Route path='/' element={authUser ? <Home /> : <Navigate to={"/login"} />} />
				<Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
				<Route path='/signup' element={authUser ? <Navigate to='/' /> : <SignUp />} />
				<Route path='/forgot-password' element={authUser ? <Navigate to='/' /> : <ForgotPassword />} />
			</Routes>

			{/* Global WebRTC Audio & Video Calling Overlays */}
			{authUser && (
				<>
					<IncomingCallModal />
					<ActiveCallModal />
				</>
			)}

			<Toaster
				position='top-center'
				toastOptions={{
					className: "glass-panel dark:bg-slate-900/90 dark:text-slate-100 dark:border-slate-800 bg-white/90 text-slate-800 border border-slate-200 shadow-xl rounded-xl text-sm font-medium",
					duration: 3500,
				}}
			/>
		</div>
	);
}

export default App;
