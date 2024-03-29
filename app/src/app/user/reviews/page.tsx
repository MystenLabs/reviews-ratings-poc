"use client";

import React from "react";
import { Services } from "@/app/components/Services";

const UserReviewersPage = () => {
  return (
    <div className="flex flex-col mx-32 my-10">
      <h1>Reviews</h1>
      <Services isDetailed={true} />
    </div>
  );
};

export default UserReviewersPage;
