import {Card, CardBody, CardFooter, Image, Skeleton, Button} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/cartContext";
import toast from "react-hot-toast";

export default function CardComponent({data, isLoading}) {
  const { addToCart } = useCart();
  let list = data
  const navigate = useNavigate();

  const handleAddToCart = (e, item) => {
    e.stopPropagation(); // Prevent the card's onPress from triggering
    addToCart(item, 1);
    toast.success(`${item.productName} added to cart!`);
  };

  if (isLoading) {
    return (
      <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="border border-yellow-500 bg-white" shadow="sm">
            <CardBody className="overflow-visible p-2">
              <Skeleton className="rounded-lg">
                <div className="h-[192px] rounded-lg bg-default-300"></div>
              </Skeleton>
            </CardBody>
            <CardFooter className="text-small flex-col items-start gap-2">
              <Skeleton className="w-3/5 rounded-lg">
                <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
              </Skeleton>
              <div className="flex justify-between w-full gap-4">
                <Skeleton className="w-2/5 rounded-lg">
                  <div className="h-3 w-2/5 rounded-lg bg-default-200"></div>
                </Skeleton>
                <Skeleton className="w-8 h-8 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-default-200"></div>
                </Skeleton>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {list?.map((item, index) => (
        /* eslint-disable no-console */
        <Card key={index} className="border border-yellow-500 bg-white" isPressable shadow="sm" onPress={() => navigate(`/product/${item.$id}`)}>
          <CardBody className="overflow-visible p-2">
            <Image
              alt={item.productName}
              className="w-full object-cover h-[192px]"
              radius="lg"
              shadow="sm"
              src={item.img}
              width="100%"
            />
          </CardBody>
          <CardFooter className="text-small flex-col items-start">
            <div>
              <span className="text-[14px]">{item.productName}</span>
            </div>
            <div className="flex justify-between w-full gap-4">
              <div>
                <span className="font-bold">{item.price}</span>/kg
              </div>
              <Button 
                isIconOnly 
                className="bg-transparent h-fit w-fit min-w-0 p-0" 
                onClick={(e) => handleAddToCart(e, item)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="#66BB6A" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="size-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </Button>
            </div>
        </CardFooter>
        </Card>
      ))}
    </div>
  );
}

