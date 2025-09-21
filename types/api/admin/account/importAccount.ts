export type FailedUser = Record<string, string>;

export type ImportAccount = {
  failed_users: FailedUser[];
  successful_users: string[];
};
