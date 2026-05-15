import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// THAY THẾ 2 THÔNG SỐ NÀY BẰNG CỦA BẠN
const supabaseUrl = 'https://pbafvmamlnpvwoznjsvq.supabase.co'
const supabaseKey = 'sb_publishable_Ew0PEfwY-EHVQFVOXeZMmA_EDwnDudj'
const supabase = createClient(supabaseUrl, supabaseKey)
// Link gốc đến folder chứa ảnh trong Bucket của bạn
const storageUrl = "https://pbafvmamlnpvwoznjsvq.supabase.co/storage/v1/object/public/avatars/";

function App() {
  const [employees, setEmployees] = useState([])

  // 4a. Hàm lấy danh sách nhân viên
  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('Employee')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) console.error('Lỗi lấy dữ liệu:', error)
    else setEmployees(data)
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  // 4b. Hàm xóa nhân viên
  const deleteEmployee = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      const { error } = await supabase.from('Employee').delete().eq('id', id)
      if (error) alert('Lỗi khi xóa!')
      else fetchEmployees() // Load lại danh sách sau khi xóa
    }
  }

  // 4c. Hàm cập nhật tên nhân viên
  const updateEmployee = async (id, currentName) => {
    const newName = prompt("Nhập tên mới cho nhân viên:", currentName)
    if (newName && newName !== currentName) {
      const { error } = await supabase
        .from('Employee')
        .update({ name: newName })
        .eq('id', id)
      
      if (error) alert('Lỗi khi cập nhật!')
      else fetchEmployees() // Load lại danh sách sau khi sửa
    }
  }

  // Hàm định dạng ngày tháng dd/MM/yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN') // Trả về định dạng dd/mm/yyyy
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Quản lý Nhân viên</h1>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>Ảnh</th>
            <th>Họ và Tên</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td style={{ padding: '8px' }}>
                <img 
                  src={`${storageUrl}${emp.avatar}`} 
                  alt={emp.name} 
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              </td>
              <td style={{ padding: '8px' }}>{emp.name}</td>
              <td style={{ padding: '8px' }}>{formatDate(emp.created_at)}</td>
              <td style={{ padding: '8px' }}>
                <button onClick={() => updateEmployee(emp.id, emp.name)} style={{ marginRight: '10px' }}>Sửa</button>
                <button onClick={() => deleteEmployee(emp.id)} style={{ color: 'red' }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App