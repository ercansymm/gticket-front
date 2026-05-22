"use client"
import { lazy, Suspense, useEffect } from "react"
import Banner from "./Banner"
import TrustStrip from "./TrustStrip"
import Campaigns from "./Campaigns"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import FooterOne from "../../../layouts/footers/FooterOne"
import CookieConsent from "../../common/CookieConsent"

const Location = lazy(() => import("./Location"))
const HowItWorks = lazy(() => import("./HowItWorks"))
const WhyAtaBilet = lazy(() => import("./WhyAtaBilet"))
const Blog = lazy(() => import("./Blog"))
const AirlinePartners = lazy(() => import("./AirlinePartners"))

/** AtaBilet — Ana sayfa. Arama odaklı, sade layout. */
const HomeOne = () => {
   useEffect(() => {
      document.body.classList.add("bb-home")
      return () => document.body.classList.remove("bb-home")
   }, [])
   return (
      <>
         <HeaderOne />
         <main>
            <Banner />
            <Campaigns />
            <Suspense fallback={<div style={{ minHeight: 200 }} />}>
               <Location />
            </Suspense>
            <TrustStrip />
            <Suspense fallback={<div style={{ minHeight: 200 }} />}>
               <WhyAtaBilet />
            </Suspense>
            <Suspense fallback={<div style={{ minHeight: 200 }} />}>
               <HowItWorks />
            </Suspense>
            <Suspense fallback={<div style={{ minHeight: 200 }} />}>
               <Blog />
            </Suspense>
            <Suspense fallback={<div style={{ minHeight: 200 }} />}>
               <AirlinePartners />
            </Suspense>
         </main>
         <FooterOne />
         <CookieConsent />
      </>
   )
}

export default HomeOne
