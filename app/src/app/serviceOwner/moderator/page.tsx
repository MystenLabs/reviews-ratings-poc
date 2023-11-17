"use client";

import React from "react";
import { useGetOwnedServices } from "@/app/hooks/useGetOwnedServices";
import { Button, Table } from "flowbite-react";
import {HiOutlineArrowRight} from "react-icons/hi";
import {Service as ServiceType} from "@/app/types/Service";
import {useRouter} from "next/navigation";

const ModeratorPage = () => {
  const { dataServices } = useGetOwnedServices();
    const router = useRouter();

    const onDisplayModerator = (service: ServiceType) => {
        router.push(`/serviceOwner/moderator/edit/${service.id}/${service.name}`);
    };

    return (
    <div className="flex flex-col mx-32 my-10">
      <h1>Moderator</h1>
      <p className="my-4 text-lg text-gray-500">
        Manage moderators for a service. Moderators may monitor all the reviews and
        remove them if they contain inappropriate contents.
      </p>

      <div className="container">
        {dataServices.length > 0 && (
          <Table hoverable className="items-center text-center">
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Service ID</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {dataServices.map((item) => (
                <Table.Row
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  key={item.id}
                >
                  <Table.Cell>{item.name}</Table.Cell>
                  <Table.Cell>
                    <div className="overflow-hidden truncate w-48">
                      {item.id}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                      <Button
                          color="gray"
                          pill
                          onClick={() => onDisplayModerator(item)}
                      >
                          View
                          <HiOutlineArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}


      </div>
    </div>
  );
};

export default ModeratorPage;
