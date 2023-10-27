"use client";

import { USER_ROLES } from "./constants/USER_ROLES";
import { useAuthentication } from "./hooks/useAuthentication";
import foodBackground from "@/app/assets/food_background.png";

export default function Home() {
  const { handleLoginAs } = useAuthentication();

  return (
    <div
      className="flex flex-col justify-center items-center w-screen"
      style={{
        height: "calc(100vh)",
      }}
    >
      <div
        className="relative bg-center bg-cover rounded-lg"
        style={{
          height: "calc(100%)",
          width: "calc(100% - 30px)",
          backgroundImage: `url(${foodBackground.src})`,
          backgroundPosition: "-81.048px 50px",
        }}
      >
        <div
          className="flex justify-center items-center space-x-8 shadow-[0px_4px_7px_3px_rgba(0,0,0,0.41)] grow px-10 py-10 rounded-[62px]"
          style={{
            width: "500px",
            position: "absolute",
            left: "50%",
            bottom: "60%",
            transform: "translateX(-50%)",
          }}
        >
          {Object.values(USER_ROLES)
            .filter((role) => role !== "anonymous")
            .map((role) => (
              <button
                key={role}
                onClick={() => handleLoginAs(role)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-[38px] w-[200px] h-[62px]"
              >
                {role === "user" ? "USER" : "SERVICE OWNER"}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
