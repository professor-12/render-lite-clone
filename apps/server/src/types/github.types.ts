export interface GithubTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

export interface GithubUserResponse {
  id: number;
  login: string;
  avatar_url: string;
  email: string | null;
  name: string | null;
}

export interface GithubUserData {
  id: number;
  login: string;
  avatar_url: string;
  name: string;
  email: string | null;
}

export interface GithubInstallationAccount {
  id: number;
  login?: string;
  slug?: string;
  type?: string;
  avatar_url?: string;
}

export interface GithubInstallationResponse {
  id: number;
  account: GithubInstallationAccount | null;
  app_id: number;
  target_type: string;
  permissions: Record<string, string>;
  events: string[];
  created_at: string;
  updated_at: string;
}

export interface GithubInstallationTokenResponse {
  token: string;
  expires_at: string;
  permissions: Record<string, string>;
}

export interface GithubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  default_branch: string;
  language: string | null;
}

export interface GithubInstallationReposResponse {
  total_count: number;
  repositories: GithubRepository[];
}
