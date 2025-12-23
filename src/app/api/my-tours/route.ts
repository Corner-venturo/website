import { NextResponse } from 'next/server'
import { getErpSupabase } from '@/lib/supabase-server'

export const revalidate = 0; // Force dynamic rendering, no caching

export async function GET(request: Request) {
  try {
    const erpSupabase = getErpSupabase()

    // 從 Authorization header 取得 token
    const authHeader = request.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]

    // 驗證 token 並取得用戶資訊
    const { data: { user }, error: authError } = await erpSupabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: '無效的 token' },
        { status: 401 }
      )
    }

    // 從 email 取得員工編號（格式：e001@venturo.com）
    const employeeNumber = user.email?.split('@')[0]?.toUpperCase()

    if (!employeeNumber) {
      return NextResponse.json(
        { error: '無法識別員工' },
        { status: 400 }
      )
    }

    // 查詢員工資訊
    const { data: employee, error: empError } = await erpSupabase
      .from('employees')
      .select('id, employee_number, chinese_name, roles')
      .eq('employee_number', employeeNumber)
      .single()

    if (empError || !employee) {
      return NextResponse.json(
        { error: '找不到員工資料' },
        { status: 404 }
      )
    }

    // 查詢該員工被指派的團（領隊）
    // 團資料中可能有 leader_id 或 leader_employee_number 欄位
    const { data: tours, error: toursError } = await erpSupabase
      .from('tours')
      .select(`
        id,
        code,
        name,
        status,
        start_date,
        end_date,
        destination,
        locked_quote_id,
        locked_itinerary_id,
        locked_at
      `)
      .or(`leader_id.eq.${employee.id},leader_employee_number.eq.${employee.employee_number}`)
      .order('start_date', { ascending: false })

    if (toursError) {
      console.error('Error fetching tours:', toursError)
      return NextResponse.json(
        { error: '無法取得團資料' },
        { status: 500 }
      )
    }

    // 區分進行中和已結束的團
    const now = new Date()
    const activeTours = (tours || []).filter(t => {
      const endDate = t.end_date ? new Date(t.end_date) : null
      return !endDate || endDate >= now
    })
    const pastTours = (tours || []).filter(t => {
      const endDate = t.end_date ? new Date(t.end_date) : null
      return endDate && endDate < now
    })

    return NextResponse.json({
      success: true,
      data: {
        employee: {
          id: employee.id,
          employee_number: employee.employee_number,
          name: employee.chinese_name,
          roles: employee.roles,
        },
        activeTours,
        pastTours,
        total: (tours || []).length,
      },
    })
  } catch (error) {
    console.error('My tours error:', error)
    return NextResponse.json(
      { error: '取得我的團資料失敗' },
      { status: 500 }
    )
  }
}
