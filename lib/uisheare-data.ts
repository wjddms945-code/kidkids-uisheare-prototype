export type Course = {
  id: string; tag: "인기" | "신규" | "추천" | "무료"; title: string; instructor: string;
  instructorId: string; price: number; rating: number; reviews: number; duration: number; sprite: number;
  age: string; topic: string; situation: string; material: boolean; description: string;
};

export const courses: Course[] = [
  { id:"c1", tag:"인기", title:"스스로 정리하는 교실 루틴", instructor:"김하늘 선생님", instructorId:"i1", price:32000, rating:4.9, reviews:128, duration:12, sprite:0, age:"유아", topic:"새학기 적응", situation:"교실운영", material:true, description:"아이들이 스스로 움직이는 교실을 만드는 환경 구성과 루틴 설계법" },
  { id:"c2", tag:"신규", title:"학부모 상담, 첫마디가 모든 것을 바꿔요", instructor:"정민주 선생님", instructorId:"i4", price:18000, rating:4.8, reviews:86, duration:18, sprite:1, age:"공통", topic:"학부모 상담", situation:"상담", material:true, description:"관계를 여는 첫 문장부터 어려운 대화를 마무리하는 방법까지" },
  { id:"c3", tag:"추천", title:"문제행동 원인 이해와 긍정적 지도 전략", instructor:"박지현 선생님", instructorId:"i2", price:22000, rating:4.9, reviews:153, duration:10, sprite:2, age:"유아", topic:"문제행동", situation:"생활지도", material:true, description:"행동 이면의 욕구를 읽고 교실에서 바로 적용하는 긍정적 지도" },
  { id:"c4", tag:"무료", title:"AI로 가정통신문 5분 만에 완성!", instructor:"이소인 선생님", instructorId:"i3", price:0, rating:4.7, reviews:74, duration:8, sprite:3, age:"공통", topic:"AI 업무활용", situation:"업무", material:false, description:"교사를 위한 생성형 AI 프롬프트와 안전한 문서 작성 실습" },
  { id:"c5", tag:"추천", title:"집중력을 높이는 놀이 활동 3가지", instructor:"최유진 선생님", instructorId:"i5", price:10000, rating:4.8, reviews:61, duration:8, sprite:4, age:"유아", topic:"놀이수업", situation:"수업", material:true, description:"준비물은 줄이고 참여도는 높이는 짧은 전환 놀이" },
  { id:"c6", tag:"무료", title:"등원 시간을 살리는 아침 루틴", instructor:"이현정 선생님", instructorId:"i6", price:0, rating:4.7, reviews:49, duration:6, sprite:5, age:"유아", topic:"새학기 적응", situation:"교실운영", material:false, description:"등원부터 자유놀이까지 매끄럽게 잇는 6분 핵심 루틴" },
  { id:"c7", tag:"신규", title:"5분 감정 체크로 교실 마음 열기", instructor:"김도연 선생님", instructorId:"i1", price:12000, rating:4.9, reviews:42, duration:7, sprite:6, age:"예비초등", topic:"문제행동", situation:"생활지도", material:true, description:"감정카드를 활용해 하루를 안정적으로 시작하는 방법" },
  { id:"c8", tag:"인기", title:"수업 마무리 정리 노하우", instructor:"박수진 선생님", instructorId:"i5", price:15000, rating:4.8, reviews:95, duration:9, sprite:7, age:"예비초등", topic:"수업설계", situation:"수업", material:true, description:"배운 것을 오래 기억하게 하는 회고와 정리 질문" },
];

export const shortCourses = courses.filter((course) => course.duration <= 10);

export const instructors = [
  { id:"i1", name:"김하늘 선생님", field:"놀이수업 · 생활습관", rating:4.9, career:"유아교육 12년", sprite:0 },
  { id:"i2", name:"박정우 선생님", field:"음악 · 표현활동", rating:4.8, career:"초등교육 15년", sprite:1 },
  { id:"i3", name:"이현주 선생님", field:"학부모 상담", rating:4.8, career:"상담교육 10년", sprite:2 },
  { id:"i4", name:"정은영 선생님", field:"문제행동 지도", rating:4.9, career:"유아교육 14년", sprite:3 },
  { id:"i5", name:"최희선 선생님", field:"미술 · 창의활동", rating:4.8, career:"초등교육 11년", sprite:4 },
  { id:"i6", name:"김나연 선생님", field:"자료 제작", rating:4.9, career:"교육콘텐츠 9년", sprite:5 },
];

export const topics = [
  { no:"01", title:"새학기 적응", copy:"처음 만나는 우리 반, 이렇게 시작해요.", icon:"🎒" },
  { no:"02", title:"문제행동", copy:"관찰부터 지도까지 실전 사례 모음", icon:"🧩" },
  { no:"03", title:"학부모 상담", copy:"신뢰를 만드는 소통의 기술", icon:"💬" },
  { no:"04", title:"AI 업무활용", copy:"교사 업무를 줄여주는 AI 도구 활용법", icon:"🤖" },
];

export const dashboardStats = [
  { label:"오늘 적립금", value:"+1,200P", icon:"₽" }, { label:"오늘 수강자", value:"8명", icon:"♙" },
  { label:"오늘 구매건수", value:"3건", icon:"▱" }, { label:"새 리뷰", value:"2건", icon:"★" },
];

export const courseStatuses = [["승인 대기",1],["판매중",8],["수정 요청",0],["반려",1],["판매중지",0]] as const;

export const filters = {
  age:["전체 연령","영아","유아","예비초등","방과후돌봄","공통"], topic:["전체 주제","새학기 적응","문제행동","학부모 상담","AI 업무활용","놀이수업","수업설계"],
  situation:["전체 상황","교실운영","상담","생활지도","수업","업무"], length:["전체 길이","10분 이하","11~20분","20분 초과"],
};

export const managementCourses = [
  { title:"스스로 정리하는 교실 루틴", status:"판매중", updated:"2026.09.14", sales:184, rating:4.9 },
  { title:"새학기 교실 환경 구성", status:"검수중", updated:"2026.09.12", sales:0, rating:0 },
  { title:"놀이 갈등 중재의 기술", status:"반려", updated:"2026.09.09", sales:0, rating:0 },
  { title:"교실 정리 체크리스트", status:"임시저장", updated:"2026.09.06", sales:0, rating:0 },
];
