import FooterOne from "../../../../layouts/footers/FooterOne"
import HeaderOne from "../../../../layouts/headers/HeaderOne"
import TrustBar from "../../../homes/home-one/TrustBar"
import BreadCrumb from "../../../common/BreadCrumb"
import CartArea from "./CartArea"

const Cart = () => {
   return (
      <>
         <TrustBar />
         <HeaderOne />
         <main>
            <BreadCrumb title="Sepet" sub_title="Sepet" />
            <CartArea />
         </main>
         <FooterOne />
      </>
   )
}

export default Cart
