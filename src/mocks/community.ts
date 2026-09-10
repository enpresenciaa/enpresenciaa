import type { CommunityPost, ConsultationInfo } from "@/features/community/types";

// Editorial preview only. Replace these local fixtures with approved content.
export const communityPostsMock: CommunityPost[] = [
  {
    id: "a-tu-ritmo",
    author: "En Presenciaa",
    title: "Cada paso tiene su tiempo",
    body: "Hay días para avanzar y días para hacer una pausa. Este espacio es una invitación a encontrarte con tu propio ritmo.",
    image: require("../../assets/images/Camino.png"),
    imageDescription: "Un camino entre árboles y niebla",
  },
  {
    id: "volver-al-presente",
    quote: "Vuelve a ti.\nVuelve al presente.",
    author: "En Presenciaa",
    title: "Un momento para estar aquí",
    body: "Mira a tu alrededor. Escucha los sonidos que te acompañan. A veces, volver al presente empieza con algo tan sencillo como observar.",
  },
];

// TODO(product): approve contact destinations, address, platform and hours.
// No actionable destinations are defined until that information is confirmed.
export const consultationInfoMock: ConsultationInfo[] = [
  {
    id: "in-person",
    title: "Presencial",
    description: "Un espacio para encontrarnos en persona.",
    details: [
      { label: "Dirección", value: "Por confirmar" },
      { label: "Horarios", value: "Por confirmar" },
      { label: "Contacto", value: "Por confirmar" },
    ],
  },
  {
    id: "online",
    title: "En línea",
    description: "Un espacio para conversar a distancia.",
    details: [
      { label: "Plataforma", value: "Por confirmar" },
      { label: "Horarios", value: "Por confirmar" },
      { label: "Contacto", value: "Por confirmar" },
    ],
  },
];
