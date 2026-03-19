import { type JSX, useState } from "react";
import BannerFormTwo from "./BannerFormTwo";

interface TabData {
   title: string;
   icon: JSX.Element;
}

const tab_title: TabData[] = [
   {
      icon: (<> <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M16.5 2.5L8.8 10.2M16.5 2.5L11.6 16.5L8.8 10.2M16.5 2.5L2.5 7.4L8.8 10.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg></>),
      title: "Tour",
   },
   {
      icon: (<><svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M1.5 17.5H14.3M11.9 7.1H9.5M12.7 10.3H9.5M12.7 13.5H9.5M3.1 17.5V2.46C3.1 1.8392 3.4768 1.5 4.06 1.5C5.3976 1.5 6.0664 1.5 6.6264 1.588C8.12821 1.82593 9.51614 2.53322 10.5913 3.60848C11.6664 4.68373 12.3735 6.07176 12.6112 7.5736C12.7 8.1336 12.7 8.8024 12.7 10.14V17.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg></>),
      title: "Hotel",
   },
   {
      icon: (<><svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M6.90217 4.0712L6.90345 3.05744C6.90413 2.37893 7.17414 1.72844 7.65416 1.2489C8.13418 0.769362 8.78494 0.5 9.46345 0.5C10.874 0.5 12.017 1.64304 12.017 3.0536V4.06864C14.0785 4.68298 15.8502 6.01812 17.009 7.83035C18.1677 9.64258 18.6361 11.8111 18.3287 13.94H0.591767C0.284915 11.8118 0.753291 9.64421 1.91147 7.83257C3.06964 6.02094 4.84045 4.68599 6.90089 4.0712H6.90217ZM1.14089 15.22H17.7809C17.9506 15.22 18.1134 15.2874 18.2334 15.4075C18.3535 15.5275 18.4209 15.6903 18.4209 15.86C18.4209 16.0297 18.3535 16.1925 18.2334 16.3125C18.1134 16.4326 17.9506 16.5 17.7809 16.5H1.14089C0.971149 16.5 0.808362 16.4326 0.688339 16.3125C0.568316 16.1925 0.500887 16.0297 0.500887 15.86C0.500887 15.6903 0.568316 15.5275 0.688339 15.4075C0.808362 15.2874 0.971149 15.22 1.14089 15.22ZM1.78089 12.66H17.1409C17.1409 11.6514 16.9422 10.6528 16.5563 9.72099C16.1703 8.78921 15.6046 7.94257 14.8915 7.22942C14.1783 6.51627 13.3317 5.95056 12.3999 5.5646C11.4681 5.17865 10.4694 4.98 9.46089 4.98C8.45234 4.98 7.45366 5.17865 6.52188 5.5646C5.5901 5.95056 4.74346 6.51627 4.03031 7.22942C3.31715 7.94257 2.75145 8.78921 2.36549 9.72099C1.97954 10.6528 1.78089 11.6514 1.78089 12.66ZM10.737 3.7V3.0536C10.737 2.71582 10.6029 2.39188 10.364 2.15303C10.1252 1.91418 9.80123 1.78 9.46345 1.78C9.12419 1.78 8.79881 1.91468 8.5588 2.15445C8.31879 2.39422 8.18379 2.71946 8.18345 3.05872V3.7H10.737Z" fill="currentColor" />
      </svg></>),
      title: "Restaurant",
   },
   {
      icon: (<><svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M6.5 17.5V9.5H11.5V17.5M1.5 7.1L9 1.5L16.5 7.1V15.9C16.5 16.3243 16.3244 16.7313 16.0118 17.0314C15.6993 17.3314 15.2754 17.5 14.8333 17.5H3.16667C2.72464 17.5 2.30072 17.3314 1.98816 17.0314C1.67559 16.7313 1.5 16.3243 1.5 15.9V7.1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg></>),
      title: "Rental",
   },
   {
      icon: (<><svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M16.5 1.5L10.0227 8.625L6.61364 4.875L1.5 10.5M16.5 1.5H12.4091M16.5 1.5L16.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg></>),
      title: "Activity",
   },
   {
      icon: (<> <svg width="19" height="12" viewBox="0 0 19 12" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M4.20913 0.5C3.45763 0.5 2.76351 0.8674 2.34557 1.47955L0.781259 3.7659C0.59716 4.03549 0.499257 4.35254 0.50001 4.6767V8.32045C0.498973 8.5646 0.581457 8.80209 0.734344 8.99513C0.887231 9.18817 1.10174 9.32568 1.34376 9.3858L2.80288 9.74715C2.90782 10.2415 3.18344 10.6854 3.58349 11.0046C3.98355 11.3238 4.48369 11.4987 5.00001 11.5C6.04176 11.5 6.91138 10.7955 7.16226 9.85H12.4003C12.6511 10.7955 13.5208 11.5 14.5625 11.5C15.6042 11.5 16.4739 10.7955 16.7247 9.85H17.375C17.9904 9.85 18.5 9.3517 18.5 8.75V6.7392C18.4995 6.24896 18.3314 5.77295 18.0225 5.38681C17.7136 5.00066 17.2816 4.72652 16.7951 4.60795L13.7536 3.8517L11.5565 1.2909C11.3463 1.04361 11.0831 0.844562 10.7854 0.707879C10.4877 0.571197 10.163 0.500226 9.83413 0.5H4.20913ZM4.20913 1.6H6.68751V3.8H2.1172L3.27763 2.0983V2.08125C3.37955 1.93158 3.51808 1.80917 3.68065 1.72513C3.84322 1.64108 4.02525 1.59807 4.20913 1.6ZM7.8125 1.6H9.83413C10.1677 1.6 10.4821 1.7441 10.6953 1.99545L12.2422 3.8H7.8125V1.6ZM1.62501 4.9H13.3672L16.5312 5.6733C16.774 5.73221 16.9894 5.86948 17.1425 6.06291C17.2956 6.25634 17.3776 6.49461 17.375 6.7392V8.75H16.7247C16.4739 7.80455 15.6042 7.1 14.5625 7.1C13.5208 7.1 12.6511 7.80455 12.4003 8.75H7.16226C6.91138 7.80455 6.04176 7.1 5.00001 7.1C4.00269 7.1 3.16513 7.7446 2.8732 8.62955L1.62501 8.321V4.9ZM5.00001 8.2C5.62832 8.2 6.12501 8.68565 6.12501 9.3C6.12501 9.91435 5.62832 10.4 5.00001 10.4C4.37169 10.4 3.87501 9.91435 3.87501 9.3C3.87501 8.68565 4.37169 8.2 5.00001 8.2ZM14.5625 8.2C15.1908 8.2 15.6875 8.68565 15.6875 9.3C15.6875 9.91435 15.1908 10.4 14.5625 10.4C13.9342 10.4 13.4375 9.91435 13.4375 9.3C13.4375 8.68565 13.9342 8.2 14.5625 8.2Z" fill="currentColor" />
      </svg></>),
      title: "Car Rental",
   },
];

const form_data: number[] = [1, 2, 3, 4, 5, 6];

const BannerFormFour = () => {

   const [activeTab, setActiveTab] = useState(0);

   // Handle tab click event
   const handleTabClick = (index: number) => {
      setActiveTab(index);
   };

   return (
      <div className="tg-booking-form-area tg-booking-4-form-area tg-grey-bg pb-65">
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <div className="tg-booking-form-wrap tg-booking-form-space">
                     <div className="tg-booking-form-tabs">
                        <div className="nav nav-tab justify-content-center" id="nav-tab" role="tablist">
                           {tab_title.map((tab, index) => (
                              <button key={index} className={`nav-link ${activeTab === index ? "active" : ""}`} onClick={() => handleTabClick(index)} id="nav-platform-tab">
                                 <span className="borders"></span>
                                 <span className="icon">{tab.icon}</span>
                                 <span>{tab.title}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="tab-content" id="nav-tabContent">
                        {form_data.map((item, index) => (
                           <div key={item} className={`tab-pane fade ${activeTab === index ? 'show active' : ''}`} id="nav-platform">
                              <div className="tg-booking-form-item">
                                 <BannerFormTwo />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default BannerFormFour
