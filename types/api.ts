// 單個題目頁面的上結果
export type SubmitResult = {
  score: number;
  message: string;
  judge_time: string;
};

// dashboard 上的上傳結果
export type SubmitResultOnDashboard = {
  score: number;
  message: string;
  judge_time: string;
  question_title: string;
  question_id: number;
};

// 全部題目畫面的題目
export type Question = {
  id: number;
  title: string;
  description: string;
  git_repo_url: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  has_question: boolean;
  top_score: number;
};

// 考試頁面的題目
export type ExamQuestion = {
  question: Question;
  point: number;
  has_question: boolean;
  top_score: number;
};

type QuestionOperate = "delete" | "update" | "create";

// 考試頁面的題目
export type ExamQuestionInAdmin = {
  question: Question;
  point: number;
  has_question: boolean;
  isInDb: boolean;
  operate: QuestionOperate;
};

// 使用者
export type Account = {
  id: number;
  email: string;
  enable: boolean;
  user_name: string;
  is_public: boolean;
  is_admin: boolean;
};

// 考試
export type Exam = {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
};

// 排名
export type Rank = {
  user_name: string;
  total_score: number;
  question_scores: Array<{
    git_user_repo_url: string;
    question_id: number;
    question_title: string;
    score: number;
  }>;
};

// 上傳結果的 message
export type TestSuiteSummary = {
  name: string;
  tests: number;
  failures: number;
  disabled: number;
  errors: number;
  timestamp: string; // ISO datetime string
  time: string;
  maxscore: number;
  getscore: number;
  testsuite: TestCase[];
};

export type TestCase = {
  name: string;
  file: string;
  line: number;
  status: string;
  result: string;
  timestamp: string; // ISO datetime string
  time: string;
  classname: string;
  failures?: Failure[];
};

export type Failure = {
  failure: string;
  type: string;
};

export type GiteaPublicKey = {
  id: number;
  title: string;
  key: string;
};
