import React from 'react'

const C = {
  surface: '#16161f',
  border:  'rgba(255,255,255,0.07)',
  text:    '#f0f0f5',
  muted:   '#6b7280',
  subtle:  '#9ca3af',
  red:     '#f51111',
}

const OrderItem = ({ items = [] }) => {
  // Fallback demo rows when no items prop is passed
  const rows = items.length > 0 ? items : [
    { _id: '#P001', name: 'iPhone 15', image: 'https://serviceapi.spicezgold.com/download/1742462909156_gdgd1.jpg', qty: 1, price: 150 },
    { _id: '#P002', name: 'Samsung S24', image: 'https://serviceapi.spicezgold.com/download/1742462909156_gdgd1.jpg', qty: 2, price: 220 },
  ]

  const total = rows.reduce((sum, r) => sum + (r.price * (r.qty || 1)), 0)

  return (
    <div className='p-5' style={{ background: C.surface }}>
      <h3 className='text-[15px] font-[700] mb-4' style={{ color: C.text }}>Order Items</h3>

      {/* Table */}
      <div className='overflow-x-auto rounded-xl border' style={{ borderColor: C.border }}>
        <table className='w-full text-[13px]'>
          <thead>
            <tr style={{ background: '#111118', borderBottom: `1px solid ${C.border}` }}>
              {['Product ID', 'Image', 'Name', 'Qty', 'Unit Price', 'Subtotal'].map(h => (
                <th key={h} className='px-4 py-3 text-left text-[11px] font-[700] uppercase tracking-wider whitespace-nowrap'
                  style={{ color: C.muted }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td className='px-4 py-3'>
                  <span className='font-mono text-[11px] font-[600]' style={{ color: C.subtle }}>
                    {typeof row._id === 'string' ? row._id.slice(0, 8).toUpperCase() : row._id}
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <div className='w-10 h-10 rounded-xl overflow-hidden border flex-shrink-0'
                    style={{ borderColor: C.border, background: '#111118' }}>
                    <img
                      src={row.image || row.product_details?.image?.[0] || ''}
                      alt={row.name}
                      className='w-full h-full object-cover'
                    />
                  </div>
                </td>
                <td className='px-4 py-3 font-[600]' style={{ color: C.text }}>{row.name || '—'}</td>
                <td className='px-4 py-3'>
                  <span className='w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-[700]'
                    style={{ background: 'rgba(245,17,17,0.1)', color: C.red, display: 'inline-flex' }}>
                    {row.qty || row.quantity || 1}
                  </span>
                </td>
                <td className='px-4 py-3 font-[600]' style={{ color: C.subtle }}>
                  ${Number(row.price ?? row.sub_total ?? 0).toFixed(2)}
                </td>
                <td className='px-4 py-3 font-[700]' style={{ color: C.red }}>
                  ${(Number(row.price ?? row.sub_total ?? 0) * Number(row.qty || row.quantity || 1)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total row */}
      <div className='flex justify-end mt-4'>
        <div className='flex items-center gap-8 px-5 py-3 rounded-xl border'
          style={{ background: '#111118', borderColor: C.border }}>
          <span className='text-[13px] font-[600]' style={{ color: C.muted }}>Total</span>
          <span className='text-[18px] font-[800]' style={{ color: C.red }}>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderItem