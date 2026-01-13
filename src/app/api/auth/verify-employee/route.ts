import { NextResponse } from 'next/server'
import { getSupabase, getErpSupabase } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'

export interface VerifyEmployeeRequest {
  national_id: string
}

export interface VerifyEmployeeResponse {
  success: boolean
  employee?: {
    id: string
    employee_number: string
    name: string
    roles: string[]
  }
  error?: string
}

// POST /api/auth/verify-employee - 驗證員工身份
export async function POST(request: Request) {
  try {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      )
    }

    const { national_id }: VerifyEmployeeRequest = await request.json()

    if (!national_id) {
      return NextResponse.json(
        { success: false, error: '請輸入身分證字號' },
        { status: 400 }
      )
    }

    // 檢查是否已經驗證為員工
    const { data: profile } = await supabase
      .from('profiles')
      .select('employee_id')
      .eq('id', user.id)
      .single()

    if (profile?.employee_id) {
      return NextResponse.json(
        { success: false, error: '您已經完成員工驗證' },
        { status: 400 }
      )
    }

    // 查詢 ERP 員工表
    const erpSupabase = getErpSupabase()
    const { data: employees, error: queryError } = await erpSupabase
      .from('employees')
      .select('id, employee_number, chinese_name, english_name, personal_info, roles')
      .limit(200)

    if (queryError) {
      logger.error('Query employees error:', queryError)
      return NextResponse.json(
        { success: false, error: '系統錯誤，請稍後再試' },
        { status: 500 }
      )
    }

    // 找到符合身份證字號的員工
    const employee = employees?.find(
      (emp) => emp.personal_info?.national_id?.toUpperCase() === national_id.toUpperCase()
    )

    if (!employee) {
      return NextResponse.json(
        { success: false, error: '查無此員工資料，請確認身分證字號是否正確' },
        { status: 404 }
      )
    }

    // 檢查此員工是否已被其他帳號綁定
    const { data: existingBinding } = await supabase
      .from('profiles')
      .select('id')
      .eq('employee_id', employee.id)
      .neq('id', user.id)
      .maybeSingle()

    if (existingBinding) {
      return NextResponse.json(
        { success: false, error: '此員工已綁定其他帳號' },
        { status: 409 }
      )
    }

    // 更新 profile，綁定員工資訊
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        employee_id: employee.id,
        employee_number: employee.employee_number,
        employee_roles: employee.roles || [],
        employee_verified_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      logger.error('Update profile error:', updateError)
      return NextResponse.json(
        { success: false, error: '綁定失敗，請稍後再試' },
        { status: 500 }
      )
    }

    const employeeName = employee.chinese_name || employee.english_name || employee.employee_number

    logger.log(`Employee verified: ${user.id} -> ${employee.employee_number}`)

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        employee_number: employee.employee_number,
        name: employeeName,
        roles: employee.roles || [],
      },
    })
  } catch (error) {
    logger.error('Verify employee error:', error)
    return NextResponse.json(
      { success: false, error: '驗證失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

// GET /api/auth/verify-employee - 檢查當前用戶的員工狀態
export async function GET() {
  try {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      )
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('employee_id, employee_number, employee_roles, employee_verified_at')
      .eq('id', user.id)
      .single()

    if (error) {
      logger.error('Get profile error:', error)
      return NextResponse.json(
        { success: false, error: '查詢失敗' },
        { status: 500 }
      )
    }

    if (!profile?.employee_id) {
      return NextResponse.json({
        success: true,
        is_employee: false,
      })
    }

    return NextResponse.json({
      success: true,
      is_employee: true,
      employee: {
        id: profile.employee_id,
        employee_number: profile.employee_number,
        roles: profile.employee_roles || [],
        verified_at: profile.employee_verified_at,
      },
    })
  } catch (error) {
    logger.error('Check employee status error:', error)
    return NextResponse.json(
      { success: false, error: '查詢失敗' },
      { status: 500 }
    )
  }
}
