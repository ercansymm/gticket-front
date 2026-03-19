/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import CheckoutForm from "./CheckoutForm"
import { useSelector } from "react-redux";
import UseCartInfo from "../../../../hooks/UseCartInfo";

const CheckoutArea = () => {

   const [isHydrated, setIsHydrated] = useState(false);

   useEffect(() => {
      setIsHydrated(true);
   }, []);

   const productItem = useSelector((state: any) => state.cart.cart);
   const { total } = UseCartInfo();
   const [shipCost] = useState<number>(5);

   if (!isHydrated) return null;

   return (
      <section className="checkout-area pb-100 pt-125">
         <div className="container">
            <form onSubmit={(e) => e.preventDefault()}>
               <div className="row">
                  <CheckoutForm />
                  <div className="col-xl-3 col-lg-4">
                     <div className="tg-blog-sidebar top-sticky mb-30">
                        <div className="tg-blog-sidebar-box mb-30">
                           <h2 className="tg-checkout-form-title tg-checkout-form-title-3 mb-15">Your Order</h2>
                           <div className="tg-checkout-order-table table-responsive">
                              <table className="table">
                                 <thead>
                                    <tr>
                                       <th className="product-name">Product</th>
                                       <th className="product-total">Subtotal</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {/* <!-- item list --> */}
                                    {productItem.map((add_item: any, add_index: any) =>
                                       <tr key={add_index} className="cart_item first">
                                          <td className="product-name">
                                             {add_item.title}<span> {add_item.price.toFixed(2)} x {add_item.quantity}</span>
                                          </td>
                                          <td className="product-total">
                                             <span className="amount">${add_item.quantity * add_item.price}</span>
                                          </td>
                                       </tr>
                                    )}
                                 </tbody>
                                 <tfoot>
                                    <tr className="cart-subtotal">
                                       <th>Subtotal</th>
                                       <td><span className="amount">${total.toFixed(2)}</span></td>
                                    </tr>
                                    <tr className="cart-subtotal">
                                       <th>Shipping</th>
                                       <td><span className="amount">${shipCost.toFixed(2)}</span></td>
                                    </tr>
                                    <tr className="cart-subtotal">
                                       <th>Total</th>
                                       <td><span className="amount">${(total + shipCost).toFixed(2)}</span></td>
                                    </tr>
                                 </tfoot>
                              </table>
                           </div>
                        </div>
                        <div className="tg-blog-sidebar-box mb-25">
                           <h2 className="tg-checkout-form-title tg-checkout-form-title-3 mb-15">Payment</h2>
                           <div className="tg-checkout-payment mb-5">
                              <input type="radio" name="payment" id="payment" />
                              <label htmlFor="payment">Direct bank transfer</label>
                           </div>
                           <p className="tg-checkout-para mb-5">Make your payment directly into
                              our bank account. Please use your
                              Order ID as the payment reference.
                              Your order will not be shipped until
                              the funds have cleared in our
                              account.
                           </p>
                           <div className="tg-checkout-payment">
                              <input type="radio" name="payment" id="payment2" />
                              <label htmlFor="payment2">Cas on Delivery</label>
                           </div>
                        </div>
                        <div className="tg-checkout-form-btn">
                           <button type="submit" className="tg-btn w-100">Place Your Order</button>
                        </div>
                     </div>
                  </div>
               </div>
            </form>
         </div>
      </section>
   )
}

export default CheckoutArea
