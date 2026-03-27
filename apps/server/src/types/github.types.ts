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
