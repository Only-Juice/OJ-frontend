export type PublicQuestion = {
  id: number;
  title: string;
  description: string;
  readme: string;
  git_repo_url: string;
  start_time: string;
  end_time: string;
};

export type UserQuestion = {
  title: string;
  description: string;
  readme: string;
  git_repo_url: string;
  parent_git_repo_url: string;
  uqr_id: number;
};
