import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import TrustBar from "../../homes/home-one/TrustBar"
import LoginArea from "./LoginArea"

const Login = () => {
   return (
      <>
         <TrustBar />
         <HeaderOne />
         <main>
            <LoginArea />
         </main>
         <FooterOne />
      </>
   )
}

export default Login
