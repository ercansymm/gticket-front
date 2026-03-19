interface DataType {
   id: number;
   title: string;
   desc: string;
   price: number;
   list: string[];
}

const pricing_data: DataType[] = [
   {
      id: 1,
      title: "Basic",
      desc: "Namvel lacus eu nisl bibendum accu magna hendrerit sagittis.",
      price: 299,
      list: ["Advanced Segmentation", "Travel Tour Guideline", "Comparative Reporting", "Insurance Travel Quote", "Ticket Booking Area", "24/7 Customer Support",],
   },
   {
      id: 2,
      title: "Standard",
      desc: "Namvel lacus eu nisl bibendum accu magna hendrerit sagittis.",
      price: 799,
      list: ["Advanced Segmentation", "Travel Tour Guideline", "Comparative Reporting", "Insurance Travel Quote", "Ticket Booking Area", "24/7 Customer Support",],
   },
   {
      id: 3,
      title: "Cooperate",
      desc: "Namvel lacus eu nisl bibendum accu magna hendrerit sagittis.",
      price: 999,
      list: ["Advanced Segmentation", "Travel Tour Guideline", "Comparative Reporting", "Insurance Travel Quote", "Ticket Booking Area", "24/7 Customer Support",],
   },
];

export default pricing_data;