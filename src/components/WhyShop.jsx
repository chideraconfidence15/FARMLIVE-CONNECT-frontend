export default function WhyShop(){
  return (
    <div className="mt-[48px]">
      <div>
        <h2 className="font-bold text-[26px] text-center">Why Shop on FARMLIVE Connect</h2>
        <div className="text-center text-[#757575]">Experience the difference of food grown with care and delivered with passion</div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-start mt-[24px] bg-[#2E7D32]/10 p-6 md:p-12 rounded-xl">
        <Card />
        <Card title="Direct from Source" description="No middlemen, just you and the local farmers you trust." />
        <Card title="Eco-Friendly" description="Sustainable farming practices that protect our environment." />
      </div>
    </div>
  )
}

export function Card({img="/why/fa-solid_hands-helping.png", title="Freshly Harvested", description="Picked at peak ripeness and delivered within hours."}){
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[280px] mx-auto">
      <div className="p-4 bg-white rounded-full shadow-sm">
        <img src={img} className="w-12 h-12 object-contain" alt={title} />
      </div>
      <h2 className="font-bold text-xl md:text-[26px] text-center">{title}</h2>
      <div className="text-center text-sm md:text-base text-[#757575] leading-relaxed">{description}</div>
    </div>
  )
}
