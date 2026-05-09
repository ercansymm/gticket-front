"use client"
import { lazy, Suspense, useEffect } from "react"
import Banner from "./Banner"
import Campaigns from "./Campaigns"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import FooterOne from "../../../layouts/footers/FooterOne"
import CookieConsent from "../../common/CookieConsent"

const Location = lazy(() => import("./Location"))
const HowItWorks = lazy(() => import("./HowItWorks"))
const WhyAtaBilet = lazy(() => import("./WhyAtaBilet"))
const Blog = lazy(() => import("./Blog"))

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
            <Suspense fallback={<div style={{ minHeight: 200 }} />}>
               <WhyAtaBilet />
            </Suspense>
            <Suspense fallback={<div style={{ minHeight: 200 }} />}>
               <HowItWorks />
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
