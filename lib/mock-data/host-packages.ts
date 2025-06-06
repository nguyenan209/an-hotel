import type { HostPackage } from "@/lib/types"

export const hostPackages: HostPackage[] = [
    {
        id: "basic",
        name: "Basic",
        price: 300000,
        commission: 15,
        features: ["Xét duyệt hồ sơ cơ bản", "Tự setup listing", "Hỗ trợ email", "Commission 15%"],
    },
    {
        id: "premium",
        name: "Premium",
        price: 500000,
        commission: 12,
        popular: true,
        features: [
            "Tất cả tính năng Basic",
            "Dịch vụ chụp ảnh chuyên nghiệp",
            "Hỗ trợ ưu tiên",
            "Marketing boost 30 ngày",
            "Commission 12%",
            "Setup hỗ trợ",
        ],
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: 1000000,
        commission: 10,
        features: [
            "Tất cả tính năng Premium",
            "Dedicated account manager",
            "Custom terms & conditions",
            "Commission 10%",
            "Marketing campaign riêng",
            "Priority listing placement",
        ],
    },
]
