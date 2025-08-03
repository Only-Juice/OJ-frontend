// 題目上傳結果
export type QuestionSubmitResult = {
  score: number;
  message: string;
  judge_time: string;
  question_id: number;
};

// 題目
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
};

// 使用者
export type Account = {
  id: number;
  email: string;
  enable: boolean;
  user_name: string;
  is_public: boolean;
};
