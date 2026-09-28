import HeroBanner from '../components/home/HeroBanner'
import BrandSection from '../components/home/BrandSection'
import PromoStrip from '../components/home/PromoStrip'
import FeaturedProducts from '../components/home/FeaturedProducts'
import NewProducts from '../components/home/NewProducts'
import HotProducts from '../components/home/HotProducts'
import BannerMid from '../components/home/BannerMid'
import WhyUs from '../components/home/WhyUs'

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <HeroBanner />
      <PromoStrip />
      <BrandSection />
      <FeaturedProducts />
      <BannerMid />
      <NewProducts />
      <HotProducts />
      <WhyUs />
    </div>
  )
}
