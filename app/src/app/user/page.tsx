"use client";

import React from "react";
import { Services } from "../components/Services";

const UserPage = () => {
  return (
    <div className="flex flex-col mx-32 my-10">
      <h1>Services</h1>
      <Services />
    </div>
  );
};

export default UserPage;
