"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthPage from "@/components/AuthPage";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LoginPage() {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && user) {
			router.push("/dashboard");
		}
	}, [user, loading, router]);

	if (loading) {
		return <LoadingSpinner />;
	}

	if (user) {
		return <LoadingSpinner />; // Will redirect to dashboard
	}

	return <AuthPage />;
}
