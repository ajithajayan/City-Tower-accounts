import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { logout as logoutAPI } from "@/services/api"
import { logout } from "@/features/slices/authSlice";

const TokenExpirationModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isTokenExpired = useSelector((state: any) => state.auth.isTokenExpired);

  const handleLogout = async () => {
    try {
      await logoutAPI();
      dispatch(logout());
      navigate("/login-passcode");
    } catch (error) {
      console.error(`Failed to log out: ${error}`);
    }
  };

  return (
    <Dialog open={isTokenExpired} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
          <DialogDescription>
            Your session has expired. Please log in again to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleLogout}>Log Out</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TokenExpirationModal;
