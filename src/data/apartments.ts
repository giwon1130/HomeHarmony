import type { ApartmentCandidate } from "../types";

export const apartments: ApartmentCandidate[] = [
  {
    id: "mapo-river",
    name: "마포 리버 테라스",
    district: "서울 마포구",
    price억: 14.5,
    monthlyFee만: 23,
    size평: 33,
    commute: "도보권",
    latitude: 37.5481,
    longitude: 126.9328,
    transitScore: 94,
    convenienceScore: 88,
    educationScore: 72,
    environmentScore: 80,
    summary: "직주근접과 생활 편의성을 우선하는 2인 가구에 적합한 후보",
    strengths: ["지하철 도보 7분", "대형마트·병원 접근 우수", "야간 생활 인프라 풍부"],
    cautions: ["학군 점수는 평균 수준", "주말 상권 혼잡 가능성"],
    nearbyHighlights: [
      { label: "지하철역", distanceMinutes: 7 },
      { label: "대형마트", distanceMinutes: 8 },
      { label: "종합병원", distanceMinutes: 11 }
    ]
  },
  {
    id: "seongsu-forest",
    name: "성수 포레 하이츠",
    district: "서울 성동구",
    price억: 17.2,
    monthlyFee만: 29,
    size평: 34,
    commute: "도보권",
    latitude: 37.5447,
    longitude: 127.0557,
    transitScore: 91,
    convenienceScore: 92,
    educationScore: 78,
    environmentScore: 86,
    summary: "출퇴근과 생활권의 균형이 좋고 선호도 높은 입지 중심 후보",
    strengths: ["업무지구 접근 우수", "카페·문화시설 풍부", "한강·공원 접근성 좋음"],
    cautions: ["매매가 부담이 큰 편", "월 관리비가 비교적 높음"],
    nearbyHighlights: [
      { label: "지하철역", distanceMinutes: 6 },
      { label: "공원", distanceMinutes: 9 },
      { label: "상업시설", distanceMinutes: 5 }
    ]
  },
  {
    id: "gangdong-garden",
    name: "강동 가든 시티",
    district: "서울 강동구",
    price억: 11.8,
    monthlyFee만: 19,
    size평: 32,
    commute: "대중교통 45분",
    latitude: 37.5389,
    longitude: 127.1235,
    transitScore: 70,
    convenienceScore: 74,
    educationScore: 84,
    environmentScore: 89,
    summary: "예산과 주거 환경을 함께 고려하는 가족형 수요에 적합한 후보",
    strengths: ["공원·산책로 접근성 우수", "주거 밀도 대비 조용한 환경", "학군과 생활환경 균형"],
    cautions: ["도심 출퇴근 시간 부담", "상업시설 밀도는 낮은 편"],
    nearbyHighlights: [
      { label: "초등학교", distanceMinutes: 9 },
      { label: "근린공원", distanceMinutes: 4 },
      { label: "생활상권", distanceMinutes: 13 }
    ]
  },
  {
    id: "bundang-central",
    name: "분당 센트럴 파크뷰",
    district: "성남 분당구",
    price억: 15.4,
    monthlyFee만: 27,
    size평: 35,
    commute: "대중교통 30분",
    latitude: 37.3826,
    longitude: 127.1189,
    transitScore: 83,
    convenienceScore: 85,
    educationScore: 91,
    environmentScore: 90,
    summary: "학군과 주거 환경을 최우선으로 두는 가족형 선택지",
    strengths: ["학군 점수 우수", "공원과 병원 인접", "생활 인프라 안정적"],
    cautions: ["가격대가 다소 높음", "직주근접 우선 수요엔 덜 적합"],
    nearbyHighlights: [
      { label: "학원가", distanceMinutes: 8 },
      { label: "대형병원", distanceMinutes: 12 },
      { label: "도시공원", distanceMinutes: 6 }
    ]
  },
  {
    id: "gwanggyo-lake",
    name: "광교 레이크 스퀘어",
    district: "수원 영통구",
    price억: 10.6,
    monthlyFee만: 18,
    size평: 31,
    commute: "대중교통 45분",
    latitude: 37.2848,
    longitude: 127.0577,
    transitScore: 66,
    convenienceScore: 79,
    educationScore: 83,
    environmentScore: 94,
    summary: "예산 효율과 쾌적성을 함께 보려는 수요에 적합한 외곽형 후보",
    strengths: ["호수공원 접근 우수", "상대적으로 합리적인 매매가", "신축 생활권 장점"],
    cautions: ["서울 업무지구 통근 부담", "차량 의존도 일부 존재"],
    nearbyHighlights: [
      { label: "호수공원", distanceMinutes: 5 },
      { label: "대형마트", distanceMinutes: 10 },
      { label: "초등학교", distanceMinutes: 8 }
    ]
  },
  {
    id: "songdo-bay",
    name: "송도 베이 프라자",
    district: "인천 연수구",
    price억: 9.8,
    monthlyFee만: 17,
    size평: 34,
    commute: "대중교통 45분",
    latitude: 37.3904,
    longitude: 126.6506,
    transitScore: 61,
    convenienceScore: 81,
    educationScore: 80,
    environmentScore: 91,
    summary: "여유 있는 공간과 깔끔한 도시 인프라를 선호할 때 고려할 만한 후보",
    strengths: ["신도시 인프라 정돈", "평형 대비 가격 경쟁력", "생활 편의시설 분포 안정적"],
    cautions: ["통근 시간이 길 수 있음", "도심 접근성은 제한적"],
    nearbyHighlights: [
      { label: "센트럴파크", distanceMinutes: 7 },
      { label: "쇼핑몰", distanceMinutes: 9 },
      { label: "국제학교", distanceMinutes: 14 }
    ]
  }
];
