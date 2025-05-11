// import { ReactNode, useEffect, useState } from "react";

// interface RequireAuthProps {
//   children: ReactNode;
// }

// export function RequireAuth({ children }: RequireAuthProps) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

//   useEffect(() => {
//     // Check if the user is authenticated
//     const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

//     if (!isAuthenticated) {
//       // Redirect to login page if not authenticated
//       navigate("/login", { state: { from: location.pathname } });
//     } else {
//       setIsAuthorized(true);
//     }
//   }, [navigate, location.pathname]);

//   // Show nothing while checking authentication
//   if (isAuthorized === null) {
//     return null;
//   }

//   // Render children (protected routes) once authorized
//   return <>{children}</>;
// }
