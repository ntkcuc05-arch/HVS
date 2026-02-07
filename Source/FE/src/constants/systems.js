import { Database, Network, Monitor, Smartphone, Utensils } from "lucide-react";

// System configuration - Single source of truth
export const systemConfig = {
  "hvs-umea": {
    icon: Database,
    name: "HVS-UMEA",
    image: "/nodes/HVS-UMEA.png",
    color: "#A855F7",
    glowColor: "rgba(168, 85, 247, 0.5)",
    appLink: "https://umea-dev.huongvietsinh.com/auth/login",
    youtubeLink: "https://www.youtube.com/watch?v=7dUuktZFAIE"
  },


  "hvs-kios": {
    icon: Network,
    name: "HVS-KIOS",
    image: "/nodes/HVS-KIOS.png",
    color: "#06B6D4",
    glowColor: "rgba(6, 182, 212, 0.5)",
    appLink: "https://kios-dev.huongvietsinh.com/",
    youtubeLink: "https://www.youtube.com/watch?v=7dUuktZFAIE"
  },


  "hvs-food": {
    icon: Utensils,
    name: "HVS-FOOD",
    image: "/nodes/HVS-FOOD.png",
    color: "#10B981",
    glowColor: "rgba(16, 185, 129, 0.5)",
    appLink: "https://food-dev.huongvietsinh.com/login",
    youtubeLink: "https://www.youtube.com/watch?v=7dUuktZFAIE"
  },


  "hvs-gate": {
    icon: Monitor,
    name: "HVS-GATE",
    image: "/nodes/HVS-GATE.png",
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.5)",
    appLink: "https://gate-dev.huongvietsinh.com/login",
    youtubeLink: "https://www.youtube.com/watch?v=7dUuktZFAIE"
  },
  "hvs-kios-lite": {
    icon: Smartphone,
    name: "HVS-KIOS LITE",
    image: "/nodes/KIOSLITE.png",
    color: "#EC4899",
    glowColor: "rgba(236, 72, 153, 0.5)",
    appLink: "https://lite.huongvietsinh.com/",
    youtubeLink: "https://www.youtube.com/watch?v=7dUuktZFAIE"
  },
};
