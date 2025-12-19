export interface FormData {
  full_name: string;
  display_name: string;
  username: string;
  phone: string;
  location: string;
  bio: string;
}

export interface FormErrors {
  full_name?: string;
  display_name?: string;
  username?: string;
  phone?: string;
}
