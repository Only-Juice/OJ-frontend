export type QuestionSubmitResult = {
  score: number;
  message: string;
  judge_time: string;
  question_id: number;
};

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

export type ExamQuestion = {
  question: Question;
  point: number;
  has_question: boolean;
};
