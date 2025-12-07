import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/useAuth";

function SignUp() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const { signUp } = useAuth();

	const validateName = (nameValue) => {
		if (!nameValue || nameValue.trim().length < 2) {
			return "Name must be at least 2 characters long";
		}
		if (nameValue.trim().length > 50) {
			return "Name must be no more than 50 characters";
		}
		if (!/^[a-zA-Z\s'-]+$/.test(nameValue.trim())) {
			return "Name can only contain letters, spaces, hyphens, and apostrophes";
		}
		return "";
	};

	const validatePassword = (passwordValue) => {
		if (!passwordValue || passwordValue.length < 8) {
			return "Password must be at least 8 characters long";
		}
		if (passwordValue.length > 128) {
			return "Password must be no more than 128 characters";
		}
		if (!/(?=.*[A-Z])/.test(passwordValue)) {
			return "Password must contain at least one uppercase letter";
		}
		if (!/(?=.*[a-z])/.test(passwordValue)) {
			return "Password must contain at least one lowercase letter";
		}
		if (!/(?=.*[0-9])/.test(passwordValue)) {
			return "Password must contain at least one number";
		}
		if (!/(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>/?])/.test(passwordValue)) {
			return "Password must contain at least one special character";
		}
		if (
			!/^[a-zA-Z0-9!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>/?]+$/.test(passwordValue)
		) {
			return "Password contains invalid characters";
		}
		return "";
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (!name || !email || !password) {
			setError("Please fill in all fields");
			return;
		}

		const nameError = validateName(name);
		if (nameError) {
			setError(nameError);
			return;
		}

		const passwordError = validatePassword(password);
		if (passwordError) {
			setError(passwordError);
			return;
		}

		try {
			await signUp(name.trim(), email.trim().toLowerCase(), password);
			navigate("/");
		} catch (error) {
			const msg = error.message || "";
			setError(msg || "Sign up failed. Please try again.");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 space-y-5 sm:space-y-6">
					<div className="text-center">
						<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
							Create your account
						</h2>
						<p className="text-xs sm:text-sm text-gray-600">
							Or{" "}
							<Link
								to="/login"
								className="font-semibold text-[#281d80] hover:text-[#ed4d4e] transition-colors cursor-pointer"
							>
								sign in to your existing account
							</Link>
						</p>
					</div>

					<form className="space-y-5" onSubmit={handleSubmit}>
						{error && (
							<div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md text-sm">
								{error}
							</div>
						)}

						<div className="space-y-5">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-semibold text-gray-700 mb-2"
								>
									Name
								</label>
								<input
									id="name"
									name="name"
									type="text"
									autoComplete="name"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									maxLength={50}
									className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#281d80] focus:ring-2 focus:ring-[#281d80]/20 transition-all"
									placeholder="Enter your name"
								/>
								{name.length > 0 && (
									<div className="mt-1 flex items-center justify-between">
										<span className="text-xs text-gray-500">
											{name.trim().length < 2
												? "Name must be at least 2 characters"
												: !/^[a-zA-Z\s'-]+$/.test(name.trim())
													? "Only letters, spaces, hyphens, and apostrophes allowed"
													: ""}
										</span>
										<span className="text-xs text-gray-400">
											{name.length}/50
										</span>
									</div>
								)}
							</div>

							<div>
								<label
									htmlFor="email"
									className="block text-sm font-semibold text-gray-700 mb-2"
								>
									Email address
								</label>
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#281d80] focus:ring-2 focus:ring-[#281d80]/20 transition-all"
									placeholder="Enter your email"
								/>
							</div>

							<div>
								<label
									htmlFor="password"
									className="block text-sm font-semibold text-gray-700 mb-2"
								>
									Password
								</label>
								<div className="relative">
									<input
										id="password"
										name="password"
										type={showPassword ? "text" : "password"}
										autoComplete="new-password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										maxLength={128}
										className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#281d80] focus:ring-2 focus:ring-[#281d80]/20 transition-all"
										placeholder="Enter your password (min. 8 characters)"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors cursor-pointer"
										aria-label={
											showPassword ? "Hide password" : "Show password"
										}
									>
										{showPassword ? (
											<HiEye className="w-5 h-5" />
										) : (
											<HiEyeOff className="w-5 h-5" />
										)}
									</button>
								</div>
								{password.length > 0 && (
									<div className="mt-2 space-y-1">
										<p className="text-xs text-gray-600 font-medium">
											Password requirements:
										</p>
										<ul className="text-xs text-gray-500 space-y-0.5 ml-4 list-disc">
											<li
												className={
													password.length >= 8 && password.length <= 128
														? "text-green-600"
														: ""
												}
											>
												At least 8 characters (max 128)
											</li>
											<li
												className={
													/(?=.*[A-Z])/.test(password) ? "text-green-600" : ""
												}
											>
												One uppercase letter
											</li>
											<li
												className={
													/(?=.*[a-z])/.test(password) ? "text-green-600" : ""
												}
											>
												One lowercase letter
											</li>
											<li
												className={
													/(?=.*[0-9])/.test(password) ? "text-green-600" : ""
												}
											>
												One number
											</li>
											<li
												className={
													/(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>/?])/.test(
														password,
													)
														? "text-green-600"
														: ""
												}
											>
												One special character
											</li>
										</ul>
									</div>
								)}
							</div>
						</div>

						<button
							type="submit"
							className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-[#ed4d4e] hover:bg-[#d43d3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ed4d4e] transition-all shadow-md hover:shadow-lg cursor-pointer"
						>
							Sign up
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default SignUp;
