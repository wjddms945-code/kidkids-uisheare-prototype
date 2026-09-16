"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Award, Bell, Bookmark, Check, ChevronDown, ChevronRight, CirclePlay, Clock3, Coins, FileText,
  Heart, Megaphone, Menu, Paperclip, Play, Search, ShoppingCart, Star, Upload, UserRound, X,
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

const previewPath = "/uisheare-enhanced-motion";

export function UisheareEnhancedMotionApp() {
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
    <main className="preview-mode motion-mode">
      <Header activeNav={activeNav} setActiveNav={setActiveNav} value={draftTerm} onChange={setDraftTerm} onSearch={runSearch} navigate={navigate} />
      <div className="role-switch" aria-label="개발 확인용 사용자 상태"><span>미리보기</span><button className={userRole === "instructor" ? "selected" : ""} onClick={() => setUserRole("instructor")}>강사</button><button className={userRole === "user" ? "selected" : ""} onClick={() => setUserRole("user")}>일반 사용자</button></div>
      {view === "main" && <MainView userRole={userRole} navigate={navigate} registerCourse={registerCourse} draftTerm={draftTerm} setDraftTerm={setDraftTerm} runSearch={runSearch} age={age} setAge={setAge} topic={topic} setTopic={setTopic} situation={situation} setSituation={setSituation} length={length} setLength={setLength} freeOnly={freeOnly} setFreeOnly={setFreeOnly} materialOnly={materialOnly} setMaterialOnly={setMaterialOnly} filteredCourses={filteredCourses} bookmarks={bookmarks} toggleBookmark={toggleBookmark} chooseTopic={chooseTopic} />}
      {view === "course" && <CourseDetail course={courses.find((course) => course.id === selectedId) || courses[0]} navigate={navigate} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />}
      {view === "instructor" && <InstructorChannel instructorId={selectedId} navigate={navigate} />}
      {view === "register" && <RegistrationScreen navigate={navigate} setNotice={setNotice} />}
      {view === "manage" && <ManageScreen navigate={navigate} />}
      {view === "profile" && <ProfileScreen navigate={navigate} setNotice={setNotice} />}
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
  freeOnly:boolean; setFreeOnly:(v:boolean)=>void; materialOnly:boolean; setMaterialOnly:(v:boolean)=>void; filteredCourses:Course[]; bookmarks:string[]; toggleBookmark:(id:string)=>void; chooseTopic:(title:string)=>void;
};

function MainView(props:MainProps) {
  const { userRole,navigate,registerCourse,draftTerm,setDraftTerm,runSearch,age,setAge,topic,setTopic,situation,setSituation,length,setLength,freeOnly,setFreeOnly,materialOnly,setMaterialOnly,filteredCourses,bookmarks,toggleBookmark,chooseTopic } = props;
  return <div className="shell page" id="top">
    <section className="hero"><div className="hero-copy"><p className="eyebrow">교사의 경험이 동료의 해답이 되는 곳</p><h1>선생님의 노하우가<br />함께 자라는 공간, <em>쌤크</em></h1><p>현장의 수업 아이디어와 실전 노하우를 함께 나누고,<br />더 많은 선생님과 함께 성장해요.</p><div className="hero-buttons"><button className="primary" onClick={()=>document.getElementById("course-results")?.scrollIntoView({behavior:"smooth"})}>지금 인기 강의 보기 <span>→</span></button><button className="outline" onClick={registerCourse}>강의 등록하기 <span>↗</span></button></div></div><div className="hero-visual"><img src="/hero-teacher.png" alt="태블릿을 들고 있는 교사" /><div className="feature feature-a">💡 <span><b>짧고 실용적인</b>실전 노하우</span></div><div className="feature feature-b">📁 <span><b>수업 아이디어</b>자료와 함께</span></div><div className="feature feature-c">▶️ <span><b>교사가 만든</b>신뢰할 수 있는 콘텐츠</span></div><div className="feature feature-d">👥 <span><b>선생님과 함께</b>성장하는 커뮤니티</span></div></div></section>
    <section className="my-section">{userRole === "instructor" ? <EnhancedDashboardCanvas><div className="my-section-head"><h2><UserRound size={24}/> 내 쌤크</h2><span>업데이트 2026.09.15 14:00</span></div><InstructorDashboard navigate={navigate} /></EnhancedDashboardCanvas> : <><div className="my-section-head"><h2><UserRound size={24}/> 내 쌤크</h2><span>업데이트 2026.09.15 14:00</span></div><EmptyDashboard registerCourse={registerCourse} /></>}</section>
    <section className="finder"><h2>나에게 필요한 콘텐츠 찾기</h2><div className="finder-row"><label className="finder-keyword"><Search size={18}/><input value={draftTerm} onChange={(event)=>setDraftTerm(event.target.value)} onKeyDown={(event)=>event.key==="Enter"&&runSearch()} placeholder="강의명, 선생님, 키워드 검색" /></label><FilterSelect value={age} values={filters.age} onChange={setAge}/><FilterSelect value={topic} values={filters.topic} onChange={setTopic}/><FilterSelect value={situation} values={filters.situation} onChange={setSituation}/><FilterSelect value={length} values={filters.length} onChange={setLength}/><label className="check-filter"><Checkbox checked={freeOnly} onCheckedChange={(value)=>setFreeOnly(value===true)} /> 무료만</label><label className="check-filter"><Checkbox checked={materialOnly} onCheckedChange={(value)=>setMaterialOnly(value===true)} /> 자료 포함</label><Button onClick={runSearch}><Search/> 검색하기</Button></div></section>
    <ContentSection id="course-results" title="선생님들이 지금 많이 보는 강의 🔥" courses={filteredCourses} navigate={navigate} bookmarks={bookmarks} toggleBookmark={toggleBookmark} empty />
    <ContentSection title="10분이면 충분해요 ⏱" courses={shortCourses} compact navigate={navigate} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />
    <section className="content-section"><SectionHeading title="노하우를 나누는 선생님들"/><div className="instructor-grid">{instructors.map((instructor)=><button className="instructor-card" key={instructor.id} onClick={()=>navigate("instructor",instructor.id)}><span className="instructor-avatar" style={spritePosition(instructor.sprite,6)} /><b>{instructor.name}</b><span>{instructor.field}</span><small>⭐ {instructor.rating} · {instructor.career}</small><em>강의 보기</em></button>)}</div></section>
    <section className="content-section"><SectionHeading title="이번 주 추천 주제 💡"/><div className="topic-grid">{topics.map((item)=><button key={item.no} onClick={()=>chooseTopic(item.title)}><strong>{item.no}</strong><span><b>{item.title}</b><small>{item.copy}</small></span><i>{item.icon}</i></button>)}</div></section>
    <section className="bottom-cta"><div className="cta-people">● ● ●</div><div><h2>당신의 수업 노하우를 나눠주세요!</h2><p>누군가에게 꼭 필요한 수업이 될 수 있어요.<br/>쌤크에서 선생님의 경험을 나눠보세요.</p></div><img src="/hero-teacher.png" alt=""/><Button onClick={registerCourse}>강의 등록하기 →</Button></section>
  </div>;
}

function FilterSelect({value,values,onChange}:{value:string;values:string[];onChange:(v:string)=>void}) { return <Select value={value} onValueChange={onChange}><SelectTrigger className="filter-select"><SelectValue/></SelectTrigger><SelectContent>{values.map((item)=><SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>; }

function LevelMedal({level}:{level:string}) { return <span className={`level-medal ${level.toLowerCase()}`} aria-hidden="true"><img src="/instructor-level-medals.png" alt="" /></span>; }

function InstructorDashboard({navigate}:{navigate:(v:ViewName,id?:string,extra?:string)=>void}) {
  const [levelOpen,setLevelOpen]=useState(false);
  const [motionKey,setMotionKey]=useState(0);
  return <div className="dashboard-grid preview-dashboard-grid">
    <button className="motion-replay" onClick={()=>setMotionKey((value)=>value+1)} aria-label="현재 등급 진입 모션 다시보기">↻ 모션 다시보기</button>
    <article className="profile-card"><div className="profile-decoration" aria-hidden="true"><span>좋은 수업이<br/>더 많은 선생님에게<br/>닿을 수 있도록<br/>함께 성장해요! ♡</span><LevelMedal level={instructorLevel.current}/></div><div className="profile-avatar"/><strong>김하늘 선생님 <small>강사</small></strong><p>유아교육 12년차<br/>놀이수업 · 학급운영 전문</p><div className="level-activation" key={motionKey}><button className="current-level-card" onClick={()=>setLevelOpen(true)}><LevelMedal level={instructorLevel.current}/><span className="level-card-copy"><span className="level-kicker">현재 등급</span><strong>{instructorLevel.current}</strong><span className="level-next">다음 등급 {instructorLevel.next}까지 {instructorLevel.progress}%</span><span className="progress-track"><i style={{width:`${instructorLevel.progress}%`}}/></span><small>활동을 이어가면<br/>{instructorLevel.next}에 가까워져요.</small></span><ChevronRight className="level-arrow" size={18}/></button></div><div className="profile-actions"><button className="profile-primary" onClick={()=>navigate("profile")}>내 프로필 관리</button><button onClick={()=>navigate("manage")}>내 강의 관리</button></div></article>
    <article className="today-card"><div className="card-title"><b>오늘의 현황</b></div><div className="today-stats">{dashboardStats.map((stat)=><div key={stat.label}><i>{stat.icon}</i><span>{stat.label}</span><strong>{stat.value}</strong>{dashboardTrends[stat.label]&&<small className="trend">{dashboardTrends[stat.label]}</small>}</div>)}</div><div className="total-stats"><span>이번 달 적립금<strong>58,400P</strong></span><span>누적 적립금<strong>324,500P</strong></span><span>누적 수강자<strong>1,237명</strong></span><span>등록 강의 수<strong>12개</strong></span><span>평균 평점<strong>⭐ 4.8</strong></span></div><div className="growth-record"><div className="growth-record-head"><h3>나의 성장 기록</h3><span className="growth-more">전체 보기 <ChevronRight size={15}/></span></div><div className="achievement-list">{achievements.map((item)=><div className={`achievement ${item.achieved?"achieved":"locked"}`} key={item.label}><b>{item.label}</b>{item.achieved&&<span className="completion-stamp">완료</span>}</div>)}</div></div></article>
    <article className="mission-card"><div className="mission-title"><h3>이번 달 활동 미션</h3><span>9월 미션</span></div>{monthlyMissions.map((mission)=>{const percent=Math.min(100,Math.round(mission.current/mission.target*100));return <div className="mission-item" key={mission.label}><div className="mission-head"><span><i className={`mission-check ${percent===100?"done":""}`}>{percent===100?"✓":""}</i>{mission.label}</span><b>{mission.current}/{mission.target}</b></div><div className="progress-track"><i style={{width:`${percent}%`}}/></div></div>})}<div className="mission-benefits"><b>이번 달 기대 혜택</b><p className="mission-benefit-lead">미션을 완료하고 더 많은 성장 기회를 만나보세요.</p><ul>{missionBenefits.map((benefit,index)=>{const BenefitIcon=[Coins,Award,Megaphone][index];return <li key={benefit}><span><BenefitIcon size={17}/></span><b>{benefit}</b></li>})}</ul></div></article>
    <div className="activity-feedback"><Megaphone size={19}/><span>이번 달 <b>137명의 선생님</b>이 김하늘 선생님의 강의를 들었어요. Mentor 등급까지 조금만 더 남았어요.</span><span className="activity-encourage">지금처럼 꾸준히 활동해보세요! <ChevronRight size={16}/></span></div>
    <Dialog open={levelOpen} onOpenChange={setLevelOpen}><DialogContent className="level-dialog"><DialogHeader><DialogTitle>강사 등급 안내</DialogTitle><DialogDescription>교사 크리에이터의 활동과 성장을 보여주는 Preview입니다.</DialogDescription></DialogHeader><div className="level-list">{instructorLevels.map((item)=><div className="level-item" key={item.id}><LevelMedal level={item.name}/><b>{item.name}</b><p>{item.meaning}</p></div>)}</div><p className="policy-note">등급은 강의 활동, 수강, 판매 및 평가 등을 종합해 산정할 예정입니다.</p><DialogFooter><DialogClose asChild><Button>확인</Button></DialogClose></DialogFooter></DialogContent></Dialog>
  </div>;
}

function EmptyDashboard({registerCourse}:{registerCourse:()=>void}) { return <div className="empty-dashboard"><div className="empty-icon"><FileText/></div><div><h3>아직 등록한 강의가 없어요.</h3><p>선생님의 현장 노하우를 다른 선생님과 나눠보세요.</p></div><Button onClick={registerCourse}>첫 강의 등록하기</Button></div>; }

function SectionHeading({title,detail}:{title:string;detail?:string}) { return <div className="section-heading"><div><h2>{title}</h2>{detail&&<p>{detail}</p>}</div><button>전체보기 ›</button></div>; }

function ContentSection({id,title,courses:items,compact,navigate,bookmarks,toggleBookmark,empty}:{id?:string;title:string;courses:Course[];compact?:boolean;navigate:(v:ViewName,id?:string)=>void;bookmarks:string[];toggleBookmark:(id:string)=>void;empty?:boolean}) { return <section className={`content-section ${compact?"compact-section":""}`} id={id}><SectionHeading title={title} detail={empty?`${items.length}개의 강의를 찾았어요`:undefined}/>{items.length===0?<div className="no-results"><Search/><h3>조건에 맞는 강의가 없어요</h3><p>필터를 바꾸거나 검색어를 줄여보세요.</p></div>:<div className={`course-grid ${compact?"compact-grid":""}`}>{items.map((course)=><CourseCard key={course.id} course={course} compact={compact} navigate={navigate} bookmarked={bookmarks.includes(course.id)} toggleBookmark={toggleBookmark}/>)}</div>}</section>; }

function CourseCard({course,compact,navigate,bookmarked,toggleBookmark}:{course:Course;compact?:boolean;navigate:(v:ViewName,id?:string)=>void;bookmarked:boolean;toggleBookmark:(id:string)=>void}) { const achievement=courseAchievementBadges[course.id]; return <article className={`course-card ${compact?"compact-card":""}`} tabIndex={0} role="button" onClick={()=>navigate("course",course.id)} onKeyDown={(event)=>{if(event.key==="Enter")navigate("course",course.id)}}><div className="course-thumb" style={spritePosition(course.sprite,4,2)}>{achievement&&<span className="performance-badge">{achievement}</span>}<span className={`tag tag-${course.tag}`}>{course.tag}</span><time>{compact?`${course.duration}분`:`${String(course.duration).padStart(2,"0")}:${course.id.charCodeAt(1)%2?"25":"40"}`}</time><span className="play-badge"><Play size={14} fill="currentColor"/></span></div><div className="course-body"><h3>{course.title}</h3><p>{course.instructor}</p><div className="course-meta"><strong>{formatPrice(course.price)}</strong><span>⭐ {course.rating} ({course.reviews})</span><button aria-label={`${course.title} 북마크`} onClick={(event)=>{event.stopPropagation();toggleBookmark(course.id)}}><Bookmark size={18} fill={bookmarked?"currentColor":"none"}/></button></div></div></article>; }

function BackButton({onClick,label="쌤크 홈"}:{onClick:()=>void;label?:string}) { return <button className="back-button" onClick={onClick}><ArrowLeft size={18}/>{label}</button>; }

function CourseDetail({course,navigate,bookmarks,toggleBookmark}:{course:Course;navigate:(v:ViewName,id?:string)=>void;bookmarks:string[];toggleBookmark:(id:string)=>void}) { return <div className="shell subpage"><BackButton onClick={()=>navigate("main")}/><div className="detail-hero"><div className="video-panel course-thumb" style={spritePosition(course.sprite,4,2)}><button className="preview-play"><CirclePlay/> 3분 맛보기</button><time>{course.duration}분</time></div><aside className="purchase-card"><span className={`detail-tag tag-${course.tag}`}>{course.tag}</span><h1>{course.title}</h1><button className="teacher-link" onClick={()=>navigate("instructor",course.instructorId)}><span className="mini-avatar"/> {course.instructor} ›</button><p className="detail-rating"><Star fill="#ffbb17" color="#ffbb17"/> {course.rating} <span>리뷰 {course.reviews}개</span></p><strong className="detail-price">{formatPrice(course.price)}</strong><div className="purchase-actions"><Button size="lg">{course.price===0?"무료로 수강하기":"구매하고 수강하기"}</Button><Button variant="outline" size="icon-lg" onClick={()=>toggleBookmark(course.id)} aria-label="북마크"><Heart fill={bookmarks.includes(course.id)?"#1265ed":"none"} color="#1265ed"/></Button></div><small>구매 전 맛보기와 첨부자료 정보를 확인해 주세요.</small></aside></div><div className="detail-layout"><article className="detail-content"><section><h2>강의 소개</h2><p>{course.description}. 실제 교실 사례와 바로 따라 할 수 있는 체크리스트를 중심으로 구성했어요.</p><ul><li>상황을 이해하는 핵심 원리</li><li>교실에서 바로 쓰는 단계별 실천법</li><li>실패를 줄이는 선생님의 실제 팁</li></ul></section><section><h2>첨부자료</h2><div className="resource-row"><Paperclip/><span><b>수업 적용 체크리스트.pdf</b><small>PDF · 구매 후 다운로드</small></span><button>미리보기</button></div></section><section><h2>관련 키드키즈 자료</h2><div className="related-resource"><span>키드키즈 연계자료</span><b>{course.topic} 활동지와 수업 자료 모음</b><button>자료 살펴보기 →</button></div></section><section><h2>리뷰와 평점</h2><div className="review-summary"><strong>{course.rating}</strong><span>⭐⭐⭐⭐⭐<small>{course.reviews}명의 선생님이 남긴 후기</small></span></div><blockquote>“설명이 짧고 명확해서 바로 다음 날 교실에 적용했어요. 첨부자료도 정말 유용했습니다.”</blockquote></section></article><aside className="instructor-summary"><span className="instructor-avatar" style={spritePosition(instructors.find(i=>i.id===course.instructorId)?.sprite||0,6)}/><h3>{course.instructor}</h3><p>{instructors.find(i=>i.id===course.instructorId)?.field}</p><span>⭐ {course.rating} · 강의 {courses.filter(c=>c.instructorId===course.instructorId).length}개</span><Button variant="outline" onClick={()=>navigate("instructor",course.instructorId)}>강사 채널 보기</Button></aside></div></div>; }

function InstructorChannel({instructorId,navigate}:{instructorId:string;navigate:(v:ViewName,id?:string)=>void}) { const instructor=instructors.find(item=>item.id===instructorId)||instructors[0]; const own=courses.filter(course=>course.instructorId===instructor.id); const shown=own.length?own:courses.slice(0,3); return <div className="shell subpage"><BackButton onClick={()=>navigate("main")}/><section className="channel-hero"><span className="channel-avatar instructor-avatar" style={spritePosition(instructor.sprite,6)}/><div><span className="channel-label">쌤크 강사</span><h1>{instructor.name}</h1><p>{instructor.career} · {instructor.field}</p><div className="channel-stats"><b>⭐ {instructor.rating}<small>평균 평점</small></b><b>{shown.length}<small>등록 강의</small></b><b>{shown.reduce((sum,c)=>sum+c.reviews,0).toLocaleString()}명<small>누적 수강자</small></b></div></div></section><section className="channel-about"><h2>선생님 소개</h2><p>교실에서 직접 부딪히며 배운 작은 팁이 다른 선생님의 하루를 가볍게 만들 수 있다고 믿습니다. 현장에서 검증한 방법을 짧고 정확하게 나눕니다.</p><div><span># {instructor.field.split(" · ")[0]}</span><span># 교실실전</span><span># 바로적용</span></div></section><ContentSection title={`${instructor.name}의 강의`} courses={shown} navigate={navigate} bookmarks={[]} toggleBookmark={()=>undefined}/></div>; }

function RegistrationScreen({navigate,setNotice}:{navigate:(v:ViewName,id?:string)=>void;setNotice:(v:string)=>void}) { const [step,setStep]=useState(0); const labels=["기본정보","콘텐츠","자료","판매정보","권리 확인","미리보기"]; return <div className="shell subpage"><BackButton onClick={()=>navigate("main")} label="등록 취소"/><div className="workspace-head"><div><span>강사 스튜디오</span><h1>새 강의 등록</h1><p>임시저장 후 언제든 이어서 작성할 수 있어요.</p></div><Button variant="outline" onClick={()=>setNotice("임시저장했어요.")}>임시저장</Button></div><div className="registration-layout"><nav className="step-nav">{labels.map((label,index)=><button className={step===index?"active":index<step?"done":""} key={label} onClick={()=>setStep(index)}><i>{index<step?<Check/>:index+1}</i><span>{label}</span></button>)}</nav><section className="form-card"><div className="form-title"><span>STEP {step+1}</span><h2>{labels[step]}</h2></div>{step===0&&<div className="form-grid"><label className="wide">강의명<input defaultValue="아이들이 스스로 움직이는 교실 루틴"/></label><label>대상 연령<select defaultValue="유아"><option>유아</option><option>초등</option><option>공통</option></select></label><label>주제<select defaultValue="교실운영"><option>교실운영</option><option>놀이수업</option><option>학부모 상담</option></select></label><label className="wide">한 줄 소개<textarea defaultValue="환경 구성부터 정리까지, 현장에서 검증한 교실 루틴을 소개합니다."/></label><label className="wide">대표 이미지<div className="upload-zone"><Upload/><b>이미지를 끌어놓거나 클릭해 업로드</b><small>JPG, PNG · 권장 1280×720</small></div></label></div>}{step===1&&<div className="form-stack"><label>강의 영상<div className="upload-zone large"><CirclePlay/><b>MP4 영상을 업로드해 주세요</b><small>최대 2GB · 업로드 후 미리보기가 생성됩니다.</small></div></label><label>강의 구성<textarea defaultValue={"1. 교실 루틴이 필요한 이유\n2. 환경 구성과 시각 단서\n3. 아이들과 약속 만들기\n4. 실제 적용 사례"}/></label></div>}{step===2&&<div className="form-stack"><div className="upload-zone large"><Paperclip/><b>수업 자료를 추가해 주세요</b><small>PDF, PPTX, DOCX, ZIP</small></div><div className="file-item"><FileText/><span><b>교실루틴_체크리스트.pdf</b><small>2.4MB</small></span><button><X/></button></div></div>}{step===3&&<div className="form-grid"><label>판매 유형<select defaultValue="유료"><option>유료</option><option>무료</option></select></label><label>판매 가격<input defaultValue="32,000"/></label><div className="policy-note wide">적립률·가격 범위·환불 기간은 운영 정책 확정 후 안내됩니다.</div></div>}{step===4&&<div className="rights-list">{["영상과 자료의 저작권을 보유하고 있습니다.","등장 인물의 촬영 및 활용 동의를 받았습니다.","타인의 개인정보가 포함되지 않았음을 확인했습니다."].map(item=><label key={item}><Checkbox/> {item}</label>)}</div>}{step===5&&<div className="preview-box"><div className="preview-thumb course-thumb" style={spritePosition(0,4,2)}/><div><span className="tag tag-신규">미리보기</span><h3>아이들이 스스로 움직이는 교실 루틴</h3><p>환경 구성부터 정리까지, 현장에서 검증한 교실 루틴을 소개합니다.</p><b>김하늘 선생님</b></div></div>}<div className="form-actions"><Button variant="outline" disabled={step===0} onClick={()=>setStep(Math.max(0,step-1))}>이전</Button>{step<labels.length-1?<Button onClick={()=>setStep(step+1)}>다음 단계</Button>:<Button onClick={()=>{setNotice("승인 요청을 보냈어요. 내 강의 관리에서 상태를 확인해 주세요.");navigate("manage")}}>승인 요청</Button>}</div></section><aside className="registration-tip"><b>등록 가이드</b><p>핵심을 먼저 말하고, 한 강의에 하나의 문제 해결을 담아보세요.</p><a>좋은 강의 사례 보기 →</a></aside></div></div>; }

function ManageScreen({navigate}:{navigate:(v:ViewName,id?:string)=>void}) { const statuses=["전체","임시저장","승인 요청","검수중","승인","반려","판매중","판매중지"]; const [filter,setFilter]=useState(()=>typeof window!=="undefined"?(new URLSearchParams(window.location.search).get("status")||"전체"):"전체"); const shown=managementCourses.filter(item=>filter==="전체"||item.status===filter); return <div className="shell subpage"><BackButton onClick={()=>navigate("main")}/><div className="workspace-head"><div><span>강사 스튜디오</span><h1>내 강의 관리</h1><p>등록한 강의의 검수와 판매 상태를 관리하세요.</p></div><Button onClick={()=>navigate("register")}>+ 새 강의 등록</Button></div><div className="manage-summary">{[...courseStatuses.slice(0,2),["누적 강의",12] as const].map(([label,count])=><div key={label}><span>{label}</span><strong>{count}</strong></div>)}</div><div className="status-tabs">{statuses.map(status=><button className={filter===status?"active":""} key={status} onClick={()=>setFilter(status)}>{status}</button>)}</div><div className="manage-list"><div className="manage-head"><span>강의</span><span>상태</span><span>최근 수정</span><span>판매/평점</span><span>관리</span></div>{shown.length?shown.map((course,index)=><div className="manage-row" key={course.title}><div><span className="manage-thumb course-thumb" style={spritePosition(index,4,2)}/><b>{course.title}</b></div><span><i className={`status-pill status-${course.status}`}>{course.status}</i></span><span>{course.updated}</span><span>{course.sales?`${course.sales}건 · ⭐ ${course.rating}`:"-"}</span><button onClick={()=>navigate("register")}>수정</button></div>):<div className="no-results"><FileText/><h3>이 상태의 강의가 없어요</h3></div>}</div></div>; }

function ProfileScreen({navigate,setNotice}:{navigate:(v:ViewName,id?:string)=>void;setNotice:(v:string)=>void}) { return <div className="shell subpage"><BackButton onClick={()=>navigate("main")}/><div className="workspace-head"><div><span>강사 스튜디오</span><h1>내 프로필 관리</h1><p>강사 채널에 표시될 정보를 관리하세요.</p></div></div><div className="profile-edit-layout"><aside><span className="channel-avatar instructor-avatar" style={spritePosition(0,6)}/><Button variant="outline">프로필 사진 변경</Button><small>JPG 또는 PNG · 최대 5MB</small></aside><section className="form-card"><div className="form-grid"><label>강사명<input defaultValue="김하늘 선생님"/></label><label>경력<input defaultValue="유아교육 12년"/></label><label className="wide">전문분야<input defaultValue="놀이수업, 생활습관, 교실운영"/></label><label className="wide">소개<textarea defaultValue="교실에서 직접 실천하고 검증한 방법을 선생님들과 나눕니다."/></label></div><div className="form-actions"><Button variant="outline" onClick={()=>navigate("main")}>취소</Button><Button onClick={()=>{setNotice("프로필을 저장했어요.");navigate("main")}}>저장하기</Button></div></section></div></div>; }

function Footer({navigate}:{navigate:(v:ViewName,id?:string)=>void}) { return <footer><div className="shell"><button className="brand footer-brand" onClick={()=>navigate("main")}><b>쌤크</b><span>직무연수에서 만나는 선생님 노하우 플랫폼</span></button><div><a>서비스 소개</a><a>이용약관</a><a>개인정보처리방침</a><a>고객센터</a></div><p>본 화면은 쌤크 서비스 검토를 위한 인터랙티브 프로토타입입니다.</p></div></footer>; }
