interface DataType {
   id: number;
   title: string;
   count: number;
}

const cat_data: DataType[] = [
   {
      id: 1,
      title: "Activity",
      count: 15,
   },
   {
      id: 2,
      title: "Destinations",
      count: 44,
   },
   {
      id: 3,
      title: "Beach Tour",
      count: 11,
   },
   {
      id: 4,
      title: "City Tour",
      count: 22,
   },
   {
      id: 5,
      title: "Flight",
      count: 15,
   },
   {
      id: 6,
      title: "Lifestyle",
      count: 20,
   },
];

const Category = () => {
   return (
      <div className="tg-blog-categories tg-blog-sidebar-box mb-40">
         <h5 className="tg-blog-sidebar-title mb-5">Categories</h5>
         <div className="tg-blog-categories-list">
            <ul>
               {cat_data.map((item) => (
                  <li key={item.id}>
                     <span>{item.title}</span>
                     <span>({item.count})</span>
                  </li>
               ))}
            </ul>
         </div>
      </div>
   )
}

export default Category
