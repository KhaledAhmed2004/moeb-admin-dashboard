"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
// import { setAccessToken, setUser } from "@/redux/features/auth";
import Cookies from "js-cookie";
// import { useDispatch } from "react-redux";
import Image from "next/image";
import logo from "@/assets/logo.png";

export function DriverNavbar() {
  // const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      Cookies.remove("accessToken");
      // dispatch(setAccessToken(null));
      // dispatch(
      //   setUser({
      //     user: null,
      //   }),
      // );
      window.location.href = "/auth/login";
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b-4 border-black z-50 flex items-center justify-between px-8 md:px-12">
      <div className="flex items-center gap-3">
         <Image src={logo} alt="Ekkali Logo" width={120} height={80} className="object-contain" />
      </div>
      
      <Button 
        variant="ghost" 
        onClick={handleLogout}
        className="text-black hover:bg-black hover:text-white rounded-none border-2 border-transparent hover:border-black font-black uppercase tracking-widest text-xs flex gap-2 transition-all duration-200"
      >
        <LogOut className="w-5 h-5" />
        <span className="hidden sm:inline">Log out</span>
      </Button>
    </nav>
  );
}
