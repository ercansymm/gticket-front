import { lazy, Suspense } from "react"
import Banner from "./Banner"
import TrustBar from "./TrustBar"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import FooterOne from "../../../layouts/footers/FooterOne"
import CookieConsent from "../../common/CookieConsent"

const Location = lazy(() => import("./Location"))
const Process = lazy(() => import("./Process"))
const Blog = lazy(() => import("./Blog"))

/** AtaBilet — Ana sayfa. Arama odaklı, sade layout. */
const HomeOne = () => {
   return (
      <>
         <TrustBar />
         <HeaderOne />
         <main>
            <Banner />
            <Suspense fallback={<div style={{ minHeight: 200 }} />}>
               <Location />
            </Suspense>
            <Suspense fallback={<div style={{ minHeight: 200 }} />}>
               <Process />
            </Suspense>
            <Suspense fallback={<div style={{ minHeight: 200 }} />}>
               <Blog />
            </Suspense>
         </main>
         <FooterOne />
         <CookieConsent />
      </>
   )
}

export default HomeOne
