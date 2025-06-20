"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/store';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const router = useRouter();
    const { isLogin, SetIsLogin, SetFullName, SetUserId, SetEmail, SetProjects, SetAiLimit } = useUserStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const verifyToken = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace('/login?error=auth_required');
          return;
        }

        try {
          const res = await fetch(`/api/auth/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const data = await res.json();

          if (data.type === "success") {
            // Update global state with user info
            SetIsLogin(true);
            SetFullName(data.user.name);
            SetUserId(data.user._id);
            SetEmail(data.user.email);
            SetProjects(data.projects || 0);
            SetAiLimit(data.user.aiLimit || 0);
            setIsLoading(false); // Allow component to render
          } else {
            // Token is invalid or expired
            
            localStorage.removeItem("token");
            SetIsLogin(false);
            router.replace('/login?error=auth_required');

          }
        } catch (error) {
          console.error("Token verification failed", error);
          localStorage.removeItem("token");
          SetIsLogin(false);
          router.replace('/login?error=auth_required');

        }
      };

      verifyToken();
    }, [router, SetIsLogin, SetFullName, SetUserId, SetEmail, SetProjects, SetAiLimit]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!isLogin) {
      // This prevents a flash of the protected content before redirect
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;