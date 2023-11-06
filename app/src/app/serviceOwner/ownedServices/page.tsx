"use client";

import React, { ChangeEvent, useState, useCallback } from "react";
import { useGetOwnedServices } from "@/app/hooks/useGetOwnedServices";
import { useServicePoEGeneration } from "@/app/hooks/useServicePoeGeneration";
import { Service as ServiceType } from "@/app/types/Service";

const OwnedServicesPage = () => {
  const { dataServices } = useGetOwnedServices();
  const { handleServicePoEGeneration } = useServicePoEGeneration();

  const onGeneratePOE = async (service: ServiceType) => {
    await handleServicePoEGeneration("", service.id, "");
  };

  return (
    <div className="flex flex-col mx-32 my-10">
      <h1>Services</h1>
      <div className="container">
        {dataServices.length > 0 && (
          <table className="table-style">
            <thead>
              <tr>
                <th>Service ID</th>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dataServices.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>
                    {
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => onGeneratePOE(item)}
                      >
                        Generate POE
                      </button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OwnedServicesPage;
