export type PublicQuestion = {
  id: number;
  title: string;
  description: string;
  readme: string;
  git_repo_url: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type UserQuestion = {
  title: string;
  description: string;
  readme: string;
  git_repo_url: string;
  parent_git_repo_url: string;
  uqr_id: number;
};
