import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-background">
      {children}
    </div>
  );
};

export default AuthLayout;
