import { FC, PropsWithChildren, useEffect } from "react";
import { useIsAuthenticated } from "./authHooks";
import { useNavigate } from "react-router-dom";
import CenteredLoader from "@/ui/CenteredLoader";

const ProtectRoute: FC<PropsWithChildren> = ({ children }) => {
  const { isError, isPending } = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) navigate("/login");
  }, [navigate, isError]);

  if (isPending) return <CenteredLoader />;
  return <>{children}</>;
};

export default ProtectRoute;
