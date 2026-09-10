import type { ImageSource } from "expo-image";

export interface CommunityPost {
  id: string;
  author: string;
  title: string;
  body: string;
  quote?: string;
  image?: ImageSource;
  imageDescription?: string;
}

export interface ConsultationInfo {
  id: "in-person" | "online";
  title: string;
  description: string;
  details: { label: string; value: string }[];
}
