import { useEffect, useState } from 'react'
import { AdminNavigation } from '../../components/adminNavigation'
import { addLocalCustomer, fetchCustomers, getLocalCustomerRecords, removeCustomerFromDirectory, updateCustomerRecord } from '../../services/customers'
import { AdminModal } from '../../components/AdminModal'
import { FaEdit, FaFilter, FaInfoCircle, FaPlus, FaSearch, FaTrash, FaUserCircle, FaUserShield, FaUsers } from 'react-icons/fa'
import './admin.css'
import './customersDashboard.css'

const DUMMYJSON_ROLES = ['admin', 'moderator', 'user']
const emptyUserForm = { name: '', email: '', username: '', role: 'user', password: '', status: 'Active', image: '', phone: '' }

export function CustomersPage() {
  const [customers, setCustomers] = useState(getLocalCustomerRecords)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [form, setForm] = useState(emptyUserForm)
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editorUser, setEditorUser] = useState(null)
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const pageSize = 4

  useEffect(() => {
    const controller = new AbortController()
    fetchCustomers(controller.signal, { page, limit: pageSize, search, role: roleFilter })
      .then((result) => { setCustomers(result.customers); setTotal(result.total); setApiError('') })
      .catch((error) => { if (error.name !== 'AbortError') setApiError('DummyJSON users could not be loaded. Locally added customer records are still available.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [page, search, roleFilter])

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submitCustomer = (event) => {
    event.preventDefault()
    const email = form.email.trim().toLowerCase()
    if (customers.some((customer) => customer.id !== editorUser?.id && customer.email?.toLowerCase() === email)) {
      setFormError('A user with this email is already listed.')
      return
    }
    try {
      const [firstName, ...lastNames] = form.name.trim().split(/\s+/)
      const userData = { ...form, email, firstName, lastName: lastNames.join(' '), name: form.name.trim(), username: form.username.trim() }
      if (editorUser) {
        const updated = updateCustomerRecord({ ...editorUser, ...userData })
        setCustomers((current) => current.map((item) => item.id === editorUser.id ? { ...item, ...updated } : item))
      } else {
        const customer = addLocalCustomer(userData)
        setCustomers((current) => [customer, ...current])
        setTotal((current) => current + 1)
      }
      setForm(emptyUserForm)
      setEditorUser(null)
      setUserModalOpen(false)
      setFormError('')
    } catch {
      setFormError('Customer could not be saved in this browser.')
    }
  }

  const filtered = customers
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const paginationPages = pageCount <= 5 ? Array.from({ length: pageCount }, (_, index) => index + 1)
    : page <= 3 ? [1, 2, 3, 'ellipsis', pageCount]
      : page >= pageCount - 2 ? [1, 'ellipsis', pageCount - 2, pageCount - 1, pageCount]
        : [1, 'ellipsis-start', page - 1, page, page + 1, 'ellipsis-end', pageCount]
  const activeOnPage = customers.filter((customer) => customer.status !== 'Inactive').length
  const adminsOnPage = customers.filter((customer) => customer.role === 'admin').length
  const moderatorsOnPage = customers.filter((customer) => customer.role === 'moderator').length
  const changeSearch = (value) => { setLoading(true); setPage(1); setRoleFilter(''); setSearch(value) }
  const changeRole = (value) => { setLoading(true); setPage(1); setSearch(''); setRoleFilter(value) }
  const changePage = (nextPage) => { setLoading(true); setPage(nextPage) }

  const removeCustomer = (customer) => {
    removeCustomerFromDirectory(customer)
    setCustomers((current) => current.filter((item) => item.id !== customer.id))
    setTotal((current) => Math.max(0, current - 1))
  }

  const openCreateModal = () => { setEditorUser(null); setForm(emptyUserForm); setFormError(''); setUserModalOpen(true) }
  const openEditModal = (customer) => {
    setEditorUser(customer)
    setForm({ ...emptyUserForm, ...customer, name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(), password: '' })
    setFormError('')
    setUserModalOpen(true)
  }
  const closeEditor = () => { setEditorUser(null); setForm(emptyUserForm); setFormError(''); setUserModalOpen(false) }
  const uploadUserImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) { setFormError('Choose an image file up to 2 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  return <>
    <main className="admin-page customers-page">
      <header className="customers-heading">
        <div><h1>User Directory</h1><p>Manage accounts, roles, and access across ShopStream.</p></div>
        <div className="customers-header-tools">
          <label className="customers-search"><FaSearch aria-hidden="true" /><input type="search" value={search} onChange={(event) => changeSearch(event.target.value)} placeholder="Search users..." /></label>
          <div className="customers-filter-wrap"><button className="customers-filter-button" type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><FaFilter /> Filter</button>{filtersOpen && <label className="customers-filter-popover">Role<select value={roleFilter} onChange={(event) => changeRole(event.target.value)}><option value="">All roles</option>{DUMMYJSON_ROLES.map((role) => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}</select></label>}</div>
          <button className="customers-add-button" type="button" onClick={openCreateModal}><FaPlus /> Add New User</button>
        </div>
      </header>
      <AdminNavigation linksToShow={['/admin/inventory', '/admin/orders', '/admin/customers']} />
      <section className="customers-metrics" aria-label="User directory summary">
        <article><span className="customers-metric-icon metric-total"><FaUsers /></span><div><small>TOTAL USERS</small><strong>{total.toLocaleString('en-US')}</strong></div></article>
        <article><span className="customers-metric-icon metric-admin"><FaUserShield /></span><div><small>ADMINS IN VIEW</small><strong>{adminsOnPage}</strong></div></article>
        <article><span className="customers-metric-icon metric-active"><FaUsers /></span><div><small>ACTIVE IN VIEW</small><strong>{activeOnPage}</strong></div></article>
        <article><span className="customers-metric-icon metric-local"><FaUserCircle /></span><div><small>LOCAL ACCOUNTS</small><strong>{customers.filter((customer) => customer.source === 'local').length}</strong></div></article>
      </section>
      <section className="admin-catalog-section" aria-label={`User directory, page ${page} of ${pageCount}`}>
        <div className="admin-section-heading admin-catalog-heading"><div><h2>User directory</h2><p>{total} users · Page {page}</p></div><button className="admin-modal-button admin-modal-button-primary" type="button" onClick={openCreateModal}><FaPlus /> Add New User</button></div>
        <div className="user-directory-filters"><label className="admin-search">Search users<input type="search" value={search} onChange={(event) => changeSearch(event.target.value)} placeholder="Name, email, username" /></label><label className="admin-search">Role<select value={roleFilter} onChange={(event) => changeRole(event.target.value)}><option value="">All roles</option>{DUMMYJSON_ROLES.map((role) => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}</select></label></div>
        {loading && <p role="status" className="admin-loading">Loading DummyJSON users...</p>}
        {apiError && <p role="alert" className="admin-api-error">{apiError}</p>}
        <div className="customers-directory-layout"><div className="customers-directory-main"><div className="customers-table-head"><span>USER</span><span>STATUS</span><span>ROLE</span><span>ACTIONS</span></div>
        <div className="customer-list">{filtered.map((customer) => <article className="customer-row" key={`${customer.source}-${customer.id}`}>
          {customer.image ? <img src={customer.image} alt="" loading="lazy" /> : <span className="customer-avatar">{customer.name?.charAt(0) || '?'}</span>}
          <div><strong>{customer.name}</strong><span>{customer.email}</span><small>{customer.username}{customer.company ? ` · ${customer.company}` : ''}</small></div>
          <span className={`customer-status ${(customer.status || 'Active') === 'Inactive' ? 'customer-status-inactive' : ''}`}><i />{customer.status || 'Active'}</span>
          <span className={`customer-role customer-role-${customer.role || 'user'}`}>{customer.role || 'user'}</span>
          <div className="customer-actions"><button className="customer-edit-icon" type="button" onClick={() => openEditModal(customer)} aria-label={`Edit ${customer.name}`} title="Edit user"><FaEdit /></button><button className="customer-delete-icon" type="button" onClick={() => setDeleteTarget(customer)} aria-label={`Remove ${customer.name}`} title="Remove user"><FaTrash /></button></div>
        </article>)}
        {!loading && filtered.length === 0 && <p className="admin-empty-state">No users match this search.</p>}
        <div className="customers-pager"><span>Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}</span><div><button type="button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => changePage(page - 1)}>‹</button>{paginationPages.map((pageNumber, index) => pageNumber.toString().startsWith('ellipsis') ? <span key={`${pageNumber}-${index}`}>…</span> : <button className={page === pageNumber ? 'active' : ''} type="button" key={pageNumber} disabled={loading} onClick={() => changePage(pageNumber)}>{pageNumber}</button>)}<button type="button" aria-label="Next page" disabled={page >= pageCount || loading} onClick={() => changePage(page + 1)}>›</button></div></div>
        <div className="customer-pagination"><button type="button" disabled={page <= 1 || loading} onClick={() => changePage(page - 1)}>Previous</button><span>{Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}</span><button type="button" disabled={page * pageSize >= total || loading} onClick={() => changePage(page + 1)}>Next</button></div>
      </div></div><aside className="customers-system-stats"><h3>System Stats</h3><p>Roles represented on this page</p><div><span><FaUserShield /> Admin</span><strong>{adminsOnPage}</strong></div><div><span><FaUsers /> Moderator</span><strong>{moderatorsOnPage}</strong></div><div><span><FaUsers /> User</span><strong>{Math.max(0, customers.length - adminsOnPage - moderatorsOnPage)}</strong></div><div className="customers-source-stat"><span>Active on this page</span><strong>{activeOnPage}</strong></div></aside></div>
      </section>
    </main>
    {userModalOpen && <AdminModal title={editorUser ? 'Edit User' : 'Add New User'} subtitle={editorUser ? 'Update user profile details.' : 'Create a new user for your management team.'} className="admin-modal-user" onClose={closeEditor} footer={<><button className="admin-modal-button" type="button" onClick={closeEditor}>Cancel</button><button className="admin-modal-button admin-modal-button-primary" type="submit" form="admin-user-form">{editorUser ? 'Update User' : 'Create User'}</button></>}>
      <form id="admin-user-form" className="admin-modal-form" onSubmit={submitCustomer}>
        {editorUser && <div className="admin-user-picture-row">{form.image ? <img src={form.image} alt="User profile preview" /> : <span className="admin-user-picture-placeholder"><FaUserCircle /></span>}<label>Profile Picture<input type="file" accept="image/*" onChange={uploadUserImage} /><span className="admin-upload-link">Upload New Photo</span></label>{form.image && <button type="button" className="admin-text-danger" onClick={() => setForm((current) => ({ ...current, image: '' }))}>Remove</button>}</div>}
        <label>Full Name<input name="name" value={form.name} onChange={updateField} required autoFocus /></label>
        <label>Username<input name="username" value={form.username} onChange={updateField} required /></label>
        <label className="modal-field-wide">Email Address<input type="email" name="email" value={form.email} onChange={updateField} required /></label>
        <label>Role<select name="role" value={form.role} onChange={updateField}>{DUMMYJSON_ROLES.map((role) => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}</select></label>
        {editorUser ? <div className="admin-user-status"><span>Status <small>{form.status || 'Active'}</small></span><label className="admin-switch"><input type="checkbox" checked={(form.status || 'Active') === 'Active'} onChange={(event) => setForm((current) => ({ ...current, status: event.target.checked ? 'Active' : 'Inactive' }))} aria-label="User is active" /><span /></label></div> : <label>Password<input type="password" name="password" value={form.password} onChange={updateField} required minLength={8} autoComplete="new-password" /></label>}
        {!editorUser && <div className="admin-modal-note modal-field-wide"><FaInfoCircle /><span>This is a browser-only demo record. The password is not saved, and this record cannot sign in.</span></div>}
        {formError && <p className="admin-modal-error" role="alert">{formError}</p>}
      </form>
    </AdminModal>}
    {deleteTarget && <AdminModal title="Delete User Account?" subtitle="This action cannot be undone." className="admin-modal-user-delete" backdropClassName="admin-modal-backdrop-bottom" onClose={() => setDeleteTarget(null)} footer={<><button className="admin-modal-button" type="button" onClick={() => setDeleteTarget(null)}>Go Back</button><button className="admin-modal-button admin-modal-button-danger" type="button" onClick={() => { removeCustomer(deleteTarget); setDeleteTarget(null) }}><FaTrash /> Delete User</button></>}><div className="user-delete-summary">{deleteTarget.image ? <img src={deleteTarget.image} alt="" /> : <span>{deleteTarget.name?.charAt(0) || '?'}</span>}<div><strong>{deleteTarget.name}</strong><small>{deleteTarget.email}</small><em>{deleteTarget.role || 'user'}</em></div></div><p className="admin-modal-delete-copy">{deleteTarget.source === 'api' ? 'This hides the DummyJSON user from this browser. The account remains on DummyJSON.' : 'This removes the locally created user record from this browser.'}</p></AdminModal>}
  </>
}
