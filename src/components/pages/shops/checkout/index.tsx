import FooterOne from "../../../../layouts/footers/FooterOne"
import HeaderOne from "../../../../layouts/headers/HeaderOne"
import TrustBar from "../../../homes/home-one/TrustBar"
import BreadCrumb from "../../../common/BreadCrumb"
import CheckoutArea from "./CheckoutArea"

const Checkout = () => {
   return (
      <>
         <TrustBar />
         <HeaderOne />
         <main>
            <BreadCrumb title="Ödeme" sub_title="Ödeme" />
            <CheckoutArea />
         </main>
         <FooterOne />
      </>
   )
}

export default Checkout
