import RatedCard from "../components/cards/RatedCard";
import PricedCard from "../components/cards/PricedCard";
import {Button, Card, CardBody, CardFooter, Image, Skeleton} from "@heroui/react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/cartContext";
import toast from "react-hot-toast";

export default function ProductSlide({ title = "Featured Products", products = null, type, isLoading = false }) {
  let card;

  switch (type) {
    case "rated":
      card = <RatedCard products={products} isLoading={isLoading} />;
      break;
    case "priced":
      card = <PricedCard data={products} isLoading={isLoading} />;
      break;
    case "buy_add":
      card = <CartCard data={products} isLoading={isLoading} />;
      break;
    default:
      card = <PricedCard data={products} isLoading={isLoading} />;
  }

  return (
    <div className="w-full my-4">
      <div className="flex items-center overflox-x-scroll md:overflow-x-hidden font-bold mt-[48px] justify-between mb-4">
        <div className="text-[26px]">
          {title}
          <div className="font-normal text-lg text-[#757575]">Fresh from our fields this morning</div>
        </div>
        <Link to="/categories" className="flex gap-2 items-center text-[#2E7D32]">
          <span>See More</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
      <div>
        {card}
      </div>
    </div>
  );
}

export function CartCard({data, isLoading}) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

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
              <div className="flex w-full justify-between">
                <Skeleton className="w-3/5 rounded-lg">
                  <div className="h-4 w-3/5 rounded-lg bg-default-200"></div>
                </Skeleton>
                <Skeleton className="w-1/5 rounded-lg">
                  <div className="h-4 w-1/5 rounded-lg bg-default-200"></div>
                </Skeleton>
              </div>
              <Skeleton className="w-2/5 rounded-lg">
                <div className="h-4 w-2/5 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-full rounded-lg mt-2">
                <div className="h-10 w-full rounded-lg bg-default-200"></div>
              </Skeleton>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {data?.map((item, index) => (
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
            <div className="flex w-full justify-between">
              <span className="text-[16px] font-bold">{item.productName}</span>
              <div className="px-[6px] py-[2px] bg-green-200 rounded-full">Fresh</div>
            </div>
            <div className="flex justify-between mt-2 w-full gap-4">
              <div>
                <span className="font-bold">{item.price}</span>/ kg
              </div>
            </div>
            <div className="w-full mt-[4px]">
              <Button 
                className="w-full bg-[#14532D] font-extrabold text-yellow-300 hover:bg-[#166534]"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(item);
                  toast.success(`${item.productName} added to cart!`);
                }}
              >
                Add to Cart
              </Button>
            </div>
        </CardFooter>
        </Card>
      ))}
    </div>
  );
}
