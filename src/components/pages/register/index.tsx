import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import TrustBar from "../../homes/home-one/TrustBar"
import RegisterArea from "./RegisterArea"

const Register = () => {
   return (
      <>
         <TrustBar />
         <HeaderOne />
         <main>
            <RegisterArea />
         </main>
         <FooterOne />
      </>
   )
}

export default Register
