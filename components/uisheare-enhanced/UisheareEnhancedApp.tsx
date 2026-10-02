"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Award, BarChart3, Bell, BookOpen, Bookmark, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, CirclePlay, Clock3, Coins, FileText,
  Heart, Image as ImageIcon, Megaphone, Menu, Paperclip, Play, Presentation, Search, ShoppingCart, Star, Timer, Upload, UserRound, Wallet, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedDashboardCanvas } from "@/components/uisheare-enhanced/EnhancedDashboardCanvas";
import { courseStatuses, courses, dashboardStats, filters, instructors, managementCourses, shortCourses, topics, type Course } from "@/lib/uisheare-data";
import { achievements, courseAchievementBadges, dashboardTrends, instructorLevel, instructorLevels, missionBenefits, monthlyMissions } from "@/lib/uisheare-preview-data";

type UserRole = "instructor" | "user";
type ViewName = "main" | "course" | "instructor" | "register" | "manage" | "profile";
const nav = ["필수의무교육", "자율직무연수", "5분 클래스", "쌤크", "공지사항", "FAQ", "MY 직무연수"];

const formatPrice = (price: number) => price === 0 ? "0P" : `${price.toLocaleString("ko-KR")}P`;
const spritePosition = (index: number, columns: number, rows = 1) => {
  const column = columns === 1 ? 0 : (index % columns) * 100 / (columns - 1);
  const row = Math.floor(index / columns);
  const rowPosition = rows === 1 ? 50 : rows === 2 ? (row === 0 ? 14 : 86) : row * 100 / (rows - 1);
  return { backgroundPosition: `${column}% ${rowPosition}%` };
};

const kidkidsRelatedTypes = ["활동지", "PPT", "학습지", "그림자료", "음원자료"];
const buildRelatedKidkidsResources = (course: Course) => kidkidsRelatedTypes.map((type, index) => ({
  id: `${course.id}-kk-${index}`,
  title: `${course.topic} ${type} 모음`,
  type,
  sprite: (course.sprite + index + 1) % 8,
}));

const previewPath = "/uisheare-enhanced";

type InstructorProfile = { name: string; career: string; field: string; intro: string };
const defaultInstructorProfile: InstructorProfile = {
  name: "김하늘 선생님",
  career: "유아교육 12년",
  field: "놀이수업, 생활습관, 교실운영",
  intro: "교실에서 직접 실천하고 검증한 방법을 선생님들과 나눕니다.",
};

type VibeMockType = "emotion" | "consult" | "attendance" | "play" | "material" | "alarm" | "timer" | "progress";

type VibeCodingStory = {
  id: number; instructorName: string; instructorRole: string; profileSprite: number;
  serviceName: string; title: string; mockType: VibeMockType; tags: string[]; reason: string; usage: string; courseId: string;
};

const vibeCodingStories: VibeCodingStory[] = [
  { id: 1, courseId: "c1", instructorName: "김도연 선생님", instructorRole: "유아교사", profileSprite: 0, serviceName: "우리 반 감정체크 도구", title: "우리 반 감정체크 도구를 직접 만들었어요", mockType: "emotion", tags: ["바이브코딩", "학급운영", "Gemini", "감정케어"], reason: "매일 아이들의 감정을 파악하고 기록하는 데 시간이 오래 걸려서, 직접 체크하고 바로 기록되는 도구가 필요했어요.", usage: "등원 시간마다 아이들이 스스로 오늘의 기분을 선택하고, 교사는 한눈에 반 전체 감정 흐름을 확인해요." },
  { id: 2, courseId: "c2", instructorName: "박서연 선생님", instructorRole: "보육교사", profileSprite: 1, serviceName: "학부모 상담 기록 도구", title: "AI로 학부모 상담 기록 도구를 만들어봤어요", mockType: "consult", tags: ["바이브코딩", "상담기록", "ChatGPT", "학부모소통"], reason: "상담 후 메모가 흩어져서 다음 상담 때 이전 내용을 찾기 어려웠어요.", usage: "상담 중 키워드만 입력하면 자동으로 요약 정리되고, 학기별로 이력을 모아볼 수 있어요." },
  { id: 3, courseId: "c3", instructorName: "이준호 선생님", instructorRole: "유아교사", profileSprite: 2, serviceName: "출석 체크 서비스", title: "출석 체크 서비스를 직접 만들어 운영하고 있어요", mockType: "attendance", tags: ["바이브코딩", "학급운영", "Claude", "자동화"], reason: "매일 반복되는 출석 체크와 지각·결석 안내 문자를 자동화하고 싶었어요.", usage: "학생이 QR을 찍으면 출석이 기록되고, 미출석 시 보호자에게 자동 안내가 발송돼요." },
  { id: 4, courseId: "c4", instructorName: "최민아 선생님", instructorRole: "유아교사", profileSprite: 3, serviceName: "놀이 관찰 자동 정리 도구", title: "놀이 관찰 기록을 자동으로 정리해주는 도구를 만들었어요", mockType: "play", tags: ["바이브코딩", "놀이관찰", "Gemini", "발달기록"], reason: "놀이 관찰 기록을 매번 수기로 정리하느라 퇴근이 늦어지는 게 고민이었어요.", usage: "현장에서 짧게 메모만 남기면 AI가 발달영역별로 자동 분류하고 문장을 다듬어줘요." },
  { id: 5, courseId: "c5", instructorName: "정하윤 선생님", instructorRole: "보육교사", profileSprite: 4, serviceName: "수업자료 생성 도구", title: "수업자료 생성 도구를 만들어 활용하고 있어요", mockType: "material", tags: ["바이브코딩", "수업자료", "ChatGPT", "학습지제작"], reason: "매 학기 비슷한 형식의 학습지를 새로 만드는 데 시간이 너무 많이 들었어요.", usage: "단원과 난이도만 입력하면 문항과 학습지 초안이 생성되고, 필요한 부분만 수정해서 사용해요." },
  { id: 6, courseId: "c6", instructorName: "한소율 선생님", instructorRole: "유아교사", profileSprite: 5, serviceName: "알림장 자동 작성 도구", title: "매일 쓰던 알림장을 자동으로 작성하는 도구를 만들었어요", mockType: "alarm", tags: ["바이브코딩", "학급운영", "Claude", "알림장"], reason: "비슷한 내용의 알림장을 매일 새로 쓰는 게 반복적이고 시간이 아까웠어요.", usage: "오늘의 활동 키워드만 입력하면 알림장 문구가 자동 완성되고, 바로 학부모 앱으로 전송해요." },
  { id: 7, courseId: "c7", instructorName: "오지훈 선생님", instructorRole: "보육교사", profileSprite: 0, serviceName: "모둠 활동 타이머", title: "모둠 활동용 타이머 서비스를 직접 만들었어요", mockType: "timer", tags: ["바이브코딩", "수업운영", "Gemini", "모둠활동"], reason: "수업마다 여러 모둠의 활동 시간을 따로 관리하기가 번거로웠어요.", usage: "모둠별 타이머를 화면에 동시에 띄워두고, 시간이 끝나면 자동으로 알림을 줘요." },
  { id: 8, courseId: "c8", instructorName: "장예은 선생님", instructorRole: "유아교사", profileSprite: 1, serviceName: "개별화 학습 진도 체크 도구", title: "개별화 학습 진도를 한눈에 보는 도구를 만들었어요", mockType: "progress", tags: ["바이브코딩", "개별화교육", "ChatGPT", "학습관리"], reason: "학생마다 다른 학습 목표와 진도를 따로 정리하다 보니 관리가 복잡했어요.", usage: "학생별 목표와 진도를 입력해두면 주간 단위로 성취 현황이 자동 정리돼요." },
];


type KidkidsResource = { id: string; title: string; type: string; age: string; sprite: number };

const kidkidsResourceCatalog: Record<string, Omit<KidkidsResource, "id">> = {
  "12345": { title: "우리 반 하루 루틴 체크리스트", type: "활동지", age: "유아", sprite: 0 },
  "20391": { title: "감정 카드 놀이 활동지", type: "활동지", age: "유아", sprite: 2 },
  "88820": { title: "등원맞이 인사 노래 자료", type: "음원자료", age: "영아", sprite: 4 },
};

const exampleSettlement = {
  normal: { instructor: 50, platform: 50 },
  kidkidsLinked: { instructor: 70, platform: 30 },
  isMock: true,
};

export function UisheareEnhancedApp() {
  const [view, setView] = useState<ViewName>("main");
  const [selectedId, setSelectedId] = useState("c1");
  const [activeNav, setActiveNav] = useState("쌤크");
  const [userRole, setUserRole] = useState<UserRole>("instructor");
  const [modalOpen, setModalOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [draftTerm, setDraftTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [age, setAge] = useState("전체 연령");
  const [topic, setTopic] = useState("전체 주제");
  const [situation, setSituation] = useState("전체 상황");
  const [length, setLength] = useState("전체 길이");
  const [freeOnly, setFreeOnly] = useState(false);
  const [materialOnly, setMaterialOnly] = useState(false);
  const [notice, setNotice] = useState("");
  const [instructorProfile, setInstructorProfile] = useState<InstructorProfile>(defaultInstructorProfile);

  const readLocation = () => {
    const params = new URLSearchParams(window.location.search);
    const nextView = params.get("view") as ViewName | null;
    setView(nextView && ["course","instructor","register","manage","profile"].includes(nextView) ? nextView : "main");
    setSelectedId(params.get("id") || "c1");
  };

  useEffect(() => {
    readLocation();
    window.addEventListener("popstate", readLocation);
    return () => window.removeEventListener("popstate", readLocation);
  }, []);

  useEffect(() => {
    const modelContext = (document as unknown as { modelContext?: { registerTool?: (tool: unknown, options?: unknown) => void | Promise<void> } }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: unknown) => Promise.resolve(modelContext.registerTool?.(tool, { signal: lifecycle.signal })).catch(() => undefined);
    void register({ name:"search_courses", title:"강의 검색", description:"쌤크 고도화 Preview에서 강의를 필터링합니다.", inputSchema:{ type:"object", properties:{ query:{type:"string"}, topic:{type:"string"} }, required:["query"], additionalProperties:false }, annotations:{readOnlyHint:false,untrustedContentHint:false}, execute:(input:unknown) => { const data=input as {query?:unknown;topic?:unknown}; if(typeof data.query!=="string") throw new Error("query must be a string"); setDraftTerm(data.query); setSearchTerm(data.query); if(typeof data.topic==="string" && filters.topic.includes(data.topic)) setTopic(data.topic); setView("main"); window.history.pushState({},"",previewPath); return {query:data.query,topic:typeof data.topic==="string"?data.topic:"전체 주제"}; } });
    void register({ name:"set_prototype_user_state", title:"사용자 상태 전환", description:"프로토타입의 내 쌤크 영역을 강사 또는 일반 사용자 상태로 전환합니다.", inputSchema:{ type:"object", properties:{ role:{type:"string",enum:["instructor","user"]} }, required:["role"], additionalProperties:false }, annotations:{readOnlyHint:false,untrustedContentHint:false}, execute:(input:unknown) => { const role=(input as {role?:unknown}).role; if(role!=="instructor"&&role!=="user") throw new Error("invalid role"); setUserRole(role); return {role}; } });
    void register({ name:"open_course_detail", title:"강의 상세 열기", description:"강의 ID로 쌤크 강의 상세 화면을 엽니다.", inputSchema:{ type:"object", properties:{ courseId:{type:"string"} }, required:["courseId"], additionalProperties:false }, annotations:{readOnlyHint:false,untrustedContentHint:false}, execute:(input:unknown) => { const courseId=(input as {courseId?:unknown}).courseId; if(typeof courseId!=="string"||!courses.some(course=>course.id===courseId)) throw new Error("unknown courseId"); window.history.pushState({},"",`${previewPath}?view=course&id=${courseId}`); setSelectedId(courseId); setView("course"); return {courseId,view:"course"}; } });
    return () => lifecycle.abort();
  }, []);

  const navigate = (next: ViewName, id?: string, extra?: string) => {
    const query = next === "main" ? previewPath : `${previewPath}?view=${next}${id ? `&id=${id}` : ""}${extra ? `&${extra}` : ""}`;
    window.history.pushState({}, "", query);
    setView(next);
    if (id) setSelectedId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const registerCourse = () => {
    if (userRole === "instructor") navigate("register");
    else { setApplied(false); setModalOpen(true); }
  };

  const runSearch = () => {
    setSearchTerm(draftTerm.trim());
    setView("main");
    window.setTimeout(() => document.getElementById("course-results")?.scrollIntoView({ behavior:"smooth", block:"start" }), 30);
  };

  const filteredCourses = useMemo(() => courses.filter((course) => {
    const term = searchTerm.toLowerCase();
    const matchesTerm = !term || `${course.title} ${course.instructor} ${course.description} ${course.topic}`.toLowerCase().includes(term);
    const matchesLength = length === "전체 길이" || (length === "10분 이하" ? course.duration <= 10 : length === "11~20분" ? course.duration >= 11 && course.duration <= 20 : course.duration > 20);
    return matchesTerm && (age === "전체 연령" || course.age === age || course.age === "공통") && (topic === "전체 주제" || course.topic === topic) && (situation === "전체 상황" || course.situation === situation) && matchesLength && (!freeOnly || course.price === 0) && (!materialOnly || course.material);
  }), [age, freeOnly, length, materialOnly, searchTerm, situation, topic]);

  const toggleBookmark = (id: string) => setBookmarks((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const chooseTopic = (title: string) => { setTopic(title); setView("main"); window.history.pushState({},"",`${previewPath}?topic=${encodeURIComponent(title)}`); window.setTimeout(() => document.getElementById("course-results")?.scrollIntoView({behavior:"smooth"}), 40); };

  return (
    <main className="preview-mode">
      <Header activeNav={activeNav} setActiveNav={setActiveNav} value={draftTerm} onChange={setDraftTerm} onSearch={runSearch} navigate={navigate} />
      <div className="role-switch" aria-label="개발 확인용 사용자 상태"><span>미리보기</span><button className={userRole === "instructor" ? "selected" : ""} onClick={() => setUserRole("instructor")}>강사</button><button className={userRole === "user" ? "selected" : ""} onClick={() => setUserRole("user")}>일반 사용자</button></div>
      {view === "main" && <MainView userRole={userRole} navigate={navigate} registerCourse={registerCourse} draftTerm={draftTerm} setDraftTerm={setDraftTerm} runSearch={runSearch} age={age} setAge={setAge} topic={topic} setTopic={setTopic} situation={situation} setSituation={setSituation} length={length} setLength={setLength} freeOnly={freeOnly} setFreeOnly={setFreeOnly} materialOnly={materialOnly} setMaterialOnly={setMaterialOnly} filteredCourses={filteredCourses} bookmarks={bookmarks} toggleBookmark={toggleBookmark} chooseTopic={chooseTopic} instructorProfile={instructorProfile} />}
      {view === "course" && <CourseDetail course={courses.find((course) => course.id === selectedId) || courses[0]} navigate={navigate} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />}
      {view === "instructor" && <InstructorChannel instructorId={selectedId} navigate={navigate} userRole={userRole} instructorProfile={instructorProfile} />}
      {view === "register" && <RegistrationScreen navigate={navigate} setNotice={setNotice} />}
      {view === "manage" && <ManageScreen navigate={navigate} />}
      {view === "profile" && <ProfileScreen navigate={navigate} setNotice={setNotice} instructorProfile={instructorProfile} onSave={setInstructorProfile} />}
      <Footer navigate={navigate} />
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")}><X size={16} /></button></div>}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="teacher-dialog">
          {!applied ? <><DialogHeader><div className="dialog-icon">✦</div><DialogTitle>쌤크 강사로 참여해보세요</DialogTitle><DialogDescription>강의 등록은 강사 승인 후 이용할 수 있습니다.<br />신청 후 승인되면 직접 강의를 등록할 수 있어요.</DialogDescription></DialogHeader><div className="dialog-benefits"><span><Check size={16} /> 선생님의 노하우를 강의로 등록</span><span><Check size={16} /> 판매 현황과 리뷰를 한눈에 관리</span></div><DialogFooter><DialogClose asChild><Button variant="outline">다음에</Button></DialogClose><Button onClick={() => setApplied(true)}>강사 신청하기</Button></DialogFooter></> : <><DialogHeader><div className="dialog-icon success">✓</div><DialogTitle>강사 신청 안내를 확인했어요</DialogTitle><DialogDescription>프로토타입에서는 신청 완료 상태까지 확인할 수 있습니다. 실제 서비스에서는 회원 정보 확인 단계가 이어집니다.</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button>확인</Button></DialogClose></DialogFooter></>}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Header({ activeNav, setActiveNav, value, onChange, onSearch, navigate }:{ activeNav:string; setActiveNav:(v:string)=>void; value:string; onChange:(v:string)=>void; onSearch:()=>void; navigate:(v:ViewName,id?:string)=>void }) {
  return <header className="site-header"><div className="topbar shell"><button className="brand" onClick={() => navigate("main")} aria-label="직무연수 홈"><b>직무연수</b></button><label className="header-search"><input value={value} onChange={(event)=>onChange(event.target.value)} onKeyDown={(event)=>event.key==="Enter"&&onSearch()} placeholder="원하는 강의를 검색해보세요." aria-label="강의 검색어" /><button aria-label="검색" onClick={onSearch}><Search size={20} /></button></label><div className="header-actions"><button><ShoppingCart size={20} /><span>장바구니</span></button><button><Bell size={20} /><span>알림</span></button><button><UserRound size={21} /><span>김하늘 선생님</span><ChevronDown size={15} /></button></div><button className="mobile-menu" aria-label="메뉴"><Menu /></button></div><nav className="gnb" aria-label="주요 메뉴"><div className="shell">{nav.map((item)=><button className={activeNav===item?"active":""} key={item} onClick={()=>{setActiveNav(item); if(item==="쌤크") navigate("main");}}>{item}</button>)}</div></nav></header>;
}

type MainProps = {
  userRole:UserRole; navigate:(v:ViewName,id?:string,extra?:string)=>void; registerCourse:()=>void; draftTerm:string; setDraftTerm:(v:string)=>void; runSearch:()=>void;
  age:string; setAge:(v:string)=>void; topic:string; setTopic:(v:string)=>void; situation:string; setSituation:(v:string)=>void; length:string; setLength:(v:string)=>void;
  freeOnly:boolean; setFreeOnly:(v:boolean)=>void; materialOnly:boolean; setMaterialOnly:(v:boolean)=>void; filteredCourses:Course[]; bookmarks:string[]; toggleBookmark:(id:string)=>void; chooseTopic:(title:string)=>void; instructorProfile:InstructorProfile;
};

function MainView(props:MainProps) {
  const { userRole,navigate,registerCourse,draftTerm,setDraftTerm,runSearch,age,setAge,topic,setTopic,situation,setSituation,length,setLength,freeOnly,setFreeOnly,materialOnly,setMaterialOnly,filteredCourses,bookmarks,toggleBookmark,chooseTopic,instructorProfile } = props;
  return <div className="shell page" id="top">
    <section className="hero"><div className="hero-copy"><p className="eyebrow">교사의 경험이 동료의 해답이 되는 곳</p><h1>선생님의 노하우가<br />함께 자라는 공간, <em>쌤크</em></h1><p>현장의 수업 아이디어와 실전 노하우를 함께 나누고,<br />더 많은 선생님과 함께 성장해요.</p><div className="hero-buttons"><button className="primary" onClick={()=>document.getElementById("course-results")?.scrollIntoView({behavior:"smooth"})}>지금 인기 강의 보기 <span>→</span></button><button className="outline" onClick={registerCourse}>강의 등록하기 <span>↗</span></button></div></div><div className="hero-visual"><img src="/hero-teacher.png" alt="태블릿을 들고 있는 교사" /><div className="feature feature-a">💡 <span><b>짧고 실용적인</b>실전 노하우</span></div><div className="feature feature-b">📁 <span><b>수업 아이디어</b>자료와 함께</span></div><div className="feature feature-c">▶️ <span><b>교사가 만든</b>신뢰할 수 있는 콘텐츠</span></div><div className="feature feature-d">👥 <span><b>선생님과 함께</b>성장하는 커뮤니티</span></div></div></section>
    <section className="my-section">{userRole === "instructor" ? <EnhancedDashboardCanvas><div className="my-section-head"><h2><UserRound size={24}/> 내 쌤크</h2><span>업데이트 2026.09.15 14:00</span></div><InstructorDashboard navigate={navigate} instructorProfile={instructorProfile} /></EnhancedDashboardCanvas> : <><div className="my-section-head"><h2><UserRound size={24}/> 내 쌤크</h2><span>업데이트 2026.09.15 14:00</span></div><EmptyDashboard registerCourse={registerCourse} /></>}</section>
    <section className="finder"><h2>나에게 필요한 콘텐츠 찾기</h2><div className="finder-row"><label className="finder-keyword"><Search size={18}/><input value={draftTerm} onChange={(event)=>setDraftTerm(event.target.value)} onKeyDown={(event)=>event.key==="Enter"&&runSearch()} placeholder="강의명, 선생님, 키워드 검색" /></label><FilterSelect value={age} values={filters.age} onChange={setAge}/><FilterSelect value={topic} values={filters.topic} onChange={setTopic}/><FilterSelect value={situation} values={filters.situation} onChange={setSituation}/><FilterSelect value={length} values={filters.length} onChange={setLength}/><label className="check-filter"><Checkbox checked={freeOnly} onCheckedChange={(value)=>setFreeOnly(value===true)} /> 무료만</label><label className="check-filter"><Checkbox checked={materialOnly} onCheckedChange={(value)=>setMaterialOnly(value===true)} /> 자료 포함</label><Button onClick={runSearch}><Search/> 검색하기</Button></div></section>
    <ContentSection id="course-results" title="선생님들이 지금 많이 보는 강의 🔥" courses={filteredCourses} navigate={navigate} bookmarks={bookmarks} toggleBookmark={toggleBookmark} empty />
    <ContentSection title="10분이면 충분해요 ⏱" courses={shortCourses} compact navigate={navigate} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />
    <section className="content-section"><SectionHeading title="노하우를 나누는 선생님들"/><div className="instructor-grid">{instructors.map((instructor)=><button className="instructor-card" key={instructor.id} onClick={()=>navigate("instructor",instructor.id)}><span className="instructor-avatar" style={spritePosition(instructor.sprite,6)} /><b>{instructor.name}</b><span>{instructor.field}</span><small>⭐ {instructor.rating} · {instructor.career}</small><em>강의 보기</em></button>)}</div></section>
    <section className="content-section"><SectionHeading title="이번 주 추천 주제 💡"/><div className="topic-grid">{topics.map((item)=><button key={item.no} onClick={()=>chooseTopic(item.title)}><strong>{item.no}</strong><span><b>{item.title}</b><small>{item.copy}</small></span><i>{item.icon}</i></button>)}</div></section>
    <VibeCodingSection navigate={navigate} />
    <section className="bottom-cta"><span className="bottom-cta-icon" aria-hidden="true"><BookOpen size={26}/></span><div className="bottom-cta-copy"><h2>좋은 수업은 함께할 때 더 멀리 갑니다.</h2><p>지금, 당신의 강의를 등록하고 더 많은 선생님과 나눠보세요.</p></div><p className="bottom-cta-quote">“선생님의 경험이<br/>또 다른 선생님의 시작이 됩니다.”</p><Button onClick={registerCourse}>강의 등록하기 →</Button></section>
  </div>;
}

function FilterSelect({value,values,onChange}:{value:string;values:string[];onChange:(v:string)=>void}) { return <Select value={value} onValueChange={onChange}><SelectTrigger className="filter-select"><SelectValue/></SelectTrigger><SelectContent>{values.map((item)=><SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>; }

function LevelMedal({level}:{level:string}) { return <span className={`level-medal ${level.toLowerCase()}`} aria-hidden="true"><img src="/instructor-level-medals.png" alt="" /></span>; }

function InstructorDashboard({navigate,instructorProfile}:{navigate:(v:ViewName,id?:string,extra?:string)=>void;instructorProfile:InstructorProfile}) {
  const [levelOpen,setLevelOpen]=useState(false);
  return <div className="dashboard-grid preview-dashboard-grid">
    <article className="profile-card"><div className="profile-avatar"/><strong>{`${instructorProfile.name} `}<small>강사</small></strong><p>{instructorProfile.career}<br/>{instructorProfile.field}</p><div className="level-activation"><button className="current-level-card" onClick={()=>setLevelOpen(true)}><LevelMedal level={instructorLevel.current}/><span className="level-card-copy"><span className="level-kicker">현재 등급</span><strong>{instructorLevel.current}</strong><span className="level-progress-row"><span className="progress-track"><i style={{width:`${instructorLevel.progress}%`}}/></span><b className="level-percent">{instructorLevel.progress}%</b></span><span className="level-next">다음 등급 <b>{instructorLevel.next}</b></span></span><ChevronRight className="level-arrow" size={18}/></button></div><div className="profile-actions"><button className="profile-primary" onClick={()=>navigate("profile")}>강사 프로필 관리</button><button onClick={()=>navigate("manage")}>내 강의 관리</button></div></article>
    <article className="today-card"><div className="card-title"><b>오늘의 현황</b></div><div className="today-stats">{dashboardStats.map((stat)=><div key={stat.label}><i>{stat.icon}</i><span>{stat.label}</span><strong>{stat.value}</strong>{dashboardTrends[stat.label]&&<small className="trend">{dashboardTrends[stat.label]}</small>}</div>)}</div><div className="total-stats"><span>이번 달 적립금<strong>58,400P</strong></span><span>누적 적립금<strong>324,500P</strong></span><span>누적 수강자<strong>1,237명</strong></span><span>등록 강의 수<strong>12개</strong></span><span>평균 평점<strong>⭐ 4.8</strong></span></div><div className="growth-record"><div className="growth-record-head"><h3>나의 성장 기록</h3><span className="growth-more">전체 보기 <ChevronRight size={15}/></span></div><div className="achievement-list">{achievements.map((item)=><div className={`achievement ${item.achieved?"achieved":"locked"}`} key={item.label}><b>{item.label}</b>{item.achieved&&<span className="completion-stamp">완료</span>}</div>)}</div></div></article>
    <article className="mission-card"><div className="mission-title"><h3>이번 달 활동 미션</h3><span>9월 미션</span></div>{monthlyMissions.map((mission)=>{const percent=Math.min(100,Math.round(mission.current/mission.target*100));return <div className="mission-item" key={mission.label}><div className="mission-head"><span><i className={`mission-check ${percent===100?"done":""}`}>{percent===100?"✓":""}</i>{mission.label}</span><b>{mission.current}/{mission.target}</b></div><div className="progress-track"><i style={{width:`${percent}%`}}/></div></div>})}<div className="mission-benefits"><b>이번 달 기대 혜택</b><p className="mission-benefit-lead">미션을 완료하고 더 많은 성장 기회를 만나보세요.</p><ul>{missionBenefits.map((benefit,index)=>{const BenefitIcon=[Coins,Award,Megaphone][index];return <li key={benefit}><span><BenefitIcon size={17}/></span><b>{benefit}</b></li>})}</ul></div></article>
    <div className="activity-feedback"><Megaphone size={19}/><span>이번 달 <b>137명의 선생님</b>이 김하늘 선생님의 강의를 들었어요. Mentor 등급까지 조금만 더 남았어요.</span><span className="activity-encourage">지금처럼 꾸준히 활동해보세요! <ChevronRight size={16}/></span></div>
    <Dialog open={levelOpen} onOpenChange={setLevelOpen}><DialogContent className="level-dialog"><DialogHeader><DialogTitle>강사 등급 안내</DialogTitle><DialogDescription>교사 크리에이터의 활동과 성장을 보여주는 Preview입니다.</DialogDescription></DialogHeader><div className="level-list">{instructorLevels.map((item)=><div className="level-item" key={item.id}><LevelMedal level={item.name}/><b>{item.name}</b><p>{item.meaning}</p></div>)}</div><p className="policy-note">등급은 강의 활동, 수강, 판매 및 평가 등을 종합해 산정할 예정입니다.</p><DialogFooter><DialogClose asChild><Button>확인</Button></DialogClose></DialogFooter></DialogContent></Dialog>
  </div>;
}

function EmptyDashboard({registerCourse}:{registerCourse:()=>void}) { return <div className="empty-dashboard"><div className="empty-icon"><FileText/></div><div><h3>아직 등록한 강의가 없어요.</h3><p>선생님의 현장 노하우를 다른 선생님과 나눠보세요.</p></div><Button onClick={registerCourse}>첫 강의 등록하기</Button></div>; }

function SectionHeading({title,detail}:{title:string;detail?:string}) { return <div className="section-heading"><div><h2>{title}</h2>{detail&&<p>{detail}</p>}</div><button>전체보기 ›</button></div>; }

function VibeMock({type}:{type:VibeMockType}) {
  switch (type) {
    case "emotion": return <div className="vibe-mock vibe-mock-emotion"><b>오늘 우리 반 기분은?</b><div className="vibe-mock-emoji-row"><span>😊<small>행복해요</small></span><span>🙂<small>괜찮아요</small></span><span>😢<small>속상해요</small></span><span>😠<small>화나요</small></span></div></div>;
    case "consult": return <div className="vibe-mock vibe-mock-consult"><b>상담 기록</b><div className="vibe-mock-list"><span><UserRound size={12}/> 학생 A<small>2026.03.12</small></span><span><UserRound size={12}/> 학생 B<small>2026.03.10</small></span><span><UserRound size={12}/> 학생 C<small>2026.03.08</small></span></div></div>;
    case "attendance": return <div className="vibe-mock vibe-mock-attendance"><b>오늘의 출석 체크</b><div className="vibe-mock-stats"><span className="ok"><strong>18</strong>출석</span><span className="warn"><strong>1</strong>지각</span><span className="bad"><strong>0</strong>결석</span></div></div>;
    case "play": return <div className="vibe-mock vibe-mock-play"><div className="vibe-mock-photo"/><div className="vibe-mock-summary"><b>AI 요약</b><p>블록을 활용해 구조를 만들며 놀이하는 모습이 관찰돼요.</p></div></div>;
    case "material": return <div className="vibe-mock vibe-mock-material"><div className="vibe-mock-input">주제를 입력해주세요</div><div className="vibe-mock-icons"><span><FileText size={15}/>활동지</span><span><Presentation size={15}/>PPT</span><span><BookOpen size={15}/>학습지</span><span><ImageIcon size={15}/>그림자료</span></div></div>;
    case "alarm": return <div className="vibe-mock vibe-mock-alarm"><div className="vibe-mock-alarm-head"><b>오늘의 알림장</b><span>자동생성</span></div><p>오늘은 친구들과 색종이로 꽃을 만들며 즐겁게 활동했어요.</p></div>;
    case "timer": return <div className="vibe-mock vibe-mock-timer">{["모둠1","모둠2","모둠3","모둠4"].map((group)=><span key={group}><Timer size={13}/>{group}<b>04:12</b></span>)}</div>;
    case "progress": return <div className="vibe-mock vibe-mock-progress">{[["학생 A",72],["학생 B",48],["학생 C",90]].map(([label,value])=><div key={label}><span>{label}</span><div className="track"><i style={{width:`${value}%`}}/></div></div>)}</div>;
    default: return null;
  }
}

function VibeCodingSection({navigate}:{navigate:(v:ViewName,id?:string,extra?:string)=>void}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ down: false, dragging: false, startX: 0, scrollLeft: 0, pointerId: 0 });

  const scrollByAmount = (direction: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".vibe-card");
    const step = card ? card.offsetWidth + 16 : 240;
    el.scrollBy({ left: direction * step * 2, behavior: "smooth" });
  };

  const endDrag = () => { dragState.current.down = false; dragState.current.dragging = false; };

  return (
    <section className="content-section vibe-section">
      <SectionHeading title="바이브 코딩, 선생님들은 이렇게 활용해요" detail="코딩을 몰라도 아이디어만 있으면 시작할 수 있어요. 선생님들이 직접 만든 교육 서비스를 만나보세요." />
      <div className="vibe-carousel">
        <button type="button" className="vibe-arrow vibe-arrow-left" aria-label="이전 사례 보기" onClick={() => scrollByAmount(-1)}><ChevronLeft size={18} /></button>
        <div
          className="vibe-track"
          ref={trackRef}
          onPointerDown={(event) => { const el = trackRef.current; if (!el) return; dragState.current = { down: true, dragging: false, startX: event.clientX, scrollLeft: el.scrollLeft, pointerId: event.pointerId }; }}
          onPointerMove={(event) => { const el = trackRef.current; if (!el || !dragState.current.down) return; const delta = event.clientX - dragState.current.startX; if (!dragState.current.dragging) { if (Math.abs(delta) < 6) return; dragState.current.dragging = true; el.setPointerCapture(dragState.current.pointerId); } el.scrollLeft = dragState.current.scrollLeft - delta; }}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          {vibeCodingStories.map((story) => (
            <article key={story.id} className="vibe-card" tabIndex={0} role="button" onClick={() => navigate("course", story.courseId)} onKeyDown={(event) => { if (event.key === "Enter") navigate("course", story.courseId); }}>
              <div className="vibe-card-image-wrap"><VibeMock type={story.mockType} /><span className="play-badge"><Play size={14} fill="currentColor" /></span></div>
              <div className="vibe-card-body">
                <div className="vibe-card-profile"><span className="vibe-avatar instructor-avatar" style={spritePosition(story.profileSprite, 6)} /><span><b>{story.instructorName}</b><small>{story.instructorRole}</small></span></div>
                <h3>{story.title}</h3>
                <div className="vibe-tags">{story.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
              </div>
            </article>
          ))}
        </div>
        <button type="button" className="vibe-arrow vibe-arrow-right" aria-label="다음 사례 보기" onClick={() => scrollByAmount(1)}><ChevronRight size={18} /></button>
      </div>
    </section>
  );
}

function ContentSection({id,title,courses:items,compact,navigate,bookmarks,toggleBookmark,empty}:{id?:string;title:string;courses:Course[];compact?:boolean;navigate:(v:ViewName,id?:string)=>void;bookmarks:string[];toggleBookmark:(id:string)=>void;empty?:boolean}) { return <section className={`content-section ${compact?"compact-section":""}`} id={id}><SectionHeading title={title} detail={empty?`${items.length}개의 강의를 찾았어요`:undefined}/>{items.length===0?<div className="no-results"><Search/><h3>조건에 맞는 강의가 없어요</h3><p>필터를 바꾸거나 검색어를 줄여보세요.</p></div>:<div className={`course-grid ${compact?"compact-grid":""}`}>{items.map((course)=><CourseCard key={course.id} course={course} compact={compact} navigate={navigate} bookmarked={bookmarks.includes(course.id)} toggleBookmark={toggleBookmark}/>)}</div>}</section>; }

function CourseCard({course,compact,navigate,bookmarked,toggleBookmark}:{course:Course;compact?:boolean;navigate:(v:ViewName,id?:string)=>void;bookmarked:boolean;toggleBookmark:(id:string)=>void}) { const achievement=courseAchievementBadges[course.id]; return <article className={`course-card ${compact?"compact-card":""}`} tabIndex={0} role="button" onClick={()=>navigate("course",course.id)} onKeyDown={(event)=>{if(event.key==="Enter")navigate("course",course.id)}}><div className="course-thumb" style={spritePosition(course.sprite,4,2)}><div className="course-badges">{achievement&&<span className="badge-chip badge-emphasis">{achievement}</span>}<span className={`tag tag-${course.tag}`}>{course.tag}</span></div><time>{compact?`${course.duration}분`:`${String(course.duration).padStart(2,"0")}:${course.id.charCodeAt(1)%2?"25":"40"}`}</time><span className="play-badge"><Play size={14} fill="currentColor"/></span></div><div className="course-body"><h3>{course.title}</h3><p>{course.instructor}</p><div className="course-meta"><strong>{formatPrice(course.price)}</strong><span>⭐ {course.rating} ({course.reviews})</span><button aria-label={`${course.title} 북마크`} onClick={(event)=>{event.stopPropagation();toggleBookmark(course.id)}}><Bookmark size={18} fill={bookmarked?"currentColor":"none"}/></button></div></div></article>; }

function BackButton({onClick,label="쌤크 홈"}:{onClick:()=>void;label?:string}) { return <button className="back-button" onClick={onClick}><ArrowLeft size={18}/>{label}</button>; }

function CourseDetail({course,navigate,bookmarks,toggleBookmark}:{course:Course;navigate:(v:ViewName,id?:string)=>void;bookmarks:string[];toggleBookmark:(id:string)=>void}) { return <div className="shell subpage"><BackButton onClick={()=>navigate("main")}/><div className="detail-hero"><div className="video-panel course-thumb" style={spritePosition(course.sprite,4,2)}><button className="preview-play"><CirclePlay/> 3분 맛보기</button><time>{course.duration}분</time></div><aside className="purchase-card"><span className={`detail-tag tag-${course.tag}`}>{course.tag}</span><h1>{course.title}</h1><button className="teacher-link" onClick={()=>navigate("instructor",course.instructorId)}><span className="mini-avatar"/> {course.instructor} ›</button><p className="detail-rating"><Star fill="#ffbb17" color="#ffbb17"/> {course.rating} <span>리뷰 {course.reviews}개</span></p><strong className="detail-price">{formatPrice(course.price)}</strong><div className="purchase-actions"><Button size="lg">{course.price===0?"무료로 수강하기":"구매하고 수강하기"}</Button><Button variant="outline" size="icon-lg" onClick={()=>toggleBookmark(course.id)} aria-label="북마크"><Heart fill={bookmarks.includes(course.id)?"#1265ed":"none"} color="#1265ed"/></Button></div><small>구매 전 맛보기와 첨부자료 정보를 확인해 주세요.</small></aside></div><div className="detail-layout"><article className="detail-content"><section><h2>강의 소개</h2><p>{course.description}. 실제 교실 사례와 바로 따라 할 수 있는 체크리스트를 중심으로 구성했어요.</p><ul><li>상황을 이해하는 핵심 원리</li><li>교실에서 바로 쓰는 단계별 실천법</li><li>실패를 줄이는 선생님의 실제 팁</li></ul></section><section><h2>첨부자료</h2><div className="resource-row"><Paperclip/><span><b>수업 적용 체크리스트.pdf</b><small>PDF · 구매 후 다운로드</small></span><button>미리보기</button></div></section><section><h2>관련 키드키즈 자료</h2><div className="related-resource-grid">{buildRelatedKidkidsResources(course).slice(0,4).map((item)=>(<div className="related-resource-card" key={item.id}><div className="related-resource-thumb course-thumb" style={spritePosition(item.sprite,4,2)}/><div className="related-resource-body"><span className="related-resource-badge">{item.type}</span><b>{item.title}</b></div></div>))}</div>{buildRelatedKidkidsResources(course).length>4&&<button className="related-resource-more">자료 전체보기 →</button>}</section><section><h2>리뷰와 평점</h2><div className="review-summary"><strong>{course.rating}</strong><span>⭐⭐⭐⭐⭐<small>{course.reviews}명의 선생님이 남긴 후기</small></span></div><blockquote>“설명이 짧고 명확해서 바로 다음 날 교실에 적용했어요. 첨부자료도 정말 유용했습니다.”</blockquote></section></article><aside className="instructor-summary"><span className="instructor-avatar" style={spritePosition(instructors.find(i=>i.id===course.instructorId)?.sprite||0,6)}/><h3>{course.instructor}</h3><p>{instructors.find(i=>i.id===course.instructorId)?.field}</p><span>⭐ {course.rating} · 강의 {courses.filter(c=>c.instructorId===course.instructorId).length}개</span><Button variant="outline" onClick={()=>navigate("instructor",course.instructorId)}>강사 채널 보기</Button></aside></div></div>; }

function InstructorChannel({instructorId,navigate,userRole,instructorProfile}:{instructorId:string;navigate:(v:ViewName,id?:string)=>void;userRole:UserRole;instructorProfile:InstructorProfile}) {
  const instructor=instructors.find(item=>item.id===instructorId)||instructors[0];
  const own=courses.filter(course=>course.instructorId===instructor.id);
  const shown=own.length?own:courses.slice(0,3);
  const isSelf=instructor.id==="i1";
  const [levelOpen,setLevelOpen]=useState(false);
  const displayName=isSelf?instructorProfile.name:instructor.name;
  const displayCareer=isSelf?instructorProfile.career:instructor.career;
  const displayField=isSelf?instructorProfile.field:instructor.field;
  const displayIntro=isSelf?instructorProfile.intro:"교실에서 직접 부딪히며 배운 작은 팁이 다른 선생님의 하루를 가볍게 만들 수 있다고 믿습니다. 현장에서 검증한 방법을 짧고 정확하게 나눕니다.";
  const fieldTags=displayField.split(/[·,]/).map((item)=>item.trim()).filter(Boolean);
  return <div className="shell subpage"><BackButton onClick={()=>navigate("main")}/><section className="channel-hero"><span className="channel-avatar instructor-avatar" style={spritePosition(instructor.sprite,6)}/><div className="channel-profile-copy"><span className="channel-label">쌤크 강사</span><h1>{displayName}</h1><p>{displayCareer} · {displayField}</p><div className="channel-stats"><b>⭐ {instructor.rating}<small>평균 평점</small></b><b>{shown.length}<small>등록 강의</small></b><b>{shown.reduce((sum,c)=>sum+c.reviews,0).toLocaleString()}명<small>누적 수강자</small></b></div></div><aside className={`channel-self-level ${isSelf&&userRole==="instructor"?"":"level-only"}`}><button type="button" className="channel-level-card" onClick={()=>setLevelOpen(true)} aria-label={`${instructorLevel.current} 등급 안내 열기`}><span className="channel-level-main"><LevelMedal level={instructorLevel.current}/><strong>{instructorLevel.current.toUpperCase()}</strong></span></button>{isSelf&&userRole==="instructor"&&<button className="channel-manage-button" onClick={()=>navigate("profile")}>강사 프로필 관리</button>}</aside></section><section className="channel-about"><h2>선생님 소개</h2><p>{displayIntro}</p><div>{fieldTags.map((tag)=><span key={tag}># {tag}</span>)}<span># 교실실전</span><span># 바로적용</span></div></section><ContentSection title={`${displayName}의 강의`} courses={shown} navigate={navigate} bookmarks={[]} toggleBookmark={()=>undefined}/><Dialog open={levelOpen} onOpenChange={setLevelOpen}><DialogContent className="level-dialog"><DialogHeader><DialogTitle>강사 등급 안내</DialogTitle><DialogDescription>교사 크리에이터의 활동과 성장을 보여주는 Preview입니다.</DialogDescription></DialogHeader><div className="level-list">{instructorLevels.map((item)=><div className="level-item" key={item.id}><LevelMedal level={item.name}/><b>{item.name}</b><p>{item.meaning}</p></div>)}</div><p className="policy-note">등급은 강의 활동, 수강, 판매 및 평가 등을 종합해 산정할 예정입니다.</p><DialogFooter><DialogClose asChild><Button>확인</Button></DialogClose></DialogFooter></DialogContent></Dialog></div>;
}

function RegistrationScreen({navigate,setNotice}:{navigate:(v:ViewName,id?:string)=>void;setNotice:(v:string)=>void}) { const [step,setStep]=useState(0); const labels=["기본정보","콘텐츠","자료","판매정보","권리 확인","미리보기"]; const [uploadedFile,setUploadedFile]=useState<{name:string;size:string}|null>({name:"교실루틴_체크리스트.pdf",size:"2.4MB"}); const [kidkidsUrl,setKidkidsUrl]=useState(""); const [kidkidsStatus,setKidkidsStatus]=useState<"idle"|"invalid"|"duplicate">("idle"); const [kidkidsResource,setKidkidsResource]=useState<KidkidsResource|null>(null); const loadKidkidsResource=()=>{ const marker="kidkids.net/resource/"; const trimmedUrl=kidkidsUrl.trim(); const markerIndex=trimmedUrl.indexOf(marker); let resourceId=""; if(markerIndex>=0){ const after=trimmedUrl.slice(markerIndex+marker.length); for(const ch of after){ if(ch>="0"&&ch<="9") resourceId+=ch; else break; } } const entry=resourceId?kidkidsResourceCatalog[resourceId]:undefined; if(!entry){setKidkidsStatus("invalid");return;} if(kidkidsResource?.id===resourceId){setKidkidsStatus("duplicate");return;} setKidkidsResource({id:resourceId as string,...entry}); setKidkidsStatus("idle"); }; const unlinkKidkidsResource=()=>{setKidkidsResource(null);setKidkidsUrl("");setKidkidsStatus("idle");}; return <div className="shell subpage"><BackButton onClick={()=>navigate("main")} label="등록 취소"/><div className="workspace-head"><div><span>강사 스튜디오</span><h1>새 강의 등록</h1><p>임시저장 후 언제든 이어서 작성할 수 있어요.</p></div><Button variant="outline" onClick={()=>setNotice("임시저장했어요.")}>임시저장</Button></div><div className="registration-layout"><nav className="step-nav">{labels.map((label,index)=><button className={step===index?"active":index<step?"done":""} key={label} onClick={()=>setStep(index)}><i>{index<step?<Check/>:index+1}</i><span>{label}</span></button>)}</nav><section className="form-card"><div className="form-title"><span>STEP {step+1}</span><h2>{labels[step]}</h2></div>{step===0&&<div className="form-grid"><label className="wide">강의명<input defaultValue="아이들이 스스로 움직이는 교실 루틴"/></label><label>대상 연령<select defaultValue="유아"><option>유아</option><option>초등</option><option>공통</option></select></label><label>주제<select defaultValue="교실운영"><option>교실운영</option><option>놀이수업</option><option>학부모 상담</option></select></label><label className="wide">한 줄 소개<textarea defaultValue="환경 구성부터 정리까지, 현장에서 검증한 교실 루틴을 소개합니다."/></label><label className="wide">대표 이미지<div className="upload-zone"><Upload/><b>이미지를 끌어놓거나 클릭해 업로드</b><small>JPG, PNG · 권장 1280×720</small></div></label></div>}{step===1&&<div className="form-stack"><label>강의 영상<div className="upload-zone large"><CirclePlay/><b>MP4 영상을 업로드해 주세요</b><small>최대 2GB · 업로드 후 미리보기가 생성됩니다.</small></div></label><label>강의 구성<textarea defaultValue={"1. 교실 루틴이 필요한 이유\n2. 환경 구성과 시각 단서\n3. 아이들과 약속 만들기\n4. 실제 적용 사례"}/></label></div>}{step===2&&<div className="material-step"><div className="material-columns"><div className="material-card"><div className="material-card-head"><h3>직접 자료 올리기</h3><p>내 PC에서 파일을 직접 업로드합니다.</p></div><div className="upload-zone large"><Paperclip/><b>수업 자료를 추가해 주세요</b><small>PDF, PPTX, DOCX, ZIP</small></div>{uploadedFile&&<div className="file-item"><FileText/><span><b>{uploadedFile.name}</b><small>{uploadedFile.size}</small></span><button onClick={()=>setUploadedFile(null)} aria-label="자료 삭제"><X/></button></div>}</div><div className="material-card kidkids-card"><div className="material-card-head"><h3>키드키즈 자료 연결하기 <span className="badge-new">NEW</span></h3><p>키드키즈에 등록된 자료의 URL을 입력하면 강의에 바로 연결할 수 있어요.</p></div><div className="kidkids-input-row"><input value={kidkidsUrl} onChange={(event)=>{setKidkidsUrl(event.target.value);setKidkidsStatus("idle");}} placeholder="https://www.kidkids.net/resource/12345"/><button type="button" onClick={loadKidkidsResource}>자료 불러오기</button></div>{kidkidsStatus==="invalid"&&<p className="kidkids-message error">키드키즈 자료 URL을 확인해주세요.</p>}{kidkidsStatus==="duplicate"&&<p className="kidkids-message error">이미 연결된 자료입니다.</p>}{kidkidsResource&&<div className="kidkids-resource-card"><div className="kidkids-resource-thumb" style={spritePosition(kidkidsResource.sprite,4,2)}/><div className="kidkids-resource-body"><b>{kidkidsResource.title}</b><span className="kidkids-resource-tag">키드키즈 자료</span><dl><dt>자료 유형</dt><dd>{kidkidsResource.type}</dd><dt>대상</dt><dd>{kidkidsResource.age}</dd><dt>자료 ID</dt><dd>KK-{kidkidsResource.id}</dd></dl><button type="button" className="kidkids-unlink" onClick={unlinkKidkidsResource}>연결 해제</button></div></div>}<div className="kidkids-benefits"><b>키드키즈 자료를 연결하면 이런 점이 좋아요</b><ul><li>검증된 키드키즈 자료를 강의와 함께 활용할 수 있어요</li><li>별도 자료 제작 시간을 줄일 수 있어요</li><li>관련 키드키즈 자료와 강의를 함께 노출할 수 있어요</li><li>자료 연계 강의에는 추가 정산 혜택을 제공할 수 있어요</li></ul></div><p className="kidkids-copyright">※ 키드키즈 자료는 강의에 연결하여 활용할 수 있으며, 원본 자료 자체를 재배포하거나 재판매할 수 없습니다.</p></div></div><div className={`settlement-card ${kidkidsResource?"linked":""}`}><b>자료 연결 시 정산 혜택</b>{kidkidsResource?<><div className="settlement-compare"><div className="settlement-row muted"><span>일반 강의</span><strong>선생님 {exampleSettlement.normal.instructor}% : 플랫폼 {exampleSettlement.normal.platform}%</strong></div><span className="settlement-arrow">↓</span><div className="settlement-row highlight"><span>키드키즈 자료 연계 강의</span><strong>선생님 {exampleSettlement.kidkidsLinked.instructor}% : 플랫폼 {exampleSettlement.kidkidsLinked.platform}%</strong></div></div><p className="settlement-note">키드키즈 자료를 활용한 강의에는 추가 정산 혜택이 적용될 수 있어요. 키드키즈 자료 연계 혜택이 적용된 예시입니다. (MOCK)</p></>:<p className="settlement-note">키드키즈 자료를 연결하면 추가 정산 혜택을 확인할 수 있어요.</p>}</div></div>}{step===3&&<div className="form-grid"><label>판매 유형<select defaultValue="유료"><option>유료</option><option>무료</option></select></label><label>판매 가격<input defaultValue="32,000"/></label><div className="policy-note wide">적립률·가격 범위·환불 기간은 운영 정책 확정 후 안내됩니다.</div>{kidkidsResource&&<div className="policy-note wide settlement-mini"><b>정산 예상</b><p>키드키즈 자료 연계 <span className="settlement-check">✓ 적용</span></p><p>정산 비율 예시 — 선생님 {exampleSettlement.kidkidsLinked.instructor}% / 플랫폼 {exampleSettlement.kidkidsLinked.platform}%</p></div>}</div>}{step===4&&<div className="rights-list">{["영상과 자료의 저작권을 보유하고 있습니다.","등장 인물의 촬영 및 활용 동의를 받았습니다.","타인의 개인정보가 포함되지 않았음을 확인했습니다."].map(item=><label key={item}><Checkbox/> {item}</label>)}</div>}{step===5&&<div className="preview-box"><div className="preview-thumb course-thumb" style={spritePosition(0,4,2)}/><div><span className="tag tag-신규">미리보기</span><h3>아이들이 스스로 움직이는 교실 루틴</h3><p>환경 구성부터 정리까지, 현장에서 검증한 교실 루틴을 소개합니다.</p><b>김하늘 선생님</b></div></div>}<div className="form-actions"><Button variant="outline" disabled={step===0} onClick={()=>setStep(Math.max(0,step-1))}>이전</Button>{step<labels.length-1?<Button onClick={()=>setStep(step+1)}>다음 단계</Button>:<Button onClick={()=>{setNotice("승인 요청을 보냈어요. 내 강의 관리에서 상태를 확인해 주세요.");navigate("manage")}}>승인 요청</Button>}</div></section><aside className="registration-tip"><b>등록 가이드</b><p>핵심을 먼저 말하고, 한 강의에 하나의 문제 해결을 담아보세요.</p><a>좋은 강의 사례 보기 →</a></aside></div></div>; }

function ManageScreen({navigate}:{navigate:(v:ViewName,id?:string)=>void}) { const statuses=["전체","임시저장","승인 요청","검수중","승인","반려","판매중","판매중지"]; const [filter,setFilter]=useState(()=>typeof window!=="undefined"?(new URLSearchParams(window.location.search).get("status")||"전체"):"전체"); const shown=managementCourses.filter(item=>filter==="전체"||(filter==="승인 대기"?(item.status==="승인 요청"||item.status==="검수중"):item.status===filter)); const summaryCards=[{label:"승인 대기",value:courseStatuses[0][1],icon:Clock3,tone:"blue",filterValue:"승인 대기"},{label:"판매중",value:courseStatuses[1][1],icon:BarChart3,tone:"green",filterValue:"판매중"},{label:"누적 강의",value:12,icon:BookOpen,tone:"purple",filterValue:"전체"}] as const; const pointCards=[{label:"이번 달 적립금",value:"128,400P",icon:Coins,tone:"amber"},{label:"누적 적립금",value:"842,600P",icon:Wallet,tone:"blue"}] as const; return <div className="shell subpage"><BackButton onClick={()=>navigate("main")}/><div className="workspace-head"><div><span>강사 스튜디오</span><h1>내 강의 관리</h1><p>등록한 강의의 검수와 판매 상태를 관리하세요.</p></div><Button onClick={()=>navigate("register")}>+ 새 강의 등록</Button></div><div className="manage-points">{pointCards.map((item)=>{const Icon=item.icon;return <div className={`manage-metric-card tone-${item.tone}`} key={item.label}><span className="manage-metric-icon"><Icon size={20}/></span><span className="manage-metric-copy"><b>{item.label} <CircleHelp size={13}/></b><strong>{item.value}</strong></span><ChevronRight className="manage-metric-arrow" size={18}/></div>;})}</div><div className="manage-summary">{summaryCards.map((item)=>{const Icon=item.icon;return <button type="button" className={`manage-metric-card tone-${item.tone} ${filter===item.filterValue?"active":""}`} key={item.label} onClick={()=>setFilter(item.filterValue)}><span className="manage-metric-icon"><Icon size={20}/></span><span className="manage-metric-copy"><b>{item.label}</b><strong>{item.value}</strong></span><ChevronRight className="manage-metric-arrow" size={18}/></button>;})}</div><div className="status-tabs">{statuses.map(status=><button className={filter===status?"active":""} key={status} onClick={()=>setFilter(status)}>{status}</button>)}</div><div className="manage-list"><div className="manage-head"><span>강의</span><span>상태</span><span>최근 수정</span><span>판매/평점</span><span>관리</span></div>{shown.length?shown.map((course,index)=><div className="manage-row" key={course.title}><div><span className="manage-thumb course-thumb" style={spritePosition(index,4,2)}/><b>{course.title}</b></div><span><i className={`status-pill status-${course.status}`}>{course.status}</i></span><span>{course.updated}</span><span>{course.sales?`${course.sales}건 · ⭐ ${course.rating}`:"-"}</span><button onClick={()=>navigate("register")}>수정</button></div>):<div className="no-results"><FileText/><h3>이 상태의 강의가 없어요</h3></div>}</div></div>; }

function ProfileScreen({navigate,setNotice,instructorProfile,onSave}:{navigate:(v:ViewName,id?:string)=>void;setNotice:(v:string)=>void;instructorProfile:InstructorProfile;onSave:(profile:InstructorProfile)=>void}) {
  const [draft,setDraft]=useState<InstructorProfile>(instructorProfile);
  const selfInstructor=instructors.find((item)=>item.id==="i1")||instructors[0];
  const selfCourses=courses.filter((course)=>course.instructorId==="i1");
  const previewTags=draft.field.split(/[·,]/).map((item)=>item.trim()).filter(Boolean);
  return <div className="shell subpage">
    <BackButton onClick={()=>navigate("main")}/>
    <div className="workspace-head">
      <div><span>강사 스튜디오</span><h1>강사 프로필 관리</h1><p>강사 페이지에 공개되는 정보를 관리하세요.</p></div>
      <div className="profile-top-actions"><Button variant="outline" onClick={()=>navigate("instructor","i1")}>미리보기</Button><Button onClick={()=>{onSave(draft);setNotice("프로필을 저장했어요.");navigate("main")}}>저장하기</Button></div>
    </div>
    <div className="profile-manage-layout">
      <section className="form-card">
        <div className="profile-photo-row">
          <span className="channel-avatar instructor-avatar" style={spritePosition(0,6)}/>
          <div className="profile-photo-actions"><Button variant="outline" size="sm">사진 변경</Button><Button variant="outline" size="sm">사진 삭제</Button><small>JPG 또는 PNG · 최대 5MB</small></div>
        </div>
        <div className="form-grid">
          <label>강사명<input value={draft.name} onChange={(event)=>setDraft({...draft,name:event.target.value})}/></label>
          <label>경력<input value={draft.career} onChange={(event)=>setDraft({...draft,career:event.target.value})}/></label>
          <label className="wide">전문 분야<input value={draft.field} onChange={(event)=>setDraft({...draft,field:event.target.value})}/></label>
          <label className="wide">한 줄 소개<textarea value={draft.intro} maxLength={80} onChange={(event)=>setDraft({...draft,intro:event.target.value})}/><small className="char-counter">{draft.intro.length}/80</small></label>
        </div>
      </section>
      <aside className="instructor-preview-card">
        <div className="instructor-preview-head"><b>강사 페이지 미리보기</b><button type="button" onClick={()=>navigate("instructor","i1")}>전체 페이지 보기 ↗</button></div>
        <p className="instructor-preview-caption">지금 입력한 내용이 실제 강사 페이지에 이렇게 보여요.</p>
        <div className="instructor-preview-body">
          <span className="channel-avatar instructor-avatar" style={spritePosition(0,6)}/>
          <strong>{draft.name}</strong>
          <span className="instructor-preview-meta">{draft.career} · {draft.field}</span>
          <div className="instructor-preview-stats"><b>⭐ {selfInstructor.rating}<small>평균 평점</small></b><b>{selfCourses.length}<small>등록 강의</small></b><b>{selfCourses.reduce((sum,c)=>sum+c.reviews,0).toLocaleString()}명<small>누적 수강자</small></b></div>
          <p className="instructor-preview-intro">{draft.intro}</p>
          <div className="instructor-preview-tags">{previewTags.map((tag)=><span key={tag}># {tag}</span>)}</div>
        </div>
      </aside>
    </div>
  </div>;
}

function Footer({navigate}:{navigate:(v:ViewName,id?:string)=>void}) { return <footer><div className="shell"><button className="brand footer-brand" onClick={()=>navigate("main")}><b>쌤크</b><span>직무연수에서 만나는 선생님 노하우 플랫폼</span></button><div><a>서비스 소개</a><a>이용약관</a><a>개인정보처리방침</a><a>고객센터</a></div><p>본 화면은 쌤크 서비스 검토를 위한 인터랙티브 프로토타입입니다.</p></div></footer>; }
