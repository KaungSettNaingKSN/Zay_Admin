import React from 'react'
import InnerImageZoom from 'react-inner-image-zoom'
import 'react-inner-image-zoom/src/styles.css'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'; import 'swiper/css/navigation'
import { Navigation } from 'swiper/modules'
import { useParams } from 'react-router-dom'
import { fetchData } from '../../utils/api'
import Rating from '@mui/material/Rating'
import Skeleton from '@mui/material/Skeleton'

const C = {
  bg:       '#0f1117',   // main background (not pure black)
  surface:  '#161a23',   // sidebar / panels
  card:     '#1f2430',   // cards / containers

  border:   'rgba(255,255,255,0.08)',

  red:      '#f51111',
  redGlow:  'rgba(245,17,17,0.22)',
  redSoft:  'rgba(245,17,17,0.12)',

  text:     '#f5f6fa',   // brighter text
  muted:    '#a1a1aa',   // secondary text
  subtle:   '#6b7280',   // helper text
}
const skelSx = { bgcolor:'rgba(255,255,255,0.06)', borderRadius:1 }

const InfoCell = ({ label, value, accent }) => (
  <div className='rounded-xl p-3 border' style={{ background:C.surface, borderColor:C.border }}>
    <span className='text-[10px] font-[600] uppercase tracking-wider block' style={{ color:C.muted }}>{label}</span>
    <p className='text-[13px] font-[700] mt-0.5' style={{ color: accent||C.text }}>{value}</p>
  </div>
)

const ProductDetails = () => {
  const { id } = useParams()
  const [product,    setProduct]    = React.useState(null)
  const [loading,    setLoading]    = React.useState(true)
  const [slideIndex, setSlideIndex] = React.useState(0)
  const zoomSliderBig   = React.useRef()
  const zoomSliderSmall = React.useRef()

  React.useEffect(() => {
    const load = async () => {
      try { setLoading(true); const res = await fetchData(`/api/product/${id}`); setProduct(res.data?.product||null) }
      catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  const goto = i => { setSlideIndex(i); zoomSliderSmall.current?.slideTo(i); zoomSliderBig.current?.slideTo(i) }

  if (loading) return (
    <div className='p-6 min-h-screen' style={{ background:C.bg }}>
      <div className='flex flex-col lg:flex-row gap-8'>
        <div className='flex gap-3 w-full lg:w-[45%]'>
          <div className='w-[15%] flex flex-col gap-2'>
            {[...Array(4)].map((_, i) => <Skeleton key={i} variant='rectangular' height={90} sx={skelSx} />)}
          </div>
          <Skeleton variant='rectangular' className='flex-1' height={400} sx={skelSx} />
        </div>
        <div className='flex-1 flex flex-col gap-3'>
          {[...Array(6)].map((_, i) => <Skeleton key={i} width={`${[60,40,30,80,80,50][i]}%`} height={[36,24,32,20,20,20][i]} sx={skelSx} />)}
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className='p-6 min-h-screen flex items-center justify-center' style={{ background:C.bg }}>
      <div className='text-center'>
        <p className='text-[18px] font-[700]' style={{ color:C.text }}>Product not found</p>
        <p className='text-[13px] mt-1' style={{ color:C.muted }}>The product may have been deleted</p>
      </div>
    </div>
  )

  const images = product.images?.length ? product.images : []
  const discount = product.discount || 0

  return (
    <div className='p-5 min-h-screen' style={{ background:C.bg }}>
      <div className='fixed pointer-events-none' style={{ width:'500px', height:'500px', borderRadius:'50%', background:`radial-gradient(circle, ${C.redGlow} 0%, transparent 70%)`, top:'-150px', right:'-100px', opacity:0.2, zIndex:0 }} />

      <div className='relative z-10 flex flex-col lg:flex-row gap-6'>

        {/* ── Image gallery ── */}
        <div className='flex gap-3 w-full lg:w-[45%]'>
          {/* Thumbnails */}
          <div className='w-[70px] flex-shrink-0'>
            <Swiper onSwiper={s => zoomSliderSmall.current=s} direction='vertical' slidesPerView={4} spaceBetween={6}
              modules={[Navigation]} className='imageSwiper h-[380px]'>
              {images.map((img, i) => (
                <SwiperSlide key={i}>
                  <div onClick={() => goto(i)} className='overflow-hidden rounded-xl cursor-pointer border-2 transition-all'
                    style={{ borderColor: slideIndex===i ? C.red : C.border, boxShadow: slideIndex===i ? `0 0 10px ${C.redGlow}` : 'none' }}>
                    <img src={img} alt='' className='w-full h-[60px] object-cover' />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          {/* Main image */}
          <div className='flex-1 overflow-hidden rounded-2xl border' style={{ borderColor:C.border, background:C.card, height:'380px' }}>
            <Swiper onSwiper={s=>zoomSliderBig.current=s} slidesPerView={1} spaceBetween={0}
              onSlideChange={s=>setSlideIndex(s.activeIndex)}>
              {images.map((img, i) => (
                <SwiperSlide key={i}>
                  <InnerImageZoom zoomType='hover' zoomScale={1.5} src={img} className='object-cover w-full h-[380px]' />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* ── Product info ── */}
        <div className='flex-1 flex flex-col gap-4'>
          <div>
            <h2 className='text-[22px] font-[900] tracking-tight leading-tight' style={{ color:C.text }}>{product.name}</h2>
            {product.brand && <p className='text-[13px] mt-1' style={{ color:C.muted }}>Brand: <span style={{ color:C.subtle }}>{product.brand}</span></p>}
          </div>

          <div className='flex items-center gap-2'>
            <Rating value={product.rating||0} size='small' readOnly precision={0.5}
              sx={{ '& .MuiRating-iconFilled':{ color:C.red } }} />
            <span className='text-[12px]' style={{ color:C.muted }}>({product.rating||0})</span>
          </div>

          <div className='flex items-center gap-3 flex-wrap'>
            <span className='text-[28px] font-[900] tracking-tight' style={{ color:C.red }}>${product.price}</span>
            {product.oldPrice > product.price && <span className='text-[18px] line-through' style={{ color:C.muted }}>${product.oldPrice}</span>}
            {discount > 0 && (
              <span className='text-[12px] font-[700] px-2.5 py-1 rounded-full' style={{ background:'rgba(34,197,94,0.12)', color:'#22c55e' }}>
                {discount}% OFF
              </span>
            )}
          </div>

          {product.description && (
            <div className='rounded-2xl border p-4' style={{ background:C.card, borderColor:C.border }}>
              <h4 className='text-[11px] font-[700] uppercase tracking-wider mb-2' style={{ color:C.muted }}>Description</h4>
              <p className='text-[13px] leading-relaxed' style={{ color:C.subtle }}>{product.description}</p>
            </div>
          )}

          {/* Info grid */}
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
            {product.catName && <InfoCell label='Category' value={product.catName} />}
            {product.subCatName && <InfoCell label='Sub Category' value={product.subCatName} />}
            {product.thirdsubCatName && <InfoCell label='Third Category' value={product.thirdsubCatName} />}
            <InfoCell label='In Stock' value={product.countInStock>0 ? `${product.countInStock} units` : 'Out of stock'} accent={product.countInStock>0 ? '#22c55e' : '#f87171'} />
            <InfoCell label='Sales' value={`${product.sale??0} sold`} />
            <InfoCell label='Featured' value={product.isFeatured ? 'Yes' : 'No'} accent={product.isFeatured ? C.red : C.muted} />
          </div>

          {/* Chips */}
          {[
            { label:'RAM Options', items: product.productRam, key:'ram' },
            { label:'Weight Options', items: product.productWeight, key:'weight' },
            { label:'Size Options', items: product.size, key:'size' },
          ].filter(s => s.items?.length > 0).map(section => (
            <div key={section.key}>
              <h4 className='text-[11px] font-[700] uppercase tracking-wider mb-2' style={{ color:C.muted }}>{section.label}</h4>
              <div className='flex flex-wrap gap-2'>
                {section.items.map(item => (
                  <span key={item} className='text-[12px] font-[600] px-3 py-1.5 rounded-xl border'
                    style={{ background:C.surface, color:C.text, borderColor:C.border }}>{item}</span>
                ))}
              </div>
            </div>
          ))}

          {product.productColor?.length > 0 && (
            <div>
              <h4 className='text-[11px] font-[700] uppercase tracking-wider mb-2' style={{ color:C.muted }}>Color Options</h4>
              <div className='flex flex-wrap gap-2'>
                {product.productColor.map(c => (
                  <div key={c._id} className='flex items-center gap-2 px-3 py-1.5 rounded-xl border'
                    style={{ background:C.surface, borderColor:C.border }}>
                    <div className='w-4 h-4 rounded-full border flex-shrink-0'
                      style={{ background:c.color, borderColor:'rgba(255,255,255,0.2)', boxShadow:`0 0 8px ${c.color}66` }} />
                    <span className='text-[12px] font-[600]' style={{ color:C.text }}>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default ProductDetails