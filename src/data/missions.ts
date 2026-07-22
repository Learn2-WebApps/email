import type { Mission, Person } from "../types";

const sharedAddressBook: Person[] = [
  { id: "p01", name: "이수진", position: "팀장", team: "마케팅팀", isExternal: false },
  { id: "p02", name: "박준호", position: "과장", team: "마케팅팀", isExternal: false },
  { id: "p03", name: "이하늘", position: "대리", team: "마케팅팀", isExternal: false },
  { id: "p20", name: "김민준", position: "사원", team: "마케팅팀", isExternal: false },
  { id: "p16", name: "정성훈", position: "팀장", team: "상품개발팀", isExternal: false },
  { id: "p21", name: "강민혁", position: "과장", team: "상품개발팀", isExternal: false },
  { id: "p22", name: "이서준", position: "대리", team: "상품개발팀", isExternal: false },
  { id: "p04", name: "윤서아", position: "책임", team: "상품개발팀", isExternal: false },
  { id: "p05", name: "한지원", position: "사원", team: "상품개발팀", isExternal: false },
  { id: "p17", name: "박지연", position: "팀장", team: "영업팀", isExternal: false },
  { id: "p06", name: "최민기", position: "과장", team: "영업팀", isExternal: false },
  { id: "p07", name: "조성민", position: "차장", team: "영업팀", isExternal: false },
  { id: "p19", name: "신영우", position: "사원", team: "영업팀", isExternal: false },
  { id: "p18", name: "김재욱", position: "팀장", team: "디자인팀", isExternal: false },
  { id: "p08", name: "정유진", position: "대리", team: "디자인팀", isExternal: false },
  { id: "p09", name: "김도윤", position: "사원", team: "디자인팀", isExternal: false },
  { id: "p10", name: "송미라", position: "대리", team: "인사팀", isExternal: false },
  { id: "p11", name: "강태웅", position: "과장", team: "재무팀", isExternal: false },
  { id: "p12", name: "이상훈", position: "본부장", team: "마케팅본부", isExternal: false },
  { id: "p13", name: "강도윤", position: "차장", team: "", company: "△△광고", isExternal: true },
  { id: "p14", name: "정해린", position: "매니저", team: "", company: "CU MD", isExternal: true },
  { id: "p15", name: "임수정", position: "부장", team: "", company: "○○푸드텍", isExternal: true },
  { id: "p23", name: "김선영", position: "대리", team: "마케팅팀", isExternal: false },
  { id: "p24", name: "박지훈", position: "사원", team: "마케팅팀", isExternal: false },
  { id: "p25", name: "김런투", position: "대리", team: "영업부", company: "굿즈메이커", isExternal: true },
  { id: "p26", name: "최영수", position: "팀장", team: "영업부", company: "굿즈메이커", isExternal: true },
];

export const missions: Record<string, Mission> = {
  mission_tasting: {
    id: "mission_tasting",
    title: "한울 든든죽 사내 시식회 일정 안내",
    intro: `[한울푸드 마케팅팀 / 입사 2주차 수요일 오후 2:00]

{이름}님, 같은 팀 박준호 과장님이 다가오셔서 말씀하십니다.

"{이름}님, 다음 주 '한울 든든죽' 사내 시식회 일정이 확정됐어요. 타 부서(상품개발, 영업, 디자인팀) 담당 사원 분들께 안내 메일 좀 돌려주세요.
진행 상황은 저랑 팀장님도 알 수 있게 해줘요.
필요한 정보는 아래에 정리해 드릴게요."`,
    briefInfo: `- 일시: 2025년 5월 28일 (수) 오후 3시 ~ 5시
- 장소: 본사 5층 회의실 B
- 대상: 상품개발팀, 영업팀, 디자인팀 담당 사원
- 시식 제품: 한울 든든죽 3종 (소고기죽, 전복죽, 단호박죽)
- 참석 회신: 5월 26일 (월) 오후 6시까지
- 첨부물: 시식회 안내 포스터`,
    addressBook: sharedAddressBook,
    inbox: [],
    driveFiles: [
      { name: "시식회_안내포스터.png" },
      { name: "한울든든죽_제품정보_v2.xlsx" },
      { name: "회사소개서_2024.pdf" },
      { name: "든든죽_원가표_대외비.xlsx", isConfidential: true },
    ],
    modelAnswer: {
      to: ["p05", "p09", "p19"], // 각 팀 사원 3명
      cc: ["p01", "p02"],
      bcc: [],
      subject: "[마케팅팀] '한울 든든죽' 사내 시식회 일정 안내",
      attachments: ["시식회_안내포스터.png"],
      body: `안녕하십니까, 마케팅팀 {이름} 사원입니다.

각 부서 담당자분들께 다음 주 진행되는 '한울 든든죽' 사내 시식회 일정을 안내해 드립니다.

- 일시: 2025년 5월 28일 (수) 오후 3시 ~ 5시
- 장소: 본사 5층 회의실 B
- 시식 제품: 한울 든든죽 3종 (소고기죽, 전복죽, 단호박죽)

원활한 행사 준비를 위해 참석을 희망하시는 분들은 5월 26일(월) 오후 6시까지 회신 부탁드립니다.
자세한 내용은 첨부된 포스터를 참고해 주시기 바랍니다.

감사합니다.

{이름} 드림`,
    },
    objectiveRules: {
      to: {
        maxScore: 10,
        required: ["p05", "p09", "p19"],
        allowed: ["p04", "p06", "p07", "p08"],
        forbidden: ["p01", "p02", "p16", "p17", "p18"],
        forbiddenPenaltyPerItem: 3
      },
      cc: {
        maxScore: 10,
        required: ["p01", "p02"],
        allowed: ["p16", "p17", "p18"],
        forbidden: [],
        forbiddenPenaltyPerItem: 3
      },
      bcc: {
        maxScore: 5,
        required: [],
        allowed: [],
        forbidden: [],
        forbiddenPenaltyPerItem: 3
      },
      subject: {
        maxScore: 15,
        requiredKeywords: [
          { match: "마케팅팀", score: 5 },
          { match: "든든죽", score: 5 },
          { match: "시식회", score: 5 }
        ]
      },
      attachments: {
        maxScore: 10,
        required: [{ match: "포스터", score: 10 }],
        forbidden: [{ match: "대외비", penalty: 10, reason: "대외비 문서를 첨부했습니다." }]
      }
    },
    subjectiveRules: {
      requiredContentElements: ["일시", "장소", "시식 제품", "회신 기한", "회신처"],
      items: [
        { id: "bodyStructure", label: "본문 구조", maxScore: 15, description: "인사-전달사항-요청사항-맺음말 구조를 갖췄는가. (인사말, 본문, 서명 중 최소 한 곳에 발신자의 이름, 직급, 소속이 포함되었는지 확인)" },
        { id: "bodyContent", label: "본문 내용", maxScore: 35, description: "일시, 장소, 시식 제품 등 핵심 정보가 정확히 포함되었는지, 그리고 참석 회신 기한 및 회신 요청 문구가 명확히 작성되었는지 종합 평가." }
      ]
    },
  },
  mission_forward_summary: {
    id: "mission_forward_summary",
    title: "시식회 안내 메일 요약 및 전달",
    unlockCondition: "mission_tasting",
    intro: `[한울푸드 상품개발팀 / 금요일 오후 4:00]

마케팅팀에서 다음 주 진행되는 '한울 든든죽 사내 시식회' 안내 메일이 도착했습니다.
우리 팀원들의 참석 여부를 취합하여 마케팅팀에 회신해야 하는 상황입니다.`,
    briefInfo: `- 마케팅팀 안내 메일을 팀원들에게 공유하고 참석 여부를 파악하세요.`,
    addressBook: sharedAddressBook,
    inbox: [
      {
        id: "email_001",
        from: "p20",
        to: ["p05", "p09", "p19"],
        cc: ["p01", "p02"],
        subject: "[안내] '한울 든든죽' 사내 시식회 일정 안내",
        body: `안녕하십니까, 마케팅팀 김민준 사원입니다.

각 부서 실무자분들께 다음 주 진행되는 '한울 든든죽' 사내 시식회 일정을 안내해 드립니다.

- 일시: 2025년 5월 28일 (수) 오후 3시 ~ 5시
- 장소: 본사 5층 회의실 B
- 시식 제품: 한울 든든죽 3종 (소고기죽, 전복죽, 단호박죽)

원활한 행사 준비를 위해 참석을 희망하시는 분들은 5월 26일(월) 오후 6시까지 회신 부탁드립니다.
자세한 내용은 첨부된 포스터를 참고해 주시기 바랍니다.

감사합니다.

마케팅팀 김민준 드림`,
        attachments: ["시식회_안내포스터.png"],
        timestamp: "2025-05-23T15:30:00Z"
      }
    ],
    driveFiles: [
      { name: "시식회_안내포스터.png" },
      { name: "한울든든죽_제품정보_v2.xlsx" },
      { name: "회사소개서_2024.pdf" },
      { name: "든든죽_원가표_대외비.xlsx", isConfidential: true },
    ],
    modelAnswer: {
      to: ["p16", "p21", "p22", "p04"],
      cc: [],
      bcc: [],
      subject: "Fwd: [안내] '한울 든든죽' 사내 시식회 일정 안내",
      attachments: ["시식회_안내포스터.png"],
      body: `안녕하십니까, {이름} 사원입니다.

마케팅팀에서 주관하는 사내 시식회 일정을 요약하여 공유해 드립니다.

- 일시: 2025년 5월 28일 (수) 오후 3시 ~ 5시
- 장소: 본사 5층 회의실 B
- 시식 제품: 한울 든든죽 3종 (소고기죽, 전복죽, 단호박죽)

참석 여부를 제가 취합하여 마케팅팀에 전달할 예정이오니, 참석을 희망하시는 분들은 저에게 5월 26일(월) 오전 11시까지 회신해 주시기 바랍니다.
자세한 내용은 원본 메일 및 첨부된 포스터를 참고해 주십시오.

감사합니다.

{이름} 드림

----- Original Message -----
From: 김민준 사원 (마케팅팀)
To: 한지원 사원 (상품개발팀), 김도윤 사원 (디자인팀), 신영우 사원 (영업팀)
Cc: 이수진 팀장 (마케팅팀), 박준호 과장 (마케팅팀)
Sent: 2025-05-23 15:30:00
Subject: [안내] '한울 든든죽' 사내 시식회 일정 안내

안녕하십니까, 마케팅팀 김민준 사원입니다.
(이하 생략)`
    },
    objectiveRules: {
      actionRule: {
        recommendedAction: 'forward',
        forbiddenActions: ['reply', 'reply_all'],
        wrongActionPenalty: 3,
        actionFeedback: {
          reply: "이번 상황에서는 전달이 적절했습니다. 답장은 원본 발신자에게 회신하는 기능이며, 팀원들에게 공유하려면 처음부터 전달을 사용해야 수신자 구성·인용 형식이 자연스럽게 세팅됩니다. 답장 창에서 수정하면 실무적으로 시간이 더 걸리고 실수가 생기기 쉽습니다.",
          reply_all: "이번 상황에서는 전달이 적절했습니다. 전체답장은 원본 수신자 모두에게 회신하는 기능이며, 팀원들에게 공유하려면 처음부터 전달을 사용해야 수신자 구성·인용 형식이 자연스럽게 세팅됩니다. 답장 창에서 수정하면 실무적으로 시간이 더 걸리고 실수가 생기기 쉽습니다.",
          forward: "적절한 액션을 선택했습니다. 여러 명에게 정보를 공유할 때는 전달이 표준 방식입니다."
        }
      },
      to: {
        maxScore: 10,
        required: ["p16", "p21", "p22", "p04"],
        allowed: [],
        forbidden: ["p20", "p01", "p02", "p09", "p19"],
        forbiddenPenaltyPerItem: 3
      },
      cc: {
        maxScore: 10,
        required: [],
        allowed: [],
        forbidden: [],
        forbiddenPenaltyPerItem: 3
      },
      bcc: {
        maxScore: 5,
        required: [],
        allowed: [],
        forbidden: [],
        forbiddenPenaltyPerItem: 3
      },
      subject: {
        maxScore: 15,
        requiredKeywords: [
          { match: "시식회", score: 15 }
        ]
      },
      attachments: {
        maxScore: 10,
        required: [{ match: "포스터", score: 10 }],
        forbidden: []
      }
    },
    subjectiveRules: {
      requiredContentElements: ["일시", "장소", "시식 제품", "참석 취합(학습자 본인에게 회신)"],
      items: [
        { id: "bodyStructure", label: "본문 구조", maxScore: 15, description: "인사말, 맺음말, 서명이 존재하는지 평가. (인사말, 본문, 서명 중 최소 한 곳에 발신자의 이름, 직급, 소속이 포함되었는지 확인)" },
        { id: "bodyContent", label: "본문 내용", maxScore: 35, description: "원본 메일을 그대로 복사하지 않고 팀원들의 눈높이에 맞춰 핵심 정보(일시/장소/시식제품)를 요약했는지, 그리고 참석 여부를 명확한 기한과 함께 '본인(학습자)'에게 회신해 달라고 요청했는지 종합적으로 평가. 원본 메일 인용 블록이 없는 경우도 여기서 감안하여 평가." }
      ]
    }
  },
  mission_cc_reply: {
    id: "mission_cc_reply",
    title: "거래처 견적/시안 확정 회신",
    unlockCondition: "mission_forward_summary",
    intro: `[한울푸드 마케팅팀 / 금요일 오후 2:00]

선배(김선영 대리)가 휴가를 가면서 전달한 판촉물 텀블러 발주 건과 로고 시안 협의 내역이 수신함에 들어와 있습니다.
팀 회의록 메일을 참고하여 최종 결정된 납기일과 로고 시안 수정본을 확인하고, 거래처(굿즈메이커 김런투 대리)에 확정 회신을 보내주세요.`,
    briefInfo: `- 선배가 진행하던 판촉물 발주 건을 이어받게 되었습니다. 거래처 회신이 필요한 상황입니다.`,
    addressBook: sharedAddressBook,
    inbox: [
      {
        id: "email_004",
        from: "p24",
        to: ["p01", "p02", "p03", "p20", "p23", "p00"],
        cc: [],
        subject: "[회의록] 판촉물 발주 및 차주 프로모션 협의 결과 공유",
        body: `마케팅팀 여러분, 안녕하십니까. 박지훈 사원입니다.
어제 오전에 진행된 팀 내부 회의 결과 및 판촉물 발주 관련 협의 내용을 공유드립니다.

1. 회의 개요
- 일시: 2025년 5월 22일(목) 10:00 ~ 11:00
- 장소: 마케팅팀 회의실
- 참석자: 이수진 팀장, 박준호 과장, 이하늘 대리, 김선영 대리, 김민준 사원, 박지훈 사원, {이름} 사원

2. 안건별 논의 및 결정 사항

[안건 1] 신제품 런칭 캠페인 방향성
- 논의 내용: 온·오프라인 믹스 마케팅 전략 검토
- 결정 사항: 주요 타겟층 대상 SNS 체험단 모집 및 오프라인 팝업 운영안 최종 승인

[안건 2] 판촉물 텀블러 발주 건 확정
- 논의 내용: 거래처(굿즈메이커) 견적 재검토 및 납기일/시안 최종 확정건
- 결정 사항:
  1) 수량: 800개 (재견적 단가 적용)
  2) 납기일: 2025년 6월 20일(금)까지 본사 입고로 최종 확정
  3) 로고 시안: 5월 18일 자 수정본(로고시안_20250518.png - 시그니처 브라운 색상, 10% 확대 반영본)으로 최종 확정하여 진행

[안건 3] 차주 프로모션 예산안 검토
- 결정 사항: 각 담당자별 세부 집행 예산안 작성 후 금요일 17:00까지 팀장님께 제출

3. 향후 조치 사항
- 판촉물 담당(김선영 대리 / 인수자): 거래처(굿즈메이커 김런투 대리)에 확정 납기일(6/20) 및 로고 시안 수정본(5/18자) 송부 회신 진행

업무에 참고해 주시기 바랍니다.
감사합니다.

마케팅팀 박지훈 드림`,
        attachments: [],
        timestamp: "2025-05-23T14:00:00Z"
      },
      {
        id: "email_003",
        from: "p23",
        to: ["p00"],
        cc: [],
        subject: "Fwd: 텀블러 로고 시안 협의",
        body: `{이름} 사원님, 안녕하세요. 김선영입니다.

로고 시안 협의 히스토리도 함께 전달해 드립니다.
거래처와 시안 조정했던 내역들이니, 회의 결과 참고하셔서 최종 시안 확정 회신 진행 부탁드립니다.

감사합니다.

마케팅팀 김선영 드림

----- 원본 메일 -----
From: 김런투 대리 (굿즈메이커)
To: 김선영 대리 (마케팅팀)
Cc: 이수진 팀장 (마케팅팀), 최영수 팀장 (굿즈메이커)
Sent: 2025-05-18 15:30:00
Subject: RE: 시안 수정본 회신
첨부: 로고시안_20250518.png

안녕하십니까, 김선영 대리님.
굿즈메이커 김런투 대리입니다.

요청해 주신 로고 색상(시그니처 브라운) 변경 및 크기 10% 확대 수정을 반영한 시안 수정본(5/18자)을 첨부하여 회신드립니다.
확인 후 최종 진행 여부를 알려주시면 감사하겠습니다.

감사합니다.

굿즈메이커 김런투 드림

----- 원본 메일 -----
From: 김선영 대리 (마케팅팀)
To: 김런투 대리 (굿즈메이커)
Cc: 이수진 팀장 (마케팅팀), 최영수 팀장 (굿즈메이커)
Sent: 2025-05-18 10:00:00
Subject: RE: 로고 시안 수정 요청

김런투 대리님, 안녕하세요.
한울푸드 마케팅팀 김선영입니다.

보내주신 시안 초안 확인했습니다.
내부 검토 결과, 로고 색상을 당사 시그니처 브라운 컬러로 변경하고 로고 크기를 기존 대비 10% 확대하여 수정 요청드립니다.
조정된 시안으로 다시 한번 송부 부탁드립니다.

감사합니다.

마케팅팀 김선영 드림

----- 원본 메일 -----
From: 김런투 대리 (굿즈메이커)
To: 김선영 대리 (마케팅팀)
Cc: 이수진 팀장 (마케팅팀), 최영수 팀장 (굿즈메이커)
Sent: 2025-05-08 17:00:00
Subject: RE: 텀블러 로고 시안 초안 회신
첨부: 로고시안_20250508.png

안녕하십니까, 김선영 대리님.
굿즈메이커 영업부 김런투 대리입니다.

요청해 주신 텀블러 로고 시안 초안을 작성하여 전달드립니다.
인쇄 위치 및 로고 크기 검토해 보시고 수정이 필요한 부분이 있다면 편하게 의견 주세요.

감사합니다.

굿즈메이커 김런투 드림

----- 원본 메일 -----
From: 김선영 대리 (마케팅팀)
To: 김런투 대리 (굿즈메이커)
Cc: 이수진 팀장 (마케팅팀), 최영수 팀장 (굿즈메이커)
Sent: 2025-05-08 13:00:00
Subject: 텀블러 로고 시안 초안 요청

굿즈메이커 김런투 대리님, 안녕하세요.
한울푸드 마케팅팀 김선영 대리입니다.

텀블러에 인쇄할 당사 브랜드 로고 시안 제작을 요청드립니다.
당사 로고 AI 파일은 이전 메일로 전달드린 바 있으며, 텀블러 전면 중앙 배치를 기본으로 작성 부탁드립니다.

시안 초안 나오는 대로 회신 부탁드리겠습니다.
감사합니다.

마케팅팀 김선영 드림`,
        attachments: ["로고시안_20250508.png", "로고시안_20250518.png"],
        timestamp: "2025-05-21T09:05:00Z"
      },
      {
        id: "email_002",
        from: "p23",
        to: ["p00"],
        cc: [],
        subject: "Fwd: 텀블러 발주 견적 협의",
        body: `{이름} 사원님, 안녕하세요. 김선영입니다.

갑작스럽게 휴가를 가게 되어 진행 중이던 판촉물 텀블러 발주 건 마무리를 부탁드립니다.
견적 협의와 로고 시안 협의 두 트랙 모두 최종 확정만 남은 상태입니다.

거래처 굿즈메이커 김런투 대리님께 최종 납기일과 로고 시안 확정본을 회신해 주시면 됩니다.
세부 사항은 회의에서 정해지는 대로 전달해 주시면 됩니다.

감사합니다.

마케팅팀 김선영 드림

----- 원본 메일 -----
From: 김런투 대리 (굿즈메이커)
To: 김선영 대리 (마케팅팀)
Cc: 이수진 팀장 (마케팅팀), 최영수 팀장 (굿즈메이커)
Sent: 2025-05-20 14:30:00
Subject: RE: 텀블러 수량 800개 변경 재견적
첨부: 견적서_20250520.pdf

안녕하십니까, 김선영 대리님.
굿즈메이커 김런투 대리입니다.

요청해 주신 텀블러 800개 기준 재견적서를 첨부와 같이 송부해 드립니다.
수량 증가에 따른 할인가를 적용해 드렸으니 검토 부탁드립니다.

아울러 생산 일정 수립을 위해 최종 납기일과 로고 시안을 확정하여 회신해 주시면 감사하겠습니다.

감사합니다.

굿즈메이커 김런투 드림

----- 원본 메일 -----
From: 김선영 대리 (마케팅팀)
To: 김런투 대리 (굿즈메이커)
Cc: 이수진 팀장 (마케팅팀), 최영수 팀장 (굿즈메이커)
Sent: 2025-05-20 11:00:00
Subject: RE: 텀블러 수량 변경 재견적 요청

김런투 대리님, 안녕하세요.
한울푸드 마케팅팀 김선영입니다.

보내주신 500개 기준 견적서 잘 검토하였습니다.
내부 회의 결과 판촉물 수량을 800개로 상향 조정하기로 결정되었습니다.
수량 변경에 따른 단가 조정 및 800개 기준 재견적서 송부를 부탁드립니다.

감사합니다.

마케팅팀 김선영 드림

----- 원본 메일 -----
From: 김런투 대리 (굿즈메이커)
To: 김선영 대리 (마케팅팀)
Cc: 이수진 팀장 (마케팅팀), 최영수 팀장 (굿즈메이커)
Sent: 2025-05-10 16:00:00
Subject: RE: 텀블러 500개 견적 요청
첨부: 견적서_20250510.pdf

안녕하십니까, 김선영 대리님.
굿즈메이커 영업부 김런투 대리입니다.

요청하신 텀블러 500개 기준 견적서를 작성하여 첨부와 같이 송부해 드립니다.
단가 및 제작 일정 확인해 보시고, 추가 수정사항이나 문의 있으시면 언제든 말씀해 주세요.

감사합니다.

굿즈메이커 김런투 드림

----- 원본 메일 -----
From: 김선영 대리 (마케팅팀)
To: 김런투 대리 (굿즈메이커)
Cc: 이수진 팀장 (마케팅팀), 최영수 팀장 (굿즈메이커)
Sent: 2025-05-10 10:00:00
Subject: 텀블러 500개 견적 요청

굿즈메이커 김런투 대리님, 안녕하세요.
한울푸드 마케팅팀 김선영 대리입니다.

사내 판촉물 제작 관련하여 문의드립니다.
500ml 스테인리스 텀블러 500개 기준으로 견적 요청드리며, 실크스크린 로고 인쇄 비용을 포함하여 회신 부탁드립니다.

검토 후 회신 기다리겠습니다.
감사합니다.

마케팅팀 김선영 드림`,
        attachments: ["견적서_20250510.pdf", "견적서_20250520.pdf"],
        timestamp: "2025-05-21T09:00:00Z"
      }
    ],
    driveFiles: [
      { name: "견적서_20250510.pdf" },
      { name: "견적서_20250520.pdf" },
      { name: "견적서_20250515.pdf" },
      { name: "로고시안_20250508.png" },
      { name: "로고시안_20250518.png" }
    ],
    modelAnswer: {
      to: ["p25"],
      cc: ["p01", "p26", "p23"],
      bcc: [],
      subject: "텀블러 발주 건 납기일 및 로고 시안 확정 안내",
      attachments: ["로고시안_20250518.png"],
      body: `안녕하십니까, 김런투 대리님.
마케팅팀 {이름} 사원입니다.

김선영 대리님의 휴가로 인하여 본 건을 제가 이어서 진행하게 되었습니다.

요청하신 텀블러 발주 관련 최종 확정 사항을 아래와 같이 회신드립니다.

- 납기일: 2025년 6월 20일(금)
- 로고 시안: 첨부해 드린 최근 수정본(로고시안_20250518.png)으로 최종 진행

진행 중 문의사항이 있으시면 언제든지 편하게 연락 주시기 바랍니다.
감사합니다.

{이름} 드림`
    },
    objectiveRules: {
      actionRule: {
        recommendedAction: 'compose',
        allowedActions: ['reply', 'reply_all'],
        forbiddenActions: ['forward'],
        wrongActionPenalty: 3,
        actionFeedback: {
          compose: "새 메일 쓰기로 깔끔하게 발송했습니다.",
          reply: "선배에게 전달받은 메일에서 답장을 누르면 자동으로 전달해준 사람에게 회신이 세팅됩니다. 두 트랙을 합쳐 거래처에 회신하는 상황에서는 새 메일 쓰기가 더 자연스럽습니다.",
          reply_all: "선배에게 전달받은 메일에서 답장을 누르면 자동으로 전달해준 사람에게 회신이 세팅됩니다. 두 트랙을 합쳐 거래처에 회신하는 상황에서는 새 메일 쓰기가 더 자연스럽습니다.",
          forward: "이번 상황은 거래처에 회신하는 것이 목적입니다. 전달은 제3자에게 정보를 넘길 때 사용하는 기능이므로 적절하지 않습니다."
        }
      },
      to: {
        maxScore: 10,
        required: ["p25"],
        allowed: [],
        forbidden: ["p23", "p01", "p26"],
        forbiddenPenaltyPerItem: 3
      },
      cc: {
        maxScore: 10,
        required: ["p01", "p26", "p23"],
        allowed: [],
        forbidden: ["p25"],
        forbiddenPenaltyPerItem: 3
      },
      bcc: {
        maxScore: 5,
        required: [],
        allowed: [],
        forbidden: [],
        forbiddenPenaltyPerItem: 3
      },
      subject: {
        maxScore: 15,
        requiredKeywords: [
          { match: "텀블러", score: 15 }
        ]
      },
      attachments: {
        maxScore: 10,
        required: [{ match: "로고시안_20250518", score: 10 }],
        forbidden: [
          { match: "견적서_20250510", penalty: 3, reason: "구버전 견적서를 첨부했습니다." },
          { match: "견적서_20250515", penalty: 3, reason: "잘못된 견적서를 첨부했습니다." },
          { match: "견적서_20250520", penalty: 3, reason: "불필요한 견적서를 첨부했습니다." },
          { match: "로고시안_20250508", penalty: 3, reason: "구버전 로고 시안을 첨부했습니다." }
        ],
        forbiddenPenaltyPerItem: 3
      }
    },
    subjectiveRules: {
      requiredContentElements: ["자기소개 (선배 대신 이어받음)", "납기일 확정 (6월 20일)", "로고 시안 확정 (최근 수정본)"],
      items: [
        { id: "bodyStructure", label: "본문 구조", maxScore: 15, description: "인사말, 맺음말, 서명이 올바르게 포함되었는지 평가. (인사말, 본문, 서명 중 최소 한 곳에 발신자의 이름, 직급, 소속이 포함되었는지 확인)" },
        { id: "bodyContent", label: "본문 내용", maxScore: 35, description: "선배 대신 업무를 이어서 진행하게 되었음을 밝히는 자기소개, 최종 납기일(2025년 6월 20일), 그리고 로고 시안 확정 내용(최근 5/18 수정본)이 모두 명확히 포함되었는지 종합 평가." }
      ]
    }
  }
};
