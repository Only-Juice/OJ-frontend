export type UserInfo = {
  id: number;
  user_name: string;
  enable: boolean;
  email: string;
  is_public: boolean;
  is_admin: boolean;
};

export type UserProfile = {
  id: number;
  login: string;
  avatar_url: string;
};
