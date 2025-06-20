import { Suspense } from "react";
import LoginComponent from "./login";

const LoginPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginComponent />
      </Suspense>
    </div>
  );
};

export default LoginPage;