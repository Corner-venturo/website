'use client';

import Link from "next/link";

interface EmployeeStatusProps {
  isEmployee: boolean;
  employeeNumber?: string | null;
  employeeRoles?: string[];
}

const roleNames: Record<string, string> = {
  leader: '領隊',
  manager: '主管',
  admin: '管理員',
  staff: '員工',
};

function formatRole(role: string): string {
  return roleNames[role] || role;
}

export default function EmployeeStatus({
  isEmployee,
  employeeNumber,
  employeeRoles = [],
}: EmployeeStatusProps) {
  if (isEmployee) {
    // 已驗證員工
    return (
      <Link
        href="/my/employee-verify"
        className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 backdrop-blur-xl rounded-2xl border border-emerald-200/50 shadow-sm p-4 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <span className="material-icons-round">badge</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700 text-sm">員工</span>
              <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                {employeeNumber}
              </span>
            </div>
            {employeeRoles.length > 0 && (
              <div className="flex gap-1 mt-1">
                {employeeRoles.map(role => (
                  <span
                    key={role}
                    className="text-[10px] text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded"
                  >
                    {formatRole(role)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <span className="material-icons-round text-emerald-400 text-xl">verified</span>
      </Link>
    );
  }

  // 未驗證
  return (
    <Link
      href="/my/employee-verify"
      className="w-full bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-4 flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E8E2DD] flex items-center justify-center text-[#949494] group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
          <span className="material-icons-round">shield</span>
        </div>
        <div>
          <span className="font-bold text-[#5C5C5C] text-sm">員工驗證</span>
          <p className="text-[10px] text-[#949494]">驗證身分以使用員工功能</p>
        </div>
      </div>
      <span className="material-icons-round text-[#949494] text-xl">chevron_right</span>
    </Link>
  );
}
