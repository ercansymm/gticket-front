import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { RootState } from "../../../redux/store";

const TotalCart = () => {
   const productItem = useSelector((state: RootState) => state.cart.cart);
   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
      setIsClient(true);
   }, []);

   if (!isClient) return null;

   return <>{productItem.length}</>;
};

export default TotalCart;
