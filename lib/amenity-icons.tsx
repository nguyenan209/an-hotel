import {
  Wifi,
  Snowflake,
  Shirt,
  Flame,
  Dumbbell,
  ShowerHeadIcon as SwimmingPool,
  ParkingSquare,
  Trees,
  UtensilsCrossed,
  Tv,
  Footprints,
  Bath,
  Music,
  Coffee,
  Refrigerator,
  Microwave,
  Wind,
  Droplets,
  Waves,
  Bed,
  CableCarIcon as Elevator,
  Camera,
  Key,
  ShieldCheck,
  BookOpen,
  Utensils,
  Car,
  Sofa,
  Gamepad2,
  Baby,
  Bike,
  Cigarette,
  PawPrint,
  ShipWheelIcon as Wheelchair,
  Sunrise,
  Mountain,
  Umbrella,
  Palette,
  type LucideIcon,
} from "lucide-react";

// Định nghĩa kiểu dữ liệu cho mapping
export interface AmenityIcon {
  icon: LucideIcon;
  label: string;
  description?: string;
  category?: string;
}

// Mapping giữa tên tiện nghi và biểu tượng tương ứng
export const amenityIcons: Record<string, AmenityIcon> = {
  // Tiện nghi cơ bản
  Wifi: {
    icon: Wifi,
    label: "Wifi",
    description: "Kết nối internet không dây tốc độ cao",
    category: "Cơ bản",
  },
  "Máy lạnh": {
    icon: Snowflake,
    label: "Máy lạnh",
    description: "Điều hòa nhiệt độ",
    category: "Cơ bản",
  },
  "Máy giặt": {
    icon: Shirt,
    label: "Máy giặt",
    description: "Máy giặt quần áo",
    category: "Cơ bản",
  },
  BBQ: {
    icon: Flame,
    label: "BBQ",
    description: "Khu vực nướng BBQ",
    category: "Ngoài trời",
  },
  "Phòng gym": {
    icon: Dumbbell,
    label: "Phòng gym",
    description: "Phòng tập thể dục với các thiết bị",
    category: "Tiện nghi",
  },
  "Bể bơi": {
    icon: SwimmingPool,
    label: "Bể bơi",
    description: "Bể bơi riêng hoặc chung",
    category: "Ngoài trời",
  },
  "Bãi đỗ xe": {
    icon: ParkingSquare,
    label: "Bãi đỗ xe",
    description: "Khu vực đỗ xe miễn phí",
    category: "Cơ bản",
  },
  "Lò sưởi": {
    icon: Flame,
    label: "Lò sưởi",
    description: "Lò sưởi trong nhà",
    category: "Cơ bản",
  },
  "Sân vườn": {
    icon: Trees,
    label: "Sân vườn",
    description: "Khu vực sân vườn riêng",
    category: "Ngoài trời",
  },
  Bếp: {
    icon: UtensilsCrossed,
    label: "Bếp",
    description: "Khu vực nấu ăn đầy đủ tiện nghi",
    category: "Cơ bản",
  },
  TV: {
    icon: Tv,
    label: "TV",
    description: "Tivi màn hình phẳng",
    category: "Cơ bản",
  },
  "Ban công": {
    icon: Footprints,
    label: "Ban công",
    description: "Ban công riêng",
    category: "Ngoài trời",
  },
  Jacuzzi: {
    icon: Bath,
    label: "Jacuzzi",
    description: "Bồn tắm sục Jacuzzi",
    category: "Tiện nghi",
  },

  // Tiện nghi bổ sung
  "Loa bluetooth": {
    icon: Music,
    label: "Loa bluetooth",
    description: "Hệ thống âm thanh bluetooth",
    category: "Giải trí",
  },
  "Máy pha cà phê": {
    icon: Coffee,
    label: "Máy pha cà phê",
    description: "Máy pha cà phê tự động",
    category: "Bếp",
  },
  "Tủ lạnh": {
    icon: Refrigerator,
    label: "Tủ lạnh",
    description: "Tủ lạnh đầy đủ kích cỡ",
    category: "Bếp",
  },
  "Lò vi sóng": {
    icon: Microwave,
    label: "Lò vi sóng",
    description: "Lò vi sóng để hâm nóng thức ăn",
    category: "Bếp",
  },
  "Máy sấy tóc": {
    icon: Wind,
    label: "Máy sấy tóc",
    description: "Máy sấy tóc cá nhân",
    category: "Phòng tắm",
  },
  "Vòi sen": {
    icon: Droplets,
    label: "Vòi sen",
    description: "Vòi sen nước nóng",
    category: "Phòng tắm",
  },
  "Nước nóng": {
    icon: Waves,
    label: "Nước nóng",
    description: "Hệ thống nước nóng 24/7",
    category: "Phòng tắm",
  },
  "Giường đôi": {
    icon: Bed,
    label: "Giường đôi",
    description: "Giường cỡ đôi thoải mái",
    category: "Phòng ngủ",
  },
  "Thang máy": {
    icon: Elevator,
    label: "Thang máy",
    description: "Có thang máy trong tòa nhà",
    category: "Tiện nghi",
  },
  "Camera an ninh": {
    icon: Camera,
    label: "Camera an ninh",
    description: "Hệ thống camera an ninh 24/7",
    category: "An ninh",
  },
  "Khóa cửa an toàn": {
    icon: Key,
    label: "Khóa cửa an toàn",
    description: "Hệ thống khóa cửa an toàn",
    category: "An ninh",
  },
  "Bình chữa cháy": {
    icon: Flame,
    label: "Bình chữa cháy",
    description: "Bình chữa cháy trong trường hợp khẩn cấp",
    category: "An ninh",
  },
  "Sách và tạp chí": {
    icon: BookOpen,
    label: "Sách và tạp chí",
    description: "Sách và tạp chí để đọc",
    category: "Giải trí",
  },
  "Bàn ăn": {
    icon: Utensils,
    label: "Bàn ăn",
    description: "Bàn ăn cho gia đình",
    category: "Bếp",
  },
  "Chỗ đậu xe miễn phí": {
    icon: Car,
    label: "Chỗ đậu xe miễn phí",
    description: "Chỗ đậu xe miễn phí trong khuôn viên",
    category: "Cơ bản",
  },
  "Phòng khách riêng": {
    icon: Sofa,
    label: "Phòng khách riêng",
    description: "Phòng khách riêng biệt",
    category: "Cơ bản",
  },
  "Phòng chơi game": {
    icon: Gamepad2,
    label: "Phòng chơi game",
    description: "Phòng chơi game với các thiết bị giải trí",
    category: "Giải trí",
  },
  "Thiết bị cho trẻ em": {
    icon: Baby,
    label: "Thiết bị cho trẻ em",
    description: "Cũi, ghế cao và đồ chơi cho trẻ em",
    category: "Gia đình",
  },
  "Cho thuê xe đạp": {
    icon: Bike,
    label: "Cho thuê xe đạp",
    description: "Dịch vụ cho thuê xe đạp",
    category: "Dịch vụ",
  },
  "Khu vực hút thuốc": {
    icon: Cigarette,
    label: "Khu vực hút thuốc",
    description: "Khu vực được phép hút thuốc",
    category: "Tiện nghi",
  },
  "Cho phép thú cưng": {
    icon: PawPrint,
    label: "Cho phép thú cưng",
    description: "Chỗ ở thân thiện với thú cưng",
    category: "Chính sách",
  },
  "Tiếp cận cho người khuyết tật": {
    icon: Wheelchair,
    label: "Tiếp cận cho người khuyết tật",
    description: "Tiếp cận thuận tiện cho người khuyết tật",
    category: "Tiếp cận",
  },
  "View biển": {
    icon: Sunrise,
    label: "View biển",
    description: "Tầm nhìn ra biển",
    category: "Cảnh quan",
  },
  "View núi": {
    icon: Mountain,
    label: "View núi",
    description: "Tầm nhìn ra núi",
    category: "Cảnh quan",
  },
  "Dù che nắng": {
    icon: Umbrella,
    label: "Dù che nắng",
    description: "Dù che nắng ngoài trời",
    category: "Ngoài trời",
  },
  "Trang trí nghệ thuật": {
    icon: Palette,
    label: "Trang trí nghệ thuật",
    description: "Trang trí nội thất nghệ thuật",
    category: "Nội thất",
  },

  // Mặc định cho các tiện nghi chưa được định nghĩa
  default: {
    icon: ShieldCheck,
    label: "Tiện nghi khác",
    description: "Tiện nghi bổ sung",
    category: "Khác",
  },
};

// Hàm lấy icon cho một tiện nghi
export function getAmenityIcon(amenity: string) {
  return amenityIcons[amenity] || amenityIcons.default;
}

// Hàm lấy tất cả các tiện nghi theo danh mục
export function getAmenitiesByCategory() {
  const categories: Record<string, AmenityIcon[]> = {};

  Object.values(amenityIcons).forEach((amenity) => {
    if (amenity.category) {
      if (!categories[amenity.category]) {
        categories[amenity.category] = [];
      }
      categories[amenity.category].push(amenity);
    }
  });

  return categories;
}

// Danh sách tất cả các danh mục
export function getAllCategories() {
  const categories = new Set<string>();

  Object.values(amenityIcons).forEach((amenity) => {
    if (amenity.category) {
      categories.add(amenity.category);
    }
  });

  return Array.from(categories);
}
