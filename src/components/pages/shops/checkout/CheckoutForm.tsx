import NiceSelect from "../../../../ui/NiceSelect";

const CheckoutForm = () => {

   const selectHandler = () => { };

   return (
      <div className="col-xl-9 col-lg-8">
         <div className="tg-checkout-form-wrapper mr-50">
            <h2 className="tg-checkout-form-title mb-30">Fatura Bilgileri</h2>
            <div className="row gx-24">
               <div className="col-lg-6 col-md-6">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="Ad" />
                  </div>
               </div>
               <div className="col-lg-6 col-md-6">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="Soyad" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="Firma Adı" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input">
                     <NiceSelect
                        className="select input mb-25"
                        options={[
                           { value: "01", text: "Ülke / Bölge*" },
                           { value: "02", text: "Türkiye" },
                           { value: "03", text: "Almanya" },
                           { value: "04", text: "İngiltere" },
                           { value: "05", text: "Fransa" },
                           { value: "06", text: "Hollanda" },
                        ]}
                        defaultCurrent={0}
                        onChange={selectHandler}
                        name=""
                        placeholder="" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="Ev numarası ve sokak adı" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="Apartman, Daire, Blok vb. (İsteğe bağlı)" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input">
                     <NiceSelect
                        className="select input  mb-25"
                        options={[
                           { value: "01", text: "İl / İlçe" },
                           { value: "02", text: "İstanbul" },
                           { value: "03", text: "Ankara" },
                           { value: "04", text: "İzmir" },
                           { value: "05", text: "Antalya" },
                        ]}
                        defaultCurrent={0}
                        onChange={selectHandler}
                        name=""
                        placeholder="" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="İl" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="text" placeholder="Posta Kodu" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <input className="input" type="tel" placeholder="Telefon" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-40">
                     <input className="input" type="email" placeholder="E-posta Adresi" />
                  </div>
               </div>
               <div className="col-lg-12">
                  <div className="tg-checkout-form-input mb-25">
                     <h2 className="tg-checkout-form-title tg-checkout-form-title-2 mb-15">Ek Bilgiler</h2>
                     <textarea className="input textarea" placeholder="Sipariş Notu (İsteğe bağlı) "></textarea>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default CheckoutForm
