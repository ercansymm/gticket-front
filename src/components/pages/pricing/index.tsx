import PricingArea from "./PricingArea"
import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import TrustBar from "../../homes/home-one/TrustBar"
import BreadCrumb from "../../common/BreadCrumb"

const Pricing = () => {
  return (
    <>
      <TrustBar />
      <HeaderOne />
      <main>
        <BreadCrumb title="Fiyat Planları" sub_title="Fiyat Planları" />
        <PricingArea />
      </main>
      <FooterOne />
    </>
  )
}

export default Pricing
