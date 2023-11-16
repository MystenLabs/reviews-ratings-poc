"use client";

import React from "react";
import { useGetOwnedModerator } from "@/app/hooks/useGetOwnedModerator";
import { Button, Table } from "flowbite-react";
import { useRouter } from "next/navigation";
import { HiOutlineArrowRight, HiOutlinePencilAlt } from "react-icons/hi";

const ModeratorPage = () => {
  const { dataModerators } = useGetOwnedModerator();
  const router = useRouter();

  const onDisplayReviews = (id: string, nft: string) => {
    router.push(`/user/moderator/remove/${id}/${nft}`);
  };

  return (
    <div className="flex flex-col mx-32 my-10">
      <h1>Moderator</h1>
      <p className="my-4 text-lg text-gray-500">
        You are commissioned to serve as a moderator for these services
      </p>
      <div>
        {dataModerators.length > 0 && (
          <Table hoverable className="items-center text-center">
            <Table.Head>
              <Table.HeadCell>Service ID</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {dataModerators.map((item) => (
                <Table.Row
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  key={item.id.id}
                >
                  <Table.Cell>
                    <div className="overflow-hidden truncate">
                      {item.service_id}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {
                      <Button
                        color="gray"
                        pill
                        onClick={() =>
                          onDisplayReviews(item.service_id, item.id.id)
                        }
                      >
                        Reviews
                        <HiOutlineArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    }
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
