import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

// THAY THẾ 2 THÔNG SỐ NÀY BẰNG CỦA BẠN
const supabaseUrl = 'https://pbafvmamlnpvwoznjsvq.supabase.co'
const supabaseKey = 'sb_publishable_Ew0PEfwY-EHVQFVOXeZMmA_EDwnDudj'
const supabase = createClient(supabaseUrl, supabaseKey)
// Link gốc đến folder chứa ảnh trong Bucket của bạn
const storageUrl = "https://pbafvmamlnpvwoznjsvq.supabase.co/storage/v1/object/public/avatars/"

// ==================== TOAST COMPONENT ====================
function Toast({ toasts }) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role="alert">
          <span className="toast-icon">{t.type === 'success' ? '✓' : '✗'}</span>
          <span className="toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ==================== EDIT MODAL ====================
function EditModal({ employee, onClose, onConfirm }) {
  const [newName, setNewName] = useState(employee?.name || '')

  const handleConfirm = () => {
    if (newName.trim() && newName.trim() !== employee.name) {
      onConfirm(employee.id, newName.trim())
    }
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon modal-icon-edit" aria-hidden="true">✏️</div>
          <div>
            <div className="modal-title" id="edit-modal-title">Chỉnh sửa nhân viên</div>
            <div className="modal-subtitle">Cập nhật thông tin cá nhân</div>
          </div>
        </div>
        <div className="modal-body">
          <label className="modal-label" htmlFor="edit-name-input">Họ và tên</label>
          <input
            id="edit-name-input"
            className="modal-input"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="Nhập tên mới..."
          />
        </div>
        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose} id="edit-cancel-btn">Hủy bỏ</button>
          <button
            className="btn-modal-confirm btn-modal-confirm-edit"
            onClick={handleConfirm}
            disabled={!newName.trim() || newName.trim() === employee.name}
            id="edit-confirm-btn"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== DELETE MODAL ====================
function DeleteModal({ employee, onClose, onConfirm }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon modal-icon-delete" aria-hidden="true">🗑️</div>
          <div>
            <div className="modal-title" id="delete-modal-title">Xóa nhân viên</div>
            <div className="modal-subtitle">Hành động này không thể hoàn tác</div>
          </div>
        </div>
        <div className="modal-body">
          <p className="modal-desc">
            Bạn có chắc chắn muốn xóa nhân viên <strong>{employee?.name}</strong> khỏi hệ thống?
          </p>
          <p className="modal-warning">⚠️ Dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
        </div>
        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose} id="delete-cancel-btn">Hủy bỏ</button>
          <button
            className="btn-modal-confirm btn-modal-confirm-delete"
            onClick={() => { onConfirm(employee.id); onClose() }}
            id="delete-confirm-btn"
          >
            Xóa nhân viên
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== EMPLOYEE CARD ====================
function EmployeeCard({ emp, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false)
  const initials = emp.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || '?'

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <article className="employee-card">
      <div className="avatar-wrapper">
        <div className="avatar-ring" aria-hidden="true" />
        {!imgError ? (
          <img
            className="employee-avatar"
            src={`${storageUrl}${emp.avatar}`}
            alt={`Ảnh đại diện của ${emp.name}`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="avatar-fallback" aria-label={`Avatar ${emp.name}`}>{initials}</div>
        )}
      </div>

      <div className="employee-info">
        <h2 className="employee-name">{emp.name}</h2>
        <div className="employee-meta">
          <span aria-label="Ngày tham gia">📅</span>
          <span>Tham gia {formatDate(emp.created_at)}</span>
        </div>
        <span className="employee-id-badge">ID #{emp.id}</span>
      </div>

      <div className="card-actions">
        <button
          className="btn btn-edit"
          onClick={() => onEdit(emp)}
          id={`edit-btn-${emp.id}`}
          aria-label={`Chỉnh sửa ${emp.name}`}
        >
          ✏️ Sửa
        </button>
        <button
          className="btn btn-delete"
          onClick={() => onDelete(emp)}
          id={`delete-btn-${emp.id}`}
          aria-label={`Xóa ${emp.name}`}
        >
          🗑️ Xóa
        </button>
      </div>
    </article>
  )
}

// ==================== MAIN APP ====================
function App() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toasts, setToasts] = useState([])

  // ---- Toast helper ----
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  // ---- Fetch employees ----
  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('Employee')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('Lỗi lấy dữ liệu:', error)
      showToast('Không thể tải danh sách nhân viên!', 'error')
    } else {
      setEmployees(data)
    }
    setLoading(false)
  }, [showToast])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // ---- Delete employee ----
  const handleDeleteConfirm = async (id) => {
    const { error } = await supabase.from('Employee').delete().eq('id', id)
    if (error) {
      showToast('Lỗi khi xóa nhân viên!', 'error')
    } else {
      showToast('Đã xóa nhân viên thành công ✓')
      fetchEmployees()
    }
  }

  // ---- Update employee name ----
  const handleEditConfirm = async (id, newName) => {
    const { error } = await supabase
      .from('Employee')
      .update({ name: newName })
      .eq('id', id)

    if (error) {
      showToast('Lỗi khi cập nhật thông tin!', 'error')
    } else {
      showToast('Cập nhật tên thành công ✓')
      fetchEmployees()
    }
  }

  // ---- Filtered list ----
  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="app-wrapper">
      {/* ---- NAVBAR ---- */}
      <header>
        <nav className="navbar" role="navigation" aria-label="Thanh điều hướng chính">
          <div className="navbar-brand">
            <div className="navbar-icon" aria-hidden="true">👥</div>
            <div>
              <div className="navbar-title">HR Portal</div>
              <div className="navbar-subtitle">Quản lý Nhân viên</div>
            </div>
          </div>
          <div className="navbar-badge" aria-label={`${employees.length} nhân viên`}>
            {employees.length} nhân viên
          </div>
        </nav>
      </header>

      {/* ---- MAIN ---- */}
      <main className="main-content">
        {/* Stats bar */}
        <div className="stats-bar" role="region" aria-label="Thống kê tổng quan">
          <div className="stat-card">
            <span className="stat-icon" aria-hidden="true">🏢</span>
            <div>
              <div className="stat-value">{employees.length}</div>
              <div className="stat-label">Tổng nhân viên</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon" aria-hidden="true">🔍</span>
            <div>
              <div className="stat-value">{filteredEmployees.length}</div>
              <div className="stat-label">Kết quả tìm kiếm</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon" aria-hidden="true">📅</span>
            <div>
              <div className="stat-value">
                {employees.length > 0
                  ? new Date(Math.max(...employees.map(e => new Date(e.created_at)))).toLocaleDateString('vi-VN')
                  : '—'}
              </div>
              <div className="stat-label">Thêm mới nhất</div>
            </div>
          </div>
        </div>

        {/* Section header */}
        <div className="section-header">
          <h1 className="section-title">Danh sách Nhân viên</h1>
          <div className="search-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              className="search-input"
              type="search"
              id="employee-search"
              placeholder="Tìm kiếm nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm nhân viên theo tên"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-wrapper" role="status" aria-live="polite">
            <div className="loading-spinner" aria-hidden="true" />
            <p className="loading-text">Đang tải danh sách nhân viên...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state" role="status">
            <div className="empty-icon" aria-hidden="true">
              {searchQuery ? '🔍' : '👥'}
            </div>
            <p className="empty-title">
              {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có nhân viên nào'}
            </p>
            <p className="empty-desc">
              {searchQuery
                ? `Không có nhân viên nào khớp với "${searchQuery}"`
                : 'Danh sách nhân viên hiện đang trống.'}
            </p>
          </div>
        ) : (
          <div
            className="employee-grid"
            role="list"
            aria-label="Danh sách thẻ nhân viên"
          >
            {filteredEmployees.map((emp) => (
              <div key={emp.id} role="listitem">
                <EmployeeCard
                  emp={emp}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ---- FOOTER ---- */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} HR Portal · Được xây dựng với React & Supabase</p>
      </footer>

      {/* ---- MODALS ---- */}
      {editTarget && (
        <EditModal
          employee={editTarget}
          onClose={() => setEditTarget(null)}
          onConfirm={handleEditConfirm}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          employee={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* ---- TOASTS ---- */}
      <Toast toasts={toasts} />
    </div>
  )
}

export default App