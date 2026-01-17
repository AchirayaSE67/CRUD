import { Hono } from 'hono'
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'

const libraryRoutes = new Hono()

const bookSchema = z.object({
  BookID: z.number()
    .int("ID ต้องเป็นจำนวนเต็มเท่านั้น"),
  Title: z.string(),
  ISBN: z.string(),
  YearPublished: z.number(),
  Category: z.string(),
})


let books = [
  { BookID: 10001, Title: "Learn Hono", ISBN: "1234567890123", YearPublished: 2024, Category: "Technology" }
]

libraryRoutes.get('/', (c) => {
  return c.json({ 
    success: true,
    message: 'รายการหนังสือทั้งหมด', 
    data: books 
  })
})

libraryRoutes.post('/', 
  zValidator('json', bookSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400)
    }
  }),
  async (c) => {
    const body = await c.req.json()
    books.push(body)
    return c.json({ 
      success: true,
      message: 'บันทึกข้อมูลหนังสือเรียบร้อยแล้ว', 
      data: body 
    }, 201)
  }
)

libraryRoutes.delete('/:id', (c) => {
  const id = Number(c.req.param('id'))
  const initialLength = books.length
  
  books = books.filter(b => b.BookID !== id)
  
  if (books.length === initialLength) {
    return c.json({ success: false, message: 'ไม่พบหนังสือที่ต้องการลบ' }, 404)
  }
  
  return c.json({ success: true, message: `ลบหนังสือ ID: ${id} เรียบร้อยแล้ว` })
})

libraryRoutes.put('/:id', 
  zValidator('json', bookSchema, (result, c) => {
    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400)
    }
  }), 
  async (c) => {
    const id = Number(c.req.param('id'))
    const body = await c.req.json()
    
    const index = books.findIndex(b => b.BookID === id)
    
    if (index === -1) {
      return c.json({ 
        success: false, 
        message: 'ไม่พบหนังสือที่ต้องการแก้ไข' 
      }, 404)
    }
    
    books[index] = { ...body, BookID: id }
    
    return c.json({ 
      success: true,
      message: 'แก้ไขข้อมูลสำเร็จ', 
      data: books[index] 
    })
})

export default libraryRoutes