import React from 'react'
import { LuPackageSearch } from 'react-icons/lu'
import { IoCloseOutline } from 'react-icons/io5'

const C = {
  surface: '#455069',
  border: '#2a3040',
  text: '#ffffff',
  muted: '#9ca3af',
  red: '#f51111',
}

const SearchBox = ({ onSearch, placeholder = 'Search here…' }) => {
  const [value, setValue] = React.useState('')
  const [focused, setFocused] = React.useState(false)
  const timerRef = React.useRef(null)

  const handleChange = (e) => {
    const q = e.target.value
    setValue(q)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onSearch?.(q.trim())
    }, 400)
  }

  const handleClear = () => {
    setValue('')
    clearTimeout(timerRef.current)
    onSearch?.('')
  }

  React.useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div className='relative flex items-center w-full max-w-[280px]'>

      {/* Search icon */}
      <LuPackageSearch
        size={16}
        className='absolute left-3'
        style={{
          color: focused ? C.red : C.muted,
          transition: '0.2s'
        }}
      />

      {/* Input */}
      <input
        type='text'
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className='w-full h-[40px] pl-10 pr-9 rounded-lg text-[13px] outline-none'
        style={{
          background: C.surface,
          border: `1px solid ${focused ? C.red : C.border}`,
          color: C.text,
        }}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          className='absolute right-2 flex items-center justify-center w-6 h-6 rounded-md'
          style={{
            background: '#2a3040',
            color: C.muted,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(245,17,17,0.15)'
            e.currentTarget.style.color = C.red
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#2a3040'
            e.currentTarget.style.color = C.muted
          }}
        >
          <IoCloseOutline size={16} />
        </button>
      )}
    </div>
  )
}

export default SearchBox