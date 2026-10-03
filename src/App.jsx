import './App.css'
import ProductSlide from './components/ProductSlide'
import CategoriesSlide from './components/CategoriesSlide'
import TopRatedFarms from './components/TopRatedFarms'
import WhyShop from './components/WhyShop'
import HowItWorks from './components/HowItWorks'
import { Button } from '@heroui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAllFarms, fetchAllProducts } from './controllers/productController'
import FarmCardGroup from './components/cards/FarmCardGroup'

function App() {
  const [farms, setFarms] = useState([]);
  const [products, setProducts] = useState([]);
  const [isFarmsLoading, setIsFarmsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllFarms().then(data => {
      setFarms(data.slice(0, 4))
      setIsFarmsLoading(false);
    }).catch(error => {
      console.error(error);
      setIsFarmsLoading(false);
    })

    fetchAllProducts().then(data => {
      setProducts(data.slice(0, 8))
      setIsProductsLoading(false);
    }).catch(error => {
      console.error(error);
      setIsProductsLoading(false);
    })

    return () => {
      setFarms([]);
      setProducts([]);
    }
  }, [])

  return (
    <div>
      <div className='relative bg-[url("/hero.jpg")] bg-cover bg-center h-[420px] md:h-[500px] rounded-2xl overflow-hidden flex flex-col items-center md:items-start justify-center text-white px-6 md:px-0 shadow-lg'>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className='relative z-10 md:ml-[93px] text-center md:text-left max-w-xl'>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-yellow-300 font-semibold text-xs md:text-sm mb-3 border border-white/20">
            <span>Verified Livestock & Pastoral Farmland</span>
          </div>
          {/* Heading */}
          <h2 className='font-extrabold text-[32px] md:text-[54px] leading-tight max-w-[340px] md:max-w-[500px] mx-auto md:mx-0 drop-shadow-sm'>
            Healthy Livestock & Breeds From Trusted Farmlands
          </h2>

          {/* Subtext */}
          <div className='mt-4 text-[#F1F5F9] text-sm md:text-base max-w-[505px] leading-relaxed drop-shadow'>
            Connect directly with verified breeders and pastoral ranches. Source premium goats, sheep, cattle, poultry, fish fingerlings, and fresh produce delivered nationwide.
          </div>

          {/* Responsive Buttons */}
          <div className='flex flex-col sm:flex-row justify-center md:justify-start gap-3 mt-[24px] w-full sm:w-auto'>
            <Button 
              className='text-yellow-300 font-bold rounded-lg w-full sm:w-auto px-8 py-3 shadow-md bg-[#14532D] hover:bg-[#166534] transition-transform active:scale-95' 
              onPress={() => navigate('/categories')}
            >
              Explore Livestock & Produce
            </Button>
            <Button 
              className='text-yellow-300 font-bold rounded-lg w-full sm:w-auto px-8 py-3 shadow-md bg-[#14532D] hover:bg-[#166534] transition-transform active:scale-95' 
              onPress={() => navigate('/dashboard')}
            >
              Start Selling
            </Button>
          </div>
        </div>
      </div>
      
      <FarmCardGroup title='Nearby Farms & Breeders' data={farms} isLoading={isFarmsLoading} />
      <CategoriesSlide />
      <ProductSlide title="Today's Fresh Picks & Stock" products={products} type="buy_add" isLoading={isProductsLoading} />
      <TopRatedFarms data={farms} isLoading={isFarmsLoading} />
      <WhyShop />
      <HowItWorks />
    </div>
  )
}

export default App
