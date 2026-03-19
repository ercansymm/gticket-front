import NiceSelect from "../../../../ui/NiceSelect";

const CheckoutForm = () => {

   const selectHandler = () => { };

   return (
      <div className="col-xl-9 col-lg-8">
         <div className="tg-checkout-form-wrapper mr-50">
            <h2 className="tg-checkout-form-title mb-30">Billing Details</h2>
            <div className="row gx-24">
               <div className="col-lg-6 col-md-6">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="First Name" />
                  </div>
               </div>
               <div className="col-lg-6 col-md-6">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="Last Name" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="Company Name" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input">
                     <NiceSelect
                        className="select input mb-25"
                        options={[
                           { value: "01", text: "Country / Region*" },
                           { value: "02", text: "Canada" },
                           { value: "03", text: "Span" },
                           { value: "04", text: "India" },
                           { value: "05", text: "Uganda" },
                           { value: "06", text: "Bangladesh" },
                        ]}
                        defaultCurrent={0}
                        onChange={selectHandler}
                        name=""
                        placeholder="" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="House number and street name" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="Apartment, Suite, unit, etc (Optional)" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input">
                     <NiceSelect
                        className="select input  mb-25"
                        options={[
                           { value: "01", text: "Town / City" },
                           { value: "02", text: "Luhanshchyna" },
                           { value: "03", text: "London" },
                           { value: "04", text: "Volyn" },
                           { value: "05", text: "Dnipropetrovshchyna" },
                        ]}
                        defaultCurrent={0}
                        onChange={selectHandler}
                        name=""
                        placeholder="" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="State" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="Zip Code" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="tel" placeholder="Phone" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-40">
                     <input className="input" type="email" placeholder="E-mail Address" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <h2 className="tg-checkout-form-title tg-checkout-form-title-2 mb-15">Additional Information</h2>
                     <textarea className="input textarea" placeholder="Order Note (Optional) "></textarea>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default CheckoutForm
