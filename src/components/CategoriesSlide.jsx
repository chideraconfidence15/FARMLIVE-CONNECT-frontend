import { Button, ButtonGroup, Skeleton } from "@heroui/react"
import { fetchCategories } from "../controllers/productController"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function CategoriesSlide(){
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories().then(categories => {
      setCategories(categories)
      setIsLoading(false)
    }).catch(error => {
      console.error("Error fetching categories", error)
      setIsLoading(false)
    })
  }, [])

  const handleCategoryClick = (categoryName) => {
    navigate("/categories", { state: { selectedCategory: categoryName } });
  };

  return (
    <div>
      <div className="flex gap-2 items-center font-bold text-[22px] md:text-[26px] mt-[48px]">
        Shop By Category
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 md:size-8 text-green-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <div className="flex overflow-x-auto gap-4 py-4 no-scrollbar">
      {isLoading ? (
        [...Array(6)].map((_, index) => (
          <div key={index} className="flex-shrink-0 w-[160px] h-[180px] md:w-[233px] md:h-[245px]">
            <Skeleton className="rounded-[24px] h-full w-full">
              <div className="h-full w-full bg-default-300"></div>
            </Skeleton>
          </div>
        ))
      ) : (
        categories.map((cat, index) => (
          <CategoryCard 
            key={index} 
            title={cat.name} 
            image={cat.img || cat.image} 
            borderColor="#EAB308" 
            onClick={() => handleCategoryClick(cat.name)}
          />
        ))
      )}
      </div>
    </div>
  )
}

export function CategoryCard({title = "Meat", image = "/categories/Fruits.png", borderColor="#4CAF50", onClick}){
  return (
    <div 
      style={{ borderColor }} 
      className="border-2 relative flex-shrink-0 grid place-items-center rounded-[24px] bg-white w-[160px] h-[180px] md:w-[233px] md:h-[245px] transition-transform hover:scale-105 cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute inset-x-3 top-10 bottom-3 grid place-items-center overflow-hidden">
        <img src={image} className="max-h-full max-w-full object-contain" alt={title} />
      </div>
      <span
        style={{
          backgroundColor: "#14532D",
          color: "#FDE047",
        }}
        className="px-[12px] py-[3.5px] absolute top-3 left-3 rounded-[6px] text-xs md:text-sm font-extrabold shadow-sm"
      >
        {title}
      </span>
    </div>
  )
}
