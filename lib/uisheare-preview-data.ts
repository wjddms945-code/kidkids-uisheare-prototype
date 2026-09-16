export type InstructorLevelName = "Starter" | "Creator" | "Mentor" | "Partner";

export const instructorLevel = { current: "Creator" as InstructorLevelName, next: "Mentor" as InstructorLevelName, progress: 72 };

export const instructorLevels = [
  { id:"starter", name:"Starter" as InstructorLevelName, meaning:"쌤크에서 첫 활동을 시작한 강사" },
  { id:"creator", name:"Creator" as InstructorLevelName, meaning:"꾸준히 강의를 만들고 공유하는 강사" },
  { id:"mentor", name:"Mentor" as InstructorLevelName, meaning:"많은 선생님에게 도움이 되는 콘텐츠를 만드는 강사" },
  { id:"partner", name:"Partner" as InstructorLevelName, meaning:"쌤크와 함께 성장하는 대표 강사" },
];

export const monthlyMissions = [
  { label:"강의 3개 등록하기", current:2, target:3 },
  { label:"누적 수강자 150명 달성", current:137, target:150 },
  { label:"리뷰 10개 받기", current:8, target:10 },
  { label:"키드키즈 자료 연계하기", current:8, target:10 },
];

export const missionBenefits = ["추가 적립 혜택", "성장 배지 획득", "추천 노출 기회"];

export const achievements = [
  { label:"첫 강의 등록", detail:"첫 강의를 등록했어요.", status:"달성했어요!", achieved:true, icon:"▶" },
  { label:"첫 판매 달성", detail:"첫 판매를 달성했어요.", status:"달성했어요!", achieved:true, icon:"₽" },
  { label:"수강자 100명", detail:"수강자 100명을 달성했어요.", status:"달성했어요!", achieved:true, icon:"人" },
  { label:"리뷰 10개", detail:"리뷰 10개를 받았어요.", status:"조금만 더!", achieved:true, icon:"★" },
  { label:"인기 강의 선정", detail:"인기 강의 선정까지 조금만 더 남았어요.", status:"도전해보세요!", achieved:false, icon:"▣" },
];

export const dashboardTrends: Record<string,string> = {
  "오늘 수강자":"↑ 어제보다 3명", "오늘 구매건수":"↑ 어제보다 1건", "새 리뷰":"이번 주 8개",
};

export const courseAchievementBadges: Record<string,string> = { c1:"베스트", c3:"만족도 높은 강의" };
