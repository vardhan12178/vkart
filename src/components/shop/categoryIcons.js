import {
  FiSmartphone, FiMonitor, FiTablet, FiTv, FiHeadphones, FiWatch, FiDroplet, FiUser, FiShoppingBag,
  FiHome, FiCoffee, FiScissors, FiActivity, FiCpu,
} from "react-icons/fi";

// One icon per storefront category, shared by the listing's category bar and the header menu
export const CATEGORY_ICONS = {
  mobiles: FiSmartphone, laptops: FiCpu, tablets: FiTablet, tvs: FiTv, monitors: FiMonitor, audio: FiHeadphones,
  wearables: FiWatch, skincare: FiDroplet, "fashion-men": FiUser, "fashion-women": FiShoppingBag,
  appliances: FiHome, "kitchen-appliances": FiCoffee, grooming: FiScissors, sports: FiActivity,
};

export const iconFor = (key) => CATEGORY_ICONS[key] || FiShoppingBag;
