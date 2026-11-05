import { useEffect, useMemo, useState } from 'react'
import { FaBell, FaBoxOpen, FaChartLine, FaCheckCircle, FaDownload, FaFilter, FaMoneyBillWave, FaSearch, FaStopwatch, FaTimesCircle } from 'react-icons/fa'
import { AdminNavigation } from '../../components/adminNavigation'
import { getOrders, updateOrderStatus } from '../../services/commerce'
import './admin.css'
import './ordersDashboard.css'
import './ordersDashboard.css'

const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
const pageSize = 4
const money = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function OrdersPage() {
  const [orders, setOrders] = useState(getOrders)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [alertsDismissed, setAlertsDismissed] = useState(false)
  const [openedAt] = useState(() => Date.now())

  useEffect(() => {
    const refresh = () => setOrders(getOrders())
    window.addEventListener('shopstream-commerce-updated', refresh)
    return () => window.removeEventListener('shopstream-commerce-updated', refresh)
  }, [])

  const changeStatus = (orderId, status) => {
    try {
      updateOrderStatus(orderId, status)
      setOrders(getOrders())
      setError('')
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const customer = order.customer || {}
    const matchesSearch = `${order.id} ${customer.name || ''} ${customer.email || ''}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (!statusFilter || order.status === statusFilter)
  }), [orders, search, statusFilter])
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize))
  const visibleOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize)
  const paginationPages = pageCount <= 4 ? Array.from({ length: pageCount }, (_, index) => index + 1)
    : page <= 2 ? [1, 2, 3, 'ellipsis', pageCount]
      : page >= pageCount - 1 ? [1, 'ellipsis', pageCount - 2, pageCount - 1, pageCount]
        : [1, 'ellipsis-start', page - 1, page, page + 1, 'ellipsis-end', pageCount]
  const activeOrders = orders.filter((order) => ['Pending', 'Processing', 'Shipped'].includes(order.status))
  const openRevenue = activeOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const averageOrder = orders.length ? orders.reduce((sum, order) => sum + Number(order.total || 0), 0) / orders.length : 0
  const cancelledOrders = orders.filter((order) => order.status === 'Cancelled')
  const cancelRate = orders.length ? (cancelledOrders.length / orders.length) * 100 : 0
  const oldPending = orders.filter((order) => order.status === 'Pending' && openedAt - new Date(order.createdAt).getTime() > 48 * 60 * 60 * 1000)
  const deliveredCount = orders.filter((order) => order.status === 'Delivered').length
  const deliveredPercent = orders.length ? Math.round((deliveredCount / orders.length) * 100) : 0

  const exportCsv = () => {
    const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const rows = [['Order ID', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Created'], ...filteredOrders.map((order) => [order.id, order.customer?.name, order.customer?.email, order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0), order.total, order.status, order.createdAt])]
    const csv = rows.map((row) => row.map(escape).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'shopstream-orders.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const setSearchFilter = (value) => { setSearch(value); setPage(1) }
  const setStatus = (value) => { setStatusFilter(value); setPage(1) }

  return <main className="admin-page orders-page">
    <header className="orders-heading">
      <div><h1>Order Management</h1><p>Oversee and monitor all customer orders.</p></div>
      <div className="orders-heading-tools">
        <label className="orders-search"><FaSearch aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearchFilter(event.target.value)} placeholder="Search orders, users, or IDs..." /></label>
        <div className="orders-filter-wrap"><button className="orders-filter-button" type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><FaFilter /> Filter</button>
          {filtersOpen && <label className="orders-filter-popover">Order status<select value={statusFilter} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>}
        </div>
      </div>
    </header>
    <AdminNavigation linksToShow={['/admin/inventory', '/admin/orders', '/admin/customers']} />
    {error && <p className="admin-form-error orders-error" role="alert">{error}</p>}

    <section className="orders-metrics" aria-label="Order metrics">
      <article><span className="orders-metric-icon metric-purple"><FaBoxOpen /></span><small>ACTIVE ORDERS</small><strong>{activeOrders.length.toLocaleString('en-US')}</strong><em className="metric-positive">{orders.length} total orders</em></article>
      <article><span className="orders-metric-icon metric-green"><FaMoneyBillWave /></span><small>OPEN ORDER VALUE</small><strong>{money(openRevenue)}</strong><em className="metric-positive">Pending fulfillment</em></article>
      <article><span className="orders-metric-icon metric-blue"><FaStopwatch /></span><small>AVG. ORDER VALUE</small><strong>{money(averageOrder)}</strong><em>Across all orders</em></article>
      <article><span className="orders-metric-icon metric-red"><FaChartLine /></span><small>CANCEL RATE</small><strong>{cancelRate.toFixed(1)}%</strong><em className={cancelRate ? 'metric-negative' : 'metric-positive'}>{cancelledOrders.length} cancelled</em></article>
    </section>

    <section className="orders-activity-panel" aria-label="Recent order activity">
      <div className="orders-panel-heading"><h2>Recent Order Activity</h2><div><button type="button" aria-label="Export orders CSV" title="Export CSV" onClick={exportCsv}><FaDownload /></button><button type="button" aria-label="Toggle filters" title="Filters" onClick={() => setFiltersOpen((open) => !open)}><span>⋮</span></button></div></div>
      <div className="orders-table-scroll"><table className="orders-table"><thead><tr><th>ORDER ID</th><th>USER</th><th>TOTAL ITEMS</th><th>TOTAL PRICE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>
        {visibleOrders.map((order) => <tr key={order.id}>
          <td><strong className="orders-id">#{order.id}</strong></td>
          <td><div className="orders-customer-cell"><span>{(order.customer?.name || 'Customer').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div><strong>{order.customer?.name || 'Customer'}</strong><small>{order.customer?.email || 'No email'}</small></div></div></td>
          <td>{order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0} items</td>
          <td className="orders-price">{money(order.total)}</td>
          <td><span className={`orders-status status-${String(order.status || 'pending').toLowerCase()}`}><i />{order.status}</span></td>
          <td><label className="orders-action-select"><span className="visually-hidden">Update status for {order.id}</span><select value={order.status} onChange={(event) => changeStatus(order.id, event.target.value)} disabled={order.status === 'Cancelled'}>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></label></td>
        </tr>)}
      </tbody></table></div>
      {!visibleOrders.length && <div className="orders-table-empty"><h3>{orders.length ? 'No matching orders' : 'No orders yet'}</h3><p>{orders.length ? 'Try another search or status filter.' : 'Orders placed through checkout will appear here.'}</p></div>}
      <div className="orders-table-footer"><span>Showing {filteredOrders.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredOrders.length)} of {filteredOrders.length.toLocaleString('en-US')} results</span><div><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button>{paginationPages.map((pageNumber, index) => pageNumber.toString().startsWith('ellipsis') ? <span key={`${pageNumber}-${index}`}>…</span> : <button type="button" key={pageNumber} className={page === pageNumber ? 'active' : ''} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}<button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>›</button></div></div>
    </section>

    <section className="orders-bottom-grid" aria-label="Order insights and alerts">
      <article className="orders-insight-card"><span className="orders-insight-kicker">FULFILLMENT INSIGHT</span><div className="orders-insight-content"><span className="orders-insight-icon"><FaCheckCircle /></span><div><h2>{activeOrders.length ? 'Keep orders moving' : 'You’re all caught up'}</h2><p>{activeOrders.length ? `${activeOrders.length} orders are awaiting fulfillment. Update each order’s status as it moves through packing and delivery.` : 'New customer orders will appear here with their fulfillment status and order details.'}</p></div></div><div className="orders-insight-progress"><span><i style={{ width: `${deliveredPercent}%` }} /></span><small>{orders.length ? `${deliveredPercent}% delivered` : 'No delivery data yet'}</small></div></article>
      <aside className="orders-alert-card"><div className="orders-alert-heading"><FaBell /><strong>System Alerts</strong><span>{alertsDismissed ? 0 : oldPending.length + cancelledOrders.length}</span></div><div className="orders-alert-list">
        {!alertsDismissed && oldPending.length > 0 && <p className="alert-warning"><FaTimesCircle /> {oldPending.length} pending {oldPending.length === 1 ? 'order needs' : 'orders need'} attention for over 48 hours.</p>}
        {!alertsDismissed && cancelledOrders.length > 0 && <p className="alert-info"><FaTimesCircle /> {cancelledOrders.length} cancelled {cancelledOrders.length === 1 ? 'order' : 'orders'} {cancelledOrders.length === 1 ? 'was' : 'were'} returned to inventory.</p>}
        {(alertsDismissed || (!oldPending.length && !cancelledOrders.length)) && <p className="alert-clear"><FaCheckCircle /> No urgent order alerts right now.</p>}
      </div><button type="button" disabled={alertsDismissed} onClick={() => setAlertsDismissed(true)}>{alertsDismissed ? 'Alerts Dismissed' : 'Dismiss All'}</button></aside>
    </section>
  </main>
}
