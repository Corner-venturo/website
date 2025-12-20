import { AuthMode } from "./types";

interface AuthModeSwitchProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export default function AuthModeSwitch({ mode, onModeChange }: AuthModeSwitchProps) {
  return (
    <div className="text-center mt-8 space-y-3">
      {mode === "login" && (
        <>
          <p className="text-[#949494]">
            還沒有帳號？{" "}
            <button
              type="button"
              onClick={() => onModeChange("register")}
              className="text-[#cfb9a5] hover:text-[#b09b88] font-medium transition"
            >
              立即註冊
            </button>
          </p>
          <p className="text-[#949494]">
            <button
              type="button"
              onClick={() => onModeChange("leader")}
              className="text-[#a5bccf] hover:text-[#8aa3b8] font-medium transition"
            >
              領隊專區登入
            </button>
          </p>
        </>
      )}
      {mode === "register" && (
        <p className="text-[#949494]">
          已經有帳號？{" "}
          <button
            type="button"
            onClick={() => onModeChange("login")}
            className="text-[#cfb9a5] hover:text-[#b09b88] font-medium transition"
          >
            立即登入
          </button>
        </p>
      )}
      {mode === "forgot" && (
        <button
          type="button"
          onClick={() => onModeChange("login")}
          className="text-[#cfb9a5] hover:text-[#b09b88] font-medium transition"
        >
          返回登入
        </button>
      )}
      {mode === "leader" && (
        <button
          type="button"
          onClick={() => onModeChange("login")}
          className="text-[#cfb9a5] hover:text-[#b09b88] font-medium transition"
        >
          返回一般登入
        </button>
      )}
    </div>
  );
}
