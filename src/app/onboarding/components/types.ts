export interface FormData {
  full_name: string;
  display_name: string;
  phone: string;
  location: string;
  bio: string;
}

export interface FormErrors {
  full_name?: string;
  display_name?: string;
  phone?: string;
}
