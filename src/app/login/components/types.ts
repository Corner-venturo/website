export type AuthMode = "login" | "register" | "forgot" | "leader";

export interface AuthTitles {
  title: string;
  subtitle: string;
}

export const titles: Record<AuthMode, AuthTitles> = {
  login: { title: "歡迎回來", subtitle: "登入以繼續你的旅程" },
  register: { title: "開始冒險", subtitle: "建立帳號，探索無限可能" },
  forgot: { title: "忘記密碼", subtitle: "輸入信箱，我們將寄送重設連結" },
  leader: { title: "領隊登入", subtitle: "使用身份證字號登入" },
};
