import React, { useEffect, useState } from "react";
import { useSui } from "../hooks/useSui";
import { SuiMoveObject } from "@mysten/sui.js";
import { useRouter } from "next/navigation";
import { Service as ServiceType } from "../types/Service";
import { useGetServices } from "../hooks/useGetServices";
import { Button, Table } from "flowbite-react";
import { HiOutlineArrowRight } from "react-icons/hi";
import { RatingStar } from "@/app/components/review/RatingStar";

interface Props {
  isDetailed?: boolean | false;
}

export const Services = ({ isDetailed }: Props) => {
  const { suiClient } = useSui();
  const router = useRouter();
  const { serviceList, isLoading, currentAccount } = useGetServices(
    process.env.NEXT_PUBLIC_DASHBOARD_ID as string,
  );

  const [services, setServices] = useState([] as ServiceType[]);

  const onDisplayService = (service: ServiceType) => {
    router.push(`/service/${service.id}`);
  };

  const onDisplayDetailedService = (service: ServiceType) => {
    router.push(`/serviceDetailed/${service.id}`);
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }
    console.log(`serviceList: ${JSON.stringify(serviceList)}`);

    const servicesPromises = serviceList.map(async (serviceId: string) => {
      const obj = await suiClient.getObject({
        id: serviceId,
        options: { showContent: true },
      });
      const serviceName = (obj.data?.content as SuiMoveObject).fields.name;
      let stars = 0;
      const len = (obj.data?.content as SuiMoveObject).fields.reviews.fields
        .size;
      if (len > 0) {
        stars = (obj.data?.content as SuiMoveObject).fields.overall_rate / len;
      }
      console.log(`obj: ${JSON.stringify(obj.data)}`);
      return { id: serviceId, name: serviceName, stars };
    });

    Promise.all(servicesPromises).then((data) => setServices(data));
  }, [currentAccount, isLoading, serviceList]);

  // console.log("before=" + JSON.stringify(services));
  services.sort((a, b) => (a.stars > b.stars ? -1 : 1));
  // console.log("after=" + JSON.stringify(services));

  return (
    <div className="container">
      {services.length > 0 && (
        <Table hoverable className="items-center text-center">
          <Table.Head>
            <Table.HeadCell>Rating</Table.HeadCell>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Service ID</Table.HeadCell>
            <Table.HeadCell>Action</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {services.map((item) => (
              <Table.Row
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
                key={item.id}
              >
                <Table.Cell>
                  <div className="w-52">
                    <RatingStar stars={item.stars}></RatingStar>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="w-32">{item.name}</div>
                </Table.Cell>
                <Table.Cell>
                  <div className="overflow-hidden truncate w-24">{item.id}</div>
                </Table.Cell>
                <Table.Cell>
                  {
                    <Button
                      color="gray"
                      pill
                      onClick={() =>
                        isDetailed
                          ? onDisplayDetailedService(item)
                          : onDisplayService(item)
                      }
                    >
                      Info
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
  );
};
