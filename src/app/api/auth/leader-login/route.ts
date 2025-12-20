import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 使用 ERP Supabase 的 Service Role Key 來查詢員工資料
const erpSupabase = createClient(
  process.env.ERP_SUPABASE_URL!,
  process.env.ERP_SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { national_id, password } = await request.json()

    if (!national_id || !password) {
      return NextResponse.json(
        { error: '請輸入身份證字號和密碼' },
        { status: 400 }
      )
    }

    // 使用 ERP Supabase 查詢員工資料
    const { data: employees, error: queryError } = await erpSupabase
      .from('employees')
      .select('id, employee_number, chinese_name, english_name, personal_info, roles')
      .limit(100) // 取得所有員工來比對

    if (queryError) {
      console.error('Query error:', queryError)
      return NextResponse.json(
        { error: '系統錯誤，請稍後再試' },
        { status: 500 }
      )
    }

    // 找到符合身份證字號的員工
    const employee = employees?.find(
      (emp) => emp.personal_info?.national_id === national_id
    )

    if (!employee) {
      return NextResponse.json(
        { error: '身份證字號不存在' },
        { status: 401 }
      )
    }

    // 使用員工編號建構 Supabase Auth 信箱
    const authEmail = `${employee.employee_number.toLowerCase()}@venturo.com`

    // 使用 ERP Supabase Auth 驗證密碼
    const { data: authData, error: authError } = await erpSupabase.auth.signInWithPassword({
      email: authEmail,
      password: password,
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: '密碼錯誤' },
        { status: 401 }
      )
    }

    // 回傳成功資訊（不含敏感資料）
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authEmail,
        employee_id: employee.id,
        employee_number: employee.employee_number,
        name: employee.chinese_name || employee.english_name,
        roles: employee.roles || [],
      },
      session: authData.session,
    })
  } catch (error) {
    console.error('Leader login error:', error)
    return NextResponse.json(
      { error: '登入失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
